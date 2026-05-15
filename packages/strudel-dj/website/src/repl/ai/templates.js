/**
 * Genre Templates - High-quality few-shot examples for LLM generation
 * Source: strudel-claude-music-generator patterns + live-coding-music-mcp examples
 * 
 * Each genre has 'simple' and 'advanced' templates that demonstrate
 * correct Strudel syntax, proper sound usage, and professional structure.
 */

export const GENRE_TEMPLATES = {
  house: {
    simple: `// Deep House - KAIXI Section Architecture @ 124 BPM
setCpm(124/4)
await vital('Jupiter Bass')
await vital('Analog Pad')
await vital('E Piano')

// ═══ LAYER 1: Instruments ═══
const kick = s("bd*4").gain(0.95).lpf(200)
const hats = arrange([4, "<[~ hh ~ hh] [hh*8] [~ hh ~ hh] [hh*8]>*4"])
  .s().bank("RolandTR808").gain(0.35).hpf(6000)
const clap = s("~ cp ~ cp").gain(0.6).bank("RolandTR808").room(0.15)
const drums = stack(kick, hats, clap)

const bass = arrange(
  [4, n("<0 0 3 5> <0 0 5 3>").scale("C2:minor").s("vital_jupiter_bass")],
  [2, n("<0 3 5 7>").scale("C2:minor").s("vital_jupiter_bass").gain(0.9)]
).lpf(sine.range(300, 800).slow(8)).gain(0.75)

const chords = n("[0,2,4] ~ [3,5,0] ~").scale("C4:minor").s("vital_e_piano")
  .gain(0.4).room(0.3).delay(0.125)

const pad = n("<0 2 4 6> <3 5 7 0>").scale("C3:minor").s("vital_analog_pad")
  .gain(0.2).room(0.5).slow(4)

// ═══ LAYER 2: Sections ═══
const section_1 = stack(kick, hats)  // Intro: just rhythm
const section_2 = stack(drums.mask("<1 [1 1 1 [1 0]]>/4"), bass)  // Build: add bass
const section_3 = stack(drums, bass, chords.mask("<[1 0] 1 1 1>/4"))  // Verse: + chords
const section_4 = stack(drums, bass, chords, pad.mask("<0 0 1 1>/4"))  // Peak: everything
const section_5 = stack(drums.mask("<1 [1 0] 1 [1 0]>/4"), bass, chords)  // Bridge: sparse drums

// ═══ LAYER 3: Timeline ═══
arrange(
  [8, section_1],   // 0-8:  Intro (just rhythm)
  [8, section_2],   // 8-16: Build (add bass, mask drums)
  [16, section_3],  // 16-32: Verse (add chords)
  [8, section_4],   // 32-40: Peak (everything + pad)
  [8, section_5],   // 40-48: Bridge (pull back)
  [4, section_1]    // 48-52: Outro (just rhythm)
)`,
    advanced: `// Progressive House - Full KAIXI Architecture @ 128 BPM
setCpm(128/4)
const energy = slider(0.6, 0, 1, 0.01)

await vital('Jupiter Bass')
await vital('Super Pluck')
await vital('LD - Supersaw')
await vital('Analog Pad')

// ═══ Instruments ═══
const kick = s("bd*4").gain(0.92).lpf(200)
const hats = s("hh*8").gain(energy.mul(0.25).add(0.1)).hpf(6000).pan(perlin.range(0.3, 0.7))
const clap = s("~ cp ~ ~").gain(0.55).hpf(800)
const rim = s("~ [~ rim] ~ rim").gain(0.28).hpf(2000)
const drums = stack(kick, hats, clap, rim)

const bass = arrange(
  [2, n("<0 0 5 3>*2").scale("A2:minor")],
  [2, n("<0 3 7 5>*2").scale("A2:minor")]
).s("vital_jupiter_bass").lpf(energy.mul(700).add(200)).gain(0.8)

const pluck = n("0 [2 ~] 4 ~ 5 [~ 3] 2 0").scale("A4:minor")
  .s("vital_super_pluck").gain(0.45).delay(0.2).room(0.25)

const saw = n("<[0,3,5] [2,5,7] [4,7,2] [3,5,0]>").scale("A3:minor")
  .s("vital_ld_supersaw").lpf(energy.mul(2000).add(500)).gain(0.35).room(0.4).slow(2)

const pad = n("~ 7 ~ ~ ~ 5 ~ ~").scale("A4:minor").s("vital_analog_pad")
  .gain(0.08).room(0.65).slow(4)

const fill = s("bd bd bd bd -").gain(1.15)

// ═══ Sections ═══
const section_1 = kick
const section_2 = stack(drums.mask("<1 [1 1 1 [1 0]]>/4"), bass)
const section_3 = stack(drums, bass, pluck.mask("<[0 1] 1 1 [1 0]>/4"))
const section_4 = stack(drums, bass.lpf("<20000 [20000 20000 20000 500]>/4"), pluck, saw.mask("<0 0 1 1>/4"), pad)
const section_5 = stack(drums.mask("<1 [1 0] 1 [1 0]>/4"), bass, saw.mask("<0 1 0 1>/4"))
const section_6 = stack(kick, hats).mask("<1 1 0 0>/2")

arrange(
  [8, section_1],     // Intro: just kick
  [8, section_2],     // Build: add drums + bass
  [16, section_3],    // Verse: add pluck
  [8, section_4],     // Peak: everything + filter opens + pad
  [4, section_5],     // Bridge: pull back
  [8, section_4],     // Return to peak
  [4, fill],          // Transition fill
  [4, section_6]      // Outro: fade out
)`,
  },

  techno: {
    simple: `// Minimal Techno - KAIXI Architecture @ 132 BPM
setCpm(132/4)
await vital('Jupiter Bass')

// ═══ Instruments ═══
const kick = s("bd*4").gain(0.92).lpf(180).shape(0.1)
const snare = s("~ sd ~ sd").gain(0.6).hpf(400)
const hats = arrange(
  [4, s("hh*16").gain(sine.range(0.2, 0.4).slow(4)).hpf(8000)],
  [2, s("[~ rd]*4").gain(0.18).hpf(8000).pan(0.7)]
)
const drums = stack(kick, snare, hats)

const bass = arrange(
  [4, n("<0 0 0 -2>*4").scale("E2:minor").s("vital_jupiter_bass")
      .lpf(sine.range(300, 1200).slow(8)).shape(0.2)],
  [2, n("<0 0 -2 0>*4").scale("E2:minor").s("vital_jupiter_bass").gain(0.85)]
).gain(0.75)

// ═══ Sections ═══
const section_1 = kick
const section_2 = stack(drums.mask("<1 [1 1 [0 1] 1]>/4"), bass.mask("<0 0 1 1>/2"))
const section_3 = stack(drums, bass)
const section_4 = stack(drums.mask("<1 [1 0] 1 1>/4"), bass.mask("<1 1 1 0>/2"))
const section_5 = stack(s("bd ~ bd ~").gain(0.8), hats)

arrange(
  [16, section_1],  // Intro: kick only
  [16, section_2],  // Build: sparse drums + bass
  [32, section_3],  // Peak: everything
  [8, section_4],   // Bridge: masks drop elements
  [8, section_5]    // Outro: half-time
)`,
    advanced: `// Industrial Techno - Full KAIXI Architecture @ 138 BPM
setCpm(138/4)
const drive = slider(0.5, 0, 1, 0.01)
const darkness = slider(0.6, 0, 1, 0.01)

await vital('Jupiter Bass')
await vital('Synth Brass - Super Stab')
await vital('LEAD Coral')

// ═══ Instruments ═══
const kick = s("bd*4").gain(0.95).lpf(200).shape(drive.mul(0.3))
const hats = s("hh*16").gain(drive.mul(0.25).add(0.1)).hpf(8000).pan(perlin.range(0.3, 0.7))
const clap = s("~ cp ~ [cp ~]").gain(0.6).shape(drive.mul(0.2))
const ride = s("[~ rd]*4").gain(0.18).hpf(10000)
const drums = stack(kick, hats, clap, ride)
const drums_break = s("bd ~ ~ ~ bd ~ ~ ~").gain(0.7)

const bass = n("<0 0 0 -2>*4").scale("A1:minor").s("vital_jupiter_bass")
  .lpf(darkness.mul(800).add(200)).shape(0.4).gain(0.8)

const stab = n("~ [0,3,6] ~ ~").scale("A3:minor").s("vital_synth_brass_super_stab")
  .lpf(darkness.mul(2000).add(500)).gain(0.4).delay(0.125)

const lead = n("~ 7 ~ 5 ~ 3 ~ 0").scale("A4:minor").s("vital_lead_coral")
  .lpf(darkness.mul(3000).add(800)).gain(0.3).delay(0.25).room(0.25)

// ═══ Sections ═══
const section_1 = kick
const section_2 = stack(drums.mask("<1 [1 1 1 [1 0]]>/4"), bass.mask("<0 0 1 1>/2"))
const section_3 = stack(drums, bass.lpf("<20000 [20000 20000 1200 500]>/4"),
                        stab.mask("<[0 1] 1 1 [1 0]>/4"))
const section_4 = stack(drums, bass, stab, lead.mask("<0 0 1 1>/2"))
const section_5 = stack(drums.mask("<1 [1 0] 1 [1 0]>/4"), bass.mask("<1 1 1 0>/2"))

arrange(
  [16, section_1],    // Intro: kick only
  [16, section_2],    // Build: add hats + bass
  [32, section_3],    // Drop: + stab, filter opens
  [8, section_4],     // Peak: + lead
  [8, drums_break],   // Breakdown
  [16, section_3],    // Return: drop again
  [8, section_5],     // Bridge: masks create space
  [4, kick]           // Outro: just kick
)`,
  },
  jazz: {
    simple: `// Modal Jazz - KAIXI Architecture @ 95 BPM
setCpm(95/4)
await vital('E Piano')
await vital('Analog Pad')

// ═══ Instruments ═══
const ride = s("rd*3 [rd rd]").gain(0.28).hpf(6000)
const drums = stack(
  s("bd ~ ~ [~ bd] ~ ~ bd ~").gain(0.45).lpf(200),
  s("~ [~ sd] ~ [sd ~]").gain(0.3).hpf(600).room(0.25),
  ride
)
const bass = n("0 2 4 5 3 1 6 4").scale("D2:dorian").s("vital_e_piano").gain(0.55).room(0.2).decay(0.8)
const chords = n("[0,2,4] ~ [3,5,0] ~").scale("D3:dorian").s("vital_e_piano").gain(0.4).room(0.3).delay(0.1)
const pad = n("<0 2 4 6> <3 5 7 0>").scale("D3:dorian").s("vital_analog_pad").gain(0.15).room(0.45).slow(4)

const section_1 = ride; const section_2 = stack(drums, bass.mask("<0 0 1 1>/2"))
const section_3 = stack(drums, bass, chords.mask("<[0 1] 1 1 [1 0]>/4"))
const section_4 = stack(drums, bass, chords, pad); const section_5 = stack(ride, chords)

arrange([4, section_1], [16, section_2], [16, section_3], [8, section_4], [8, section_5])`,
  },

  ambient: {
    simple: `// Ambient - KAIXI Architecture @ 65 BPM
setCpm(65/4)
await vital('Analog Pad'); await vital('BELL Crystal')

// ═══ Instruments ═══
const drone = n("<0 2 4 6> <4 6 1 3>").scale("F3:lydian").s("vital_analog_pad").gain(sine.range(0.15, 0.4).slow(16)).room(0.8).slow(4)
const bells = n("~ 4 ~ ~ 6 ~ 2 ~").scale("F5:lydian").s("vital_bell_crystal").gain(0.25).room(0.7).delay(0.4).delayt(0.5).dfb(0.5).slow(2)
const sub = n("<0 4>").scale("F2:lydian").s("vital_analog_pad").gain(0.15).room(0.5).slow(8)
const texture = s("pink").gain(0.03).lpf(sine.range(400, 2000).slow(32)).hpf(200).room(0.85)

const section_1 = texture; const section_2 = stack(texture, drone, sub)
const section_3 = stack(texture, drone, sub, bells.mask("<[0 1] 1 0 [1 0]>/2"))
const section_4 = stack(texture, drone, sub, bells)

arrange([8, section_1], [16, section_2], [16, section_3], [8, section_4], [8, section_1])`,
  },

  dnb: {
    simple: `// Liquid DnB - KAIXI Architecture @ 174 BPM
setCpm(174/4)
await vital('Jupiter Bass'); await vital('Analog Pad')

const break_ptn = stack(s("[bd ~ bd ~] [~ sd ~ ~]").gain(0.8), s("hh*8").gain(0.28).hpf(8000))
const bass = n("<0 5 3 7>").scale("A1:minor").s("vital_jupiter_bass").lpf(600).gain(0.78).shape(0.15)
const pad = n("<[0,2,4] [5,7,2] [3,5,0] [7,2,4]>").scale("A3:minor").s("vital_analog_pad").gain(0.25).room(0.55).slow(2)
const lead = n("0 2 4 [~ 5] 7 5 [4 ~] 2").scale("A4:minor").s("vital_analog_pad").gain(0.35).delay(0.2).room(0.3)

const section_1 = break_ptn.mask("<1 0 1 0>/2")
const section_2 = stack(break_ptn, bass.mask("<0 0 1 1>/2"))
const section_3 = stack(break_ptn, bass, pad.mask("<[0 1] 1 1 [1 0]>/4"), lead.mask("<0 0 1 1>/2"))
const section_4 = stack(break_ptn, bass.lpf("<20000 [20000 800 600 400]>/4"), pad, lead)
const section_5 = stack(break_ptn.mask("<1 0 1 [1 0]>/2"), pad)

arrange([8, section_1], [16, section_2], [8, section_3], [16, section_4], [8, section_5])`,
  },

  hiphop: {
    simple: `// Boom Bap - KAIXI Architecture @ 92 BPM
setCpm(92/4)
await vital('Jupiter Bass'); await vital('E Piano')

const kick = s("bd ~ ~ [~ bd] ~ ~ bd ~").gain(0.82).lpf(200)
const sn = s("~ ~ sd ~ ~ ~ sd ~").gain(0.7).hpf(400)
const hats = s("hh*4").gain(0.22).hpf(6000)
const drums = stack(kick, sn, hats)
const bass = n("<0 0 3 5>").scale("G2:minor").s("vital_jupiter_bass").lpf(400).gain(0.75)
const chords = n("[0,2,4] ~ [3,5,0] [~ [5,7,2]]").scale("G3:minor").s("vital_e_piano").gain(0.4).room(0.2).delay(0.1)

const section_1 = stack(kick, hats); const section_2 = stack(drums, bass.mask("<0 0 1 1>/2"))
const section_3 = stack(drums, bass, chords.mask("<[0 1] 1 1 [1 0]>/4"))
const section_4 = stack(drums.mask("<1 [1 0] 1 1>/4"), bass, chords)

arrange([8, section_1], [16, section_2], [16, section_3], [4, section_4], [4, section_1])`,
  },

  trap: {
    simple: `// Trap - KAIXI Architecture @ 145 BPM
setCpm(145/4)
await vital('Jupiter Bass'); await vital('LEAD Coral'); await vital('Analog Pad')

const kick = s("bd ~ ~ [~ bd] ~ ~ ~ [bd ~]").gain(0.9).lpf(150)
const snare = s("~ ~ sd ~ ~ ~ sd ~").gain(0.72).hpf(300)
const hats = s("hh*8 [hh*3] hh*8 [hh*6]").gain(0.3).hpf(8000)
const drums = stack(kick, snare, hats)
const bass = n("<0 ~ 0 -2>*2").scale("F#1:minor").s("vital_jupiter_bass").gain(0.8).lpf(200).decay(0.8)
const melody = n("~ 7 ~ 5 ~ 3 ~ 0").scale("F#4:minor").s("vital_lead_coral").lpf(2000).gain(0.4).delay(0.2)
const pad = n("<[0,2] [3,5] [7,2]>").scale("F#3:minor").s("vital_analog_pad").gain(0.1).room(0.45).slow(4)

const section_1 = stack(kick, hats); const section_2 = stack(drums, bass.mask("<0 0 1 1>/2"))
const section_3 = stack(drums, bass, melody.mask("<[0 1] 1 0 [1 0]>/4"))
const section_4 = stack(drums, bass.lpf("<20000 [20000 20000 500 400]>/4"), melody, pad.mask("<0 0 1 1>/2"))
const section_5 = stack(drums.mask("<1 0 1 [1 0]>/2"), bass)

arrange([8, section_1], [16, section_2], [16, section_3], [8, section_4], [8, section_5], [4, section_1])`,
  },

  lofi: {
    simple: `// Lo-fi - KAIXI Architecture @ 78 BPM
setCpm(78/4)
await vital('Jupiter Bass'); await vital('E Piano')

const kick = s("bd ~ ~ bd ~ ~ bd ~").gain(0.5).lpf(300)
const sn = s("~ ~ sd ~ ~ ~ sd ~").gain(0.4).lpf(3000).room(0.2)
const hats = s("hh*4").gain(0.15).hpf(4000).lpf(8000)
const drums = stack(kick, sn, hats)
const bass = n("<0 3 5 7>").scale("C2:minor").s("vital_jupiter_bass").lpf(600).gain(0.5)
const chords = n("[0,2,4] [3,5,0] [5,7,2] [4,6,1]").scale("C3:minor").s("vital_e_piano").gain(0.35).room(0.3).lpf(3000)

const section_1 = stack(kick, hats); const section_2 = stack(drums, bass.mask("<0 1 1 0>/2"))
const section_3 = stack(drums, bass, chords.mask("<0 [0 1] 1 1>/4"))
const section_4 = stack(drums.mask("<1 1 1 0>/2"), bass, chords)

arrange([8, section_1], [16, section_2], [16, section_3], [4, section_4], [4, section_1])`,
  },

  dubstep: {
    simple: `// Dubstep - KAIXI Architecture @ 140 BPM
setCpm(140/4); const wobble = slider(0.6, 0, 1, 0.01)
await vital('Jupiter Bass'); await vital('Analog Pad')

const kick = s("bd ~ ~ ~ bd ~ ~ ~").gain(0.85).lpf(200)
const snare = s("~ ~ sd ~ ~ ~ sd ~").gain(0.78).room(0.08)
const hats = s("hh*8").gain(0.22).hpf(8000)
const drums = stack(kick, snare, hats)
const bass = n("<0 0 3 5>*2").scale("E1:minor").s("vital_jupiter_bass").lpf(sine.range(200, wobble.mul(3000).add(500)).fast(wobble.mul(4).add(1))).gain(0.8).shape(0.3)
const pad = n("<[0,2,4] [3,5,7] [5,2,0] ~>").scale("E3:minor").s("vital_analog_pad").gain(0.15).room(0.5).slow(2)

const section_1 = stack(kick, hats); const section_2 = stack(drums, pad)
const section_3 = stack(drums, bass.lpf("<20000 [20000 20000 500 300]>/4"))
const section_4 = stack(drums, bass, pad); const section_5 = stack(drums.mask("<1 0 1 [1 0]>/2"), pad)

arrange([8, section_1], [8, section_2], [16, section_3], [8, section_4], [8, section_5], [4, section_3], [4, kick])`,
  },

  reggae: {
    simple: `// Reggae - KAIXI Architecture @ 80 BPM
setCpm(80/4)
await vital('Jupiter Bass'); await vital('E Piano')

const kick = s("~ ~ bd ~").gain(0.78).lpf(200); const sn = s("~ ~ sd ~").gain(0.6).room(0.1)
const hats = s("hh*4").gain(0.18).hpf(6000); const rim = s("~ rim ~ rim").gain(0.3)
const drums = stack(kick, sn, hats, rim)
const bass = n("0 ~ 4 ~ 0 ~ 4 ~").scale("G2:major").s("vital_jupiter_bass").gain(0.68).lpf(500)
const skank = n("~ [0,2,4] ~ [0,2,4]").scale("G3:major").s("vital_e_piano").gain(0.3).room(0.2)

const section_1 = rim; const section_2 = stack(drums, bass)
const section_3 = stack(drums, bass, skank.mask("<[0 1] 1 1 [1 0]>/4"))
const section_4 = stack(drums.mask("<1 [1 0] 1 1>/4"), bass, skank)

arrange([4, section_1], [16, section_2], [16, section_3], [8, section_4], [4, section_1])`,
  },

  classical: {
    simple: `// Classical - KAIXI Architecture @ 72 BPM
setCpm(72/4)
await vital('Analog Pad'); await vital('PAD Cinematic')

const bass = n("0 ~ 4 ~ 5 ~ 3 ~").scale("D2:minor").s("vital_analog_pad").gain(0.45).room(0.45).slow(2).decay(0.9)
const inner = n("[0,2] [4,6] [3,5] [2,4]").scale("D3:minor").s("vital_analog_pad").gain(0.35).room(0.45).slow(2)
const melody = n("5 4 3 2 0 2 4 5 7 5 4 2").scale("D4:minor").s("vital_pad_cinematic").gain(0.4).room(0.5)
const drone = n("<0 4>").scale("D2:minor").s("vital_analog_pad").gain(0.1).room(0.55).slow(4)

const section_1 = drone; const section_2 = stack(drone, bass.mask("<0 1 1 0>/2"))
const section_3 = stack(drone, bass, inner.mask("<[0 1] 1 1 [1 0]>/4"))
const section_4 = stack(drone, bass, inner, melody)
const section_5 = stack(drone, melody.mask("<1 1 [1 0] 0>/4"))

arrange([8, section_1], [8, section_2], [16, section_3], [8, section_4], [8, section_5], [4, drone])`,
  },

  funk: {
    simple: `// Funk - KAIXI Architecture @ 110 BPM
setCpm(110/4)
await vital('Jupiter Bass'); await vital('E Piano'); await vital('Synth Brass - Super Stab')

const kick = s("bd ~ [~ bd] ~ bd ~ ~ [bd ~]").gain(0.78)
const sn = s("~ [~ sd] sd ~ ~ [sd ~] sd [~ sd]").gain(0.5).hpf(400)
const hats = s("hh*8").gain(0.22).hpf(6000)
const drums = stack(kick, sn, hats)
const bass = n("0 ~ [3 ~] 5 ~ [7 5] 3 0").scale("E2:minor").s("vital_jupiter_bass").gain(0.7).lpf(800)
const keys = n("[0,2,4] ~ [~ [3,5]] ~").scale("E4:minor").s("vital_e_piano").gain(0.4).hpf(800)
const brs = n("~ ~ [0,2,4,6] ~").scale("E3:minor").s("vital_synth_brass_super_stab").gain(0.3)

const section_1 = stack(kick, hats); const section_2 = stack(drums, bass.mask("<0 0 1 1>/2"))
const section_3 = stack(drums, bass, keys.mask("<0 [0 1] 1 0>/4"), brs.mask("<[0 1] 0 1 0>/4"))
const section_4 = stack(drums.mask("<1 [1 0] 1 1>/4"), bass, keys)

arrange([4, section_1], [16, section_2], [16, section_3], [8, section_4], [4, section_1])`,
  },

  garage: {
    simple: `// UK Garage - KAIXI Architecture @ 134 BPM
setCpm(134/4)
await vital('Jupiter Bass'); await vital('Analog Pad')

const kick = s("bd ~ [~ bd] ~").gain(0.8); const sn = s("~ sd ~ [~ sd]").gain(0.62).room(0.12)
const hats = s("hh*8").gain(0.28).hpf(6000); const rim = s("[~ rim] ~ [rim ~] ~").gain(0.22).hpf(3000)
const drums = stack(kick, sn, hats, rim)
const bass = n("<0 3 5 7>*2").scale("C2:minor").s("vital_jupiter_bass").lpf(sine.range(300, 900).slow(4)).gain(0.75)
const pad = n("[0,2,4] [3,5,7]").scale("C4:minor").s("vital_analog_pad").gain(0.25).room(0.4).delay(0.15).slow(2)

const section_1 = stack(kick, hats); const section_2 = stack(drums.mask("<1 [1 1 1 [1 0]]>/4"), bass.mask("<0 0 1 1>/2"))
const section_3 = stack(drums, bass, pad.mask("<[0 1] 1 1 [1 0]>/4"))
const section_4 = stack(drums, bass.lpf("<20000 [20000 20000 500 400]>/4"), pad)

arrange([8, section_1], [16, section_2], [16, section_3], [8, section_4], [4, section_1])`,
  },

  trance: {
    simple: `// Uplifting Trance - KAIXI Architecture @ 140 BPM
setCpm(140/4); const filter = slider(0.5, 0, 1, 0.01)
await vital('Jupiter Bass'); await vital('LD - Supersaw'); await vital('Analog Pad')

const kick = s("bd*4").gain(0.88); const clap = s("~ cp ~ cp").gain(0.58).room(0.15)
const hats = s("~ hh ~ hh").gain(0.3).hpf(8000); const oh = s("~ ~ ~ oh").gain(0.2).hpf(4000)
const drums = stack(kick, clap, hats, oh)
const bass = n("<0 0 5 3>*4").scale("A1:minor").s("vital_jupiter_bass").lpf(filter.mul(1000).add(200)).gain(0.75)
const lead = n("0 2 4 5 7 5 4 2").scale("A4:minor").s("vital_ld_supersaw").lpf(filter.mul(4000).add(1000)).gain(0.42).room(0.25).delay(0.125)
const pad = n("<[0,2,4] [3,5,7] [5,7,2] [4,6,1]>").scale("A3:minor").s("vital_analog_pad").gain(0.2).room(0.55).slow(2)

const section_1 = kick; const section_2 = stack(drums.mask("<1 [1 1 1 [1 0]]>/4"), bass.mask("<0 0 1 1>/4"))
const section_3 = stack(drums, bass.lpf("<20000 [20000 20000 1200 800]>/4"), lead.mask("<0 [0 1] 1 1>/4"), pad.mask("<0 0 0 1>/4"))
const section_4 = stack(drums, bass, lead, pad); const section_5 = stack(kick, pad)

arrange([16, section_1], [16, section_2], [32, section_3], [8, section_4], [8, section_3], [4, section_5])`,
  },

};

/**
 * Get a simple template for a genre (used as few-shot example)
 */
export function getExampleForGenre(genre) {
  const key = genre.toLowerCase().replace(/[\s-]/g, '');
  const templates = GENRE_TEMPLATES[key] || GENRE_TEMPLATES.house;
  return templates.simple;
}

/**
 * Get an advanced template for a genre
 */
export function getAdvancedExampleForGenre(genre) {
  const key = genre.toLowerCase().replace(/[\s-]/g, '');
  const templates = GENRE_TEMPLATES[key] || GENRE_TEMPLATES.house;
  return templates.advanced || templates.simple;
}

/**
 * Get all available genre names
 */
export function getAvailableGenres() {
  return Object.keys(GENRE_TEMPLATES);
}
