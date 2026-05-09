/**
 * midiParser.js — Browser-based MIDI file parser (no dependencies)
 * Ported from tools/midi2strudel/midi2strudel.py
 */

/**
 * @typedef {Object} MidiNote
 * @property {number} pitch - MIDI note number (0-127)
 * @property {number} velocity - 0-127
 * @property {number} startTick - Absolute tick position
 * @property {number} durationTicks - Duration in ticks
 * @property {number} channel - MIDI channel (0-15)
 */

/**
 * @typedef {Object} MidiTrack
 * @property {string} name - Track name
 * @property {MidiNote[]} notes - Notes in this track
 * @property {number} channel - Dominant channel
 */

/**
 * @typedef {Object} MidiFile
 * @property {number} formatType - MIDI format (0 or 1)
 * @property {number} numTracks
 * @property {number} ticksPerBeat
 * @property {number} tempo - Microseconds per beat
 * @property {MidiTrack[]} tracks
 */

/**
 * Read a variable-length quantity from a DataView
 * @param {DataView} view
 * @param {number} offset
 * @returns {[number, number]} [value, newOffset]
 */
function readVarLen(view, offset) {
  let value = 0;
  while (offset < view.byteLength) {
    const byte = view.getUint8(offset);
    offset++;
    value = (value << 7) | (byte & 0x7f);
    if (!(byte & 0x80)) break;
  }
  return [value, offset];
}

/**
 * Parse a MIDI file from an ArrayBuffer
 * @param {ArrayBuffer} buffer
 * @returns {MidiFile}
 */
export function parseMidiFile(buffer) {
  const view = new DataView(buffer);
  const decoder = new TextDecoder('latin1');

  const midi = {
    formatType: 0,
    numTracks: 0,
    ticksPerBeat: 480,
    tempo: 500000, // 120 BPM default
    tracks: [],
  };

  let offset = 0;

  // --- Header chunk ---
  const headerId = decoder.decode(new Uint8Array(buffer, offset, 4));
  if (headerId !== 'MThd') throw new Error(`Not a valid MIDI file (header: ${headerId})`);
  offset += 4;

  const headerLength = view.getUint32(offset);
  offset += 4;

  midi.formatType = view.getUint16(offset);
  offset += 2;
  midi.numTracks = view.getUint16(offset);
  offset += 2;
  midi.ticksPerBeat = view.getUint16(offset);
  offset += 2;

  // Skip remaining header bytes
  offset = 8 + headerLength;

  // --- Track chunks ---
  for (let trackIdx = 0; trackIdx < midi.numTracks; trackIdx++) {
    if (offset >= view.byteLength) break;

    // Find MTrk
    const chunkId = decoder.decode(new Uint8Array(buffer, offset, 4));
    if (chunkId !== 'MTrk') {
      // Search forward
      let found = false;
      for (let i = offset; i < view.byteLength - 4; i++) {
        if (
          view.getUint8(i) === 0x4d &&
          view.getUint8(i + 1) === 0x54 &&
          view.getUint8(i + 2) === 0x72 &&
          view.getUint8(i + 3) === 0x6b
        ) {
          offset = i;
          found = true;
          break;
        }
      }
      if (!found) break;
    }
    offset += 4;

    const trackLength = view.getUint32(offset);
    offset += 4;
    const trackEnd = offset + trackLength;

    const track = { name: '', notes: [], channel: 0, program: null };
    let absoluteTick = 0;
    let runningStatus = 0;
    const activeNotes = new Map(); // key: `${pitch}-${channel}`

    while (offset < trackEnd) {
      const [delta, newOff] = readVarLen(view, offset);
      offset = newOff;
      absoluteTick += delta;

      if (offset >= trackEnd) break;

      let byte = view.getUint8(offset);
      let status;

      if (byte & 0x80) {
        status = byte;
        offset++;
      } else {
        status = runningStatus;
      }

      const eventType = status & 0xf0;
      const channel = status & 0x0f;

      if (eventType === 0x90) {
        // Note On
        runningStatus = status;
        if (offset + 1 >= view.byteLength) break;
        const pitch = view.getUint8(offset);
        const velocity = view.getUint8(offset + 1);
        offset += 2;

        if (velocity > 0) {
          activeNotes.set(`${pitch}-${channel}`, {
            pitch,
            velocity,
            startTick: absoluteTick,
            durationTicks: 0,
            channel,
          });
        } else {
          // Note Off (velocity 0)
          const key = `${pitch}-${channel}`;
          if (activeNotes.has(key)) {
            const note = activeNotes.get(key);
            note.durationTicks = absoluteTick - note.startTick;
            track.notes.push(note);
            activeNotes.delete(key);
          }
        }
      } else if (eventType === 0x80) {
        // Note Off
        runningStatus = status;
        if (offset + 1 >= view.byteLength) break;
        const pitch = view.getUint8(offset);
        offset += 2;

        const key = `${pitch}-${channel}`;
        if (activeNotes.has(key)) {
          const note = activeNotes.get(key);
          note.durationTicks = absoluteTick - note.startTick;
          track.notes.push(note);
          activeNotes.delete(key);
        }
      } else if (eventType === 0xa0 || eventType === 0xb0 || eventType === 0xe0) {
        runningStatus = status;
        offset += 2;
      } else if (eventType === 0xc0) {
        // Program Change — extract instrument number
        runningStatus = status;
        if (offset < view.byteLength) {
          if (track.program == null) {
            track.program = view.getUint8(offset);
          }
        }
        offset += 1;
      } else if (eventType === 0xd0) {
        runningStatus = status;
        offset += 1;
      } else if (status === 0xff) {
        // Meta event
        if (offset >= view.byteLength) break;
        const metaType = view.getUint8(offset);
        offset++;
        const [length, off2] = readVarLen(view, offset);
        offset = off2;

        if (metaType === 0x03) {
          // Track name
          track.name = decoder.decode(new Uint8Array(buffer, offset, length)).trim();
        } else if (metaType === 0x51) {
          // Tempo
          if (length >= 3) {
            midi.tempo =
              (view.getUint8(offset) << 16) | (view.getUint8(offset + 1) << 8) | view.getUint8(offset + 2);
          }
        } else if (metaType === 0x2f) {
          // End of track
          offset += length;
          break;
        }
        offset += length;
      } else if (status === 0xf0 || status === 0xf7) {
        // SysEx
        const [length, off2] = readVarLen(view, offset);
        offset = off2 + length;
      } else {
        offset++;
      }
    }

    // Close remaining active notes
    for (const note of activeNotes.values()) {
      note.durationTicks = absoluteTick - note.startTick;
      track.notes.push(note);
    }

    // Determine dominant channel
    if (track.notes.length > 0) {
      const channelCounts = {};
      for (const n of track.notes) {
        channelCounts[n.channel] = (channelCounts[n.channel] || 0) + 1;
      }
      track.channel = Number(
        Object.entries(channelCounts).sort((a, b) => b[1] - a[1])[0][0],
      );
    }

    track.notes.sort((a, b) => a.startTick - b.startTick || a.pitch - b.pitch);
    midi.tracks.push(track);
    offset = trackEnd;
  }

  return midi;
}

/**
 * Get BPM from parsed MIDI
 */
export function getMidiBpm(midi) {
  return 60_000_000 / midi.tempo;
}
