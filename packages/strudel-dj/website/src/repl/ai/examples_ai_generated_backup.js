export const GENRE_EXAMPLES = [
  {
    id: "house",
    name: "House",
    category: "Electronic",
    bpm: 124,
    key: "F minor",
    description: "Four-on-the-floor kick, offbeat hats, soulful chords, groovy bassline",
    code: `// === HOUSE @ 124 BPM ===
setCpm(124/4)

const kick = s("tr909_bd").gain(0.9)
const hat = s("tr909_hh").gain(0.5).pan(0.6)
const oh = s("tr909_oh").gain(0.35).pan(0.4)
const clap = s("tr909_cp").gain(0.6).delay(0.1).delaytime(0.16).delayfeedback(0.2)

const bass = note("f2 ~ f2 <ab2 eb2>").s("sawtooth").lpf(500).gain(0.6)
const chords = note("<[f3,ab3,c4] [eb3,g3,bb3] [db3,f3,ab3] [eb3,g3,bb3]>").s("supersaw").lpf(2000).gain(0.25).room(0.3).pan(0.4)

stack(
  kick.struct("t*4"),
  hat.struct("~ t ~ t ~ t ~ t"),
  oh.struct("~ ~ ~ ~ ~ ~ ~ t"),
  clap.struct("~ t ~ ~"),
  bass,
  chords
)`,
  },
  {
    id: "techno",
    name: "Techno",
    category: "Electronic",
    bpm: 130,
    key: "A minor",
    description: "Driving kick, industrial percussion, dark atmosphere, hypnotic loops",
    code: `// === TECHNO @ 130 BPM ===
setCpm(130/4)

const kick = s("tr909_bd").gain(1).shape(0.3)
const hat = s("tr909_hh").gain(0.4).struct("t*16").pan(sine.range(0.3,0.7).slow(4))
const clap = s("tr909_cp").gain(0.5).room(0.4).struct("~ t ~ ~")
const rim = s("tr909_rim").gain(0.35).struct("~ [~ t] ~ [t ~]").pan(0.7)

const bass = note("a1 a1 ~ a1 ~ a1 a1 ~").s("sawtooth").lpf(300).shape(0.4).gain(0.6)
const pad = note("[a3,c4,e4]").s("triangle").lpf(1200).gain(0.15).room(0.6).slow(2)

stack(
  kick.struct("t*4"),
  hat,
  clap,
  rim,
  bass,
  pad
)`,
  },
  {
    id: "trance",
    name: "Trance",
    category: "Electronic",
    bpm: 138,
    key: "D minor",
    description: "Uplifting pads, rolling bassline, euphoric breakdown, supersaw leads",
    code: `// === TRANCE @ 138 BPM ===
setCpm(138/4)

const kick = s("tr909_bd").gain(0.9)
const hat = s("tr909_hh").gain(0.4).struct("t*8")
const clap = s("tr909_cp").gain(0.5).room(0.3)

const bass = note("d2*8").s("sawtooth").lpf(sine.range(200,800).slow(8)).gain(0.5)
const pad = note("<[d3,f3,a3] [c3,e3,g3] [bb2,d3,f3] [a2,c3,e3]>").s("supersaw").lpf(3000).gain(0.3).room(0.5).slow(2)
const lead = note("d5 f5 a5 g5 f5 e5 d5 c5").s("supersaw").lpf(4000).gain(0.25).delay(0.2).delaytime(0.18).delayfeedback(0.3).fast(2)

stack(
  kick.struct("t*4"),
  hat,
  clap.struct("~ t ~ ~"),
  bass,
  pad,
  lead
)`,
  },
  {
    id: "dubstep",
    name: "Dubstep",
    category: "Electronic",
    bpm: 140,
    key: "E minor",
    description: "Halftime drums, massive wobble bass, heavy sub, sparse arrangement",
    code: `// === DUBSTEP @ 140 BPM ===
setCpm(140/4)

const kick = s("tr808_bd").gain(1).shape(0.2)
const snare = s("tr808_sd").gain(0.8).room(0.2)
const hat = s("tr808_hh").gain(0.35).struct("[t ~ t ~]*4")

const sub = note("e1").s("sine").gain(0.8).lpf(80)
const wobble = note("e2 ~ e2 ~").s("sawtooth").lpf(sine.range(200,2000).fast(4)).gain(0.5).shape(0.3)
const fx = s("tr808_cr:2").gain(0.2).room(0.7).struct("~ ~ ~ ~ ~ ~ ~ t").slow(2)

stack(
  kick.struct("t ~ ~ ~ t ~ ~ ~"),
  snare.struct("~ ~ ~ ~ t ~ ~ ~"),
  hat,
  sub.struct("t ~ t ~ ~ ~ t ~"),
  wobble,
  fx
)`,
  },
  {
    id: "drum_and_bass",
    name: "Drum & Bass",
    category: "Electronic",
    bpm: 174,
    key: "G minor",
    description: "Fast breakbeats, rolling bass, chopped drums, high energy",
    code: `// === DRUM & BASS @ 174 BPM ===
setCpm(174/4)

const kick = s("tr909_bd").gain(0.9)
const snare = s("tr909_sd").gain(0.7).room(0.15)
const hat = s("tr909_hh").gain(0.4).struct("t*16")
const ghost = s("tr909_sd:2").gain(0.25)

const bass = note("g1 ~ g1 bb1 ~ g1 ~ ~").s("sawtooth").lpf(600).shape(0.3).gain(0.6)
const pad = note("[g3,bb3,d4]").s("triangle").lpf(2000).gain(0.15).room(0.4).slow(4)

stack(
  kick.struct("t ~ ~ ~ [~ t] ~ ~ ~"),
  snare.struct("~ ~ t ~ ~ ~ t ~"),
  ghost.struct("~ t ~ ~ t ~ ~ t"),
  hat,
  bass,
  pad
)`,
  },
  {
    id: "ambient",
    name: "Ambient",
    category: "Electronic",
    bpm: 70,
    key: "C major",
    description: "Ethereal pads, no beats, slow evolution, spacious reverb",
    code: `// === AMBIENT @ 70 BPM ===
setCpm(70/4)

const pad1 = note("<[c3,e3,g3,b3] [a2,c3,e3,g3]>").s("triangle").lpf(1500).gain(0.25).room(0.8).slow(4)
const pad2 = note("<[e4,g4] [c4,e4]>").s("sine").lpf(2000).gain(0.15).room(0.9).pan(sine.range(0.2,0.8).slow(8)).slow(8)
const texture = s("pink").lpf(sine.range(400,1200).slow(16)).gain(0.08).pan(perlin.range(0.3,0.7))
const bell = note("g5 ~ ~ ~ e5 ~ ~ ~").s("gm_music_box").gain(0.15).room(0.9).delay(0.4).delaytime(0.5).delayfeedback(0.5).slow(4)

stack(
  pad1,
  pad2,
  texture,
  bell
)`,
  },
  {
    id: "hip_hop",
    name: "Hip Hop",
    category: "Hip Hop & R&B",
    bpm: 90,
    key: "C minor",
    description: "Boom bap drums, sampled loops, head-nodding groove, classic vibes",
    code: `// === HIP HOP @ 90 BPM ===
setCpm(90/4)

const kick = s("tr808_bd").gain(0.9)
const snare = s("tr808_sd").gain(0.7).room(0.15)
const hat = s("tr808_hh").gain(0.35).struct("t*8")
const oh = s("tr808_oh").gain(0.25).struct("~ ~ ~ ~ ~ ~ ~ t")

const bass = note("c2 ~ ~ c2 ~ ~ eb2 ~").s("sawtooth").lpf(300).gain(0.55)
const keys = note("<[c3,eb3,g3] [ab2,c3,eb3] [bb2,d3,f3] [g2,bb2,d3]>").s("gm_epiano1").gain(0.25).room(0.3)
const melody = note("c4 eb4 ~ g4 ~ eb4 c4 ~").s("sine").lpf(2000).gain(0.15).delay(0.1).delaytime(0.2).delayfeedback(0.2).slow(2)

stack(
  kick.struct("t ~ ~ ~ t ~ [~ t] ~"),
  snare.struct("~ ~ t ~ ~ ~ t ~"),
  hat,
  oh,
  bass,
  keys,
  melody
)`,
  },
  {
    id: "trap",
    name: "Trap",
    category: "Hip Hop & R&B",
    bpm: 140,
    key: "F# minor",
    description: "808 bass, rolling hi-hats, dark melodies, heavy sub",
    code: `// === TRAP @ 140 BPM ===
setCpm(140/4)

const kick = s("tr808_bd").gain(0.95)
const snare = s("tr808_sd").gain(0.7).room(0.15)
const hat = s("tr808_hh").gain(0.4)
const oh = s("tr808_oh").gain(0.25)

const bass808 = note("f#1 ~ ~ ~ f#1 ~ ~ ~").s("sine").lpf(100).gain(0.85).shape(0.1)
const melody = note("f#4 ~ a4 ~ c#5 ~ a4 ~").s("square").lpf(2000).gain(0.2).delay(0.15).delaytime(0.16).delayfeedback(0.25).slow(2)
const pad = note("[f#3,a3,c#4]").s("triangle").lpf(1200).gain(0.12).room(0.5).slow(4)

stack(
  kick.struct("t ~ ~ ~ ~ ~ t ~"),
  snare.struct("~ ~ ~ ~ t ~ ~ ~"),
  hat.struct("[t t [t t t] t]*2"),
  oh.struct("~ ~ ~ ~ ~ ~ ~ t"),
  bass808,
  melody,
  pad
)`,
  },
  {
    id: "indie_rock",
    name: "Indie Rock",
    category: "Rock",
    bpm: 128,
    key: "C major",
    description: "Jangly guitars, melodic bass, driving rhythms, catchy hooks",
    code: `// === INDIE ROCK @ 128 BPM ===
setCpm(128/4)

const kick = s("linndrum_bd").gain(0.75)
const snare = s("linndrum_sd").gain(0.6).room(0.2)
const hat = s("linndrum_hh").gain(0.35).struct("t*8")

const bass = note("c2 c2 e2 g2 a2 g2 e2 c2").s("sawtooth").lpf(600).gain(0.5)
const guitar1 = note("<[c3,e3,g3] [f3,a3,c4] [g3,b3,d4] [a3,c4,e4]>").s("triangle").lpf(3000).gain(0.3).room(0.2)
const guitar2 = note("c4 e4 g4 ~ e4 ~ c4 ~").s("square").lpf(2500).gain(0.2).delay(0.15).delaytime(0.12).delayfeedback(0.2).pan(0.65)

stack(
  kick.struct("t ~ t ~ t ~ t ~"),
  snare.struct("~ ~ t ~ ~ ~ t ~"),
  hat,
  bass,
  guitar1,
  guitar2
)`,
  },
  {
    id: "synth_pop",
    name: "Synth Pop",
    category: "Pop",
    bpm: 122,
    key: "D minor",
    description: "Analog synths, catchy hooks, electronic drums, 80s influence",
    code: `// === SYNTH POP @ 122 BPM ===
setCpm(122/4)

const kick = s("linndrum_bd").gain(0.8)
const snare = s("linndrum_sd").gain(0.65).room(0.3)
const hat = s("linndrum_hh").gain(0.35).struct("t*8")

const bass = note("d2 d2 f2 g2 a2 g2 f2 d2").s("square").lpf(500).gain(0.5)
const synth = note("<[d3,f3,a3] [c3,e3,g3] [bb2,d3,f3] [a2,c3,e3]>").s("supersaw").lpf(2000).gain(0.25).room(0.2)
const arp = note("d4 f4 a4 d5 a4 f4 d4 a3").s("pulse").lpf(3000).gain(0.2).delay(0.15).delaytime(0.12).delayfeedback(0.2).fast(2)

stack(
  kick.struct("t*4"),
  snare.struct("~ t ~ ~"),
  hat,
  bass,
  synth,
  arp
)`,
  },
  {
    id: "jazz",
    name: "Jazz",
    category: "Jazz & Blues",
    bpm: 140,
    key: "Bb major",
    description: "Swing feel, walking bass, jazz voicings, improvisation, blue notes",
    code: `// === JAZZ @ 140 BPM ===
setCpm(140/4)

const kick = s("linndrum_bd").gain(0.5)
const snare = s("linndrum_sd").gain(0.3).room(0.2)
const hat = s("linndrum_hh").gain(0.35).struct("t*8")
const ride = s("tr909_rd").gain(0.3).struct("t*4")

const bass = note("bb2 d3 f3 a3 g3 f3 d3 bb2").s("triangle").lpf(500).gain(0.5)
const piano = note("<[bb3,d4,f4,a4] [eb3,g3,bb3,d4] [f3,a3,c4,eb4] [bb3,d4,f4,a4]>").s("gm_piano").gain(0.25).room(0.3)
const sax = note("bb4 ~ d5 f5 ~ d5 c5 bb4").s("gm_tenor_sax").gain(0.2).room(0.3).slow(2)

stack(
  kick.struct("t ~ ~ ~ t ~ ~ ~"),
  snare.struct("~ ~ ~ t ~ ~ t ~"),
  hat,
  ride,
  bass,
  piano,
  sax
)`,
  },
  {
    id: "heavy_metal",
    name: "Heavy Metal",
    category: "Metal",
    bpm: 140,
    key: "E minor",
    description: "Double bass drums, heavy riffs, palm muting, aggressive power",
    code: `// === HEAVY METAL @ 140 BPM ===
setCpm(140/4)

const kick = s("tr909_bd").gain(1).shape(0.2)
const snare = s("tr909_sd").gain(0.8)
const hat = s("tr909_hh").gain(0.4).struct("t*8")
const crash = s("tr909_cr").gain(0.35).struct("t ~ ~ ~ ~ ~ ~ ~").slow(2)

const bass = note("e1 e1 g1 e1 a1 a1 b1 e1").s("sawtooth").lpf(400).shape(0.4).gain(0.6)
const riff = note("<[e2,b2,e3] [e2,b2,e3] [g2,d3,g3] [a2,e3,a3]>").s("sawtooth").lpf(3000).shape(0.5).gain(0.35)
const lead = note("e4 ~ g4 a4 ~ b4 ~ e4").s("sawtooth").lpf(5000).gain(0.2).room(0.15).slow(2)

stack(
  kick.struct("t t t t t t t t"),
  snare.struct("~ ~ t ~ ~ ~ t ~"),
  hat,
  crash,
  bass,
  riff,
  lead
)`,
  },
  {
    id: "classical",
    name: "Classical",
    category: "Classical & Orchestral",
    bpm: 100,
    key: "C major",
    description: "Orchestral arrangement, counterpoint, dynamic range, formal structure",
    code: `// === CLASSICAL @ 100 BPM ===
setCpm(100/4)

const cello = note("c2 e2 g2 c3 g2 e2 c2 g1").s("gm_cello").gain(0.4)
const viola = note("e3 g3 c4 e4 c4 g3 e3 c3").s("gm_viola").gain(0.3).slow(2)
const violin = note("c4 e4 g4 c5 b4 a4 g4 e4").s("gm_violin").gain(0.25).room(0.3)
const flute = note("g5 ~ a5 ~ g5 ~ e5 ~").s("gm_flute").gain(0.2).room(0.3).slow(2)
const timpani = note("c2 ~ ~ ~ g2 ~ ~ ~").s("gm_timpani").gain(0.3).slow(2)

stack(
  cello,
  viola,
  violin,
  flute,
  timpani
)`,
  },
  {
    id: "afrobeat",
    name: "Afrobeat",
    category: "World & Folk",
    bpm: 115,
    key: "F major",
    description: "Polyrhythmic drums, horn sections, Fela Kuti influence, danceable grooves",
    code: `// === AFROBEAT @ 115 BPM ===
setCpm(115/4)

const kick = s("tr808_bd").gain(0.8)
const snare = s("tr808_sd").gain(0.5)
const hat = s("tr808_hh").gain(0.35).struct("t*8")
const shaker = s("tr808_sh").gain(0.25).struct("t*16")
const conga = s("tr808_ht").gain(0.3).struct("~ t ~ t t ~ t ~")

const bass = note("f2 ~ a2 ~ c3 ~ a2 f2").s("triangle").lpf(500).gain(0.5)
const guitar = note("f3 a3 c4 a3 f3 ~ a3 ~").s("gm_electric_guitar_clean").gain(0.2)
const horn = note("<[f4,a4,c5] [c4,e4,g4]>").s("gm_brass_section").gain(0.2).room(0.2).slow(2)
const organ = note("[f3,a3,c4]").s("gm_drawbar_organ").gain(0.15).slow(4)

stack(
  kick.struct("t ~ ~ t ~ ~ t ~"),
  snare.struct("~ ~ t ~ ~ t ~ ~"),
  hat,
  shaker,
  conga,
  bass,
  guitar,
  horn,
  organ
)`,
  },
  {
    id: "bossa_nova",
    name: "Bossa Nova",
    category: "World & Folk",
    bpm: 135,
    key: "C major",
    description: "Brazilian rhythm, nylon guitar, jazzy chords, gentle groove, sophisticated",
    code: `// === BOSSA NOVA @ 135 BPM ===
setCpm(135/4)

const kick = s("linndrum_bd").gain(0.5)
const rim = s("tr808_rim").gain(0.3).struct("~ t ~ t ~ t ~ t")
const hat = s("linndrum_hh").gain(0.2).struct("t*16")
const shaker = s("tr808_sh").gain(0.15).struct("t*8")

const bass = note("c2 ~ e2 ~ g2 ~ e2 c2").s("triangle").lpf(400).gain(0.5)
const guitar = note("<[c3,e3,g3,b3] [a2,c3,e3,g3] [d3,f3,a3,c4] [g2,b2,d3,f3]>").s("gm_acoustic_guitar_nylon").gain(0.3)
const melody = note("e4 g4 ~ b4 ~ g4 e4 ~").s("gm_flute").gain(0.15).room(0.3).slow(2)

stack(
  kick.struct("t ~ ~ ~ t ~ ~ ~"),
  rim,
  hat,
  shaker,
  bass,
  guitar,
  melody
)`,
  },
  {
    id: "reggae",
    name: "Reggae",
    category: "World & Folk",
    bpm: 80,
    key: "G major",
    description: "Offbeat rhythm guitar, one drop drums, deep bass, positive vibes",
    code: `// === REGGAE @ 80 BPM ===
setCpm(80/4)

const kick = s("tr808_bd").gain(0.8)
const snare = s("tr808_rim").gain(0.5).room(0.2)
const hat = s("tr808_hh").gain(0.3).struct("t*8")

const bass = note("g1 ~ b1 ~ d2 ~ g1 ~").s("sine").lpf(200).gain(0.65)
const skank = note("<[g3,b3,d4] [c3,e3,g3] [d3,f#3,a3] [g3,b3,d4]>").s("gm_electric_guitar_muted").gain(0.3).struct("~ t ~ t ~ t ~ t")
const organ = note("[g3,b3,d4]").s("gm_drawbar_organ").gain(0.15).struct("~ t ~ t ~ t ~ t").room(0.2)
const melody = note("g4 ~ b4 ~ d5 ~ b4 a4").s("gm_trumpet").gain(0.15).room(0.2).slow(4)

stack(
  kick.struct("~ ~ t ~ ~ ~ t ~"),
  snare.struct("~ ~ ~ ~ t ~ ~ ~"),
  hat,
  bass,
  skank,
  organ,
  melody
)`,
  },
  {
    id: "funk",
    name: "Funk",
    category: "Funk & Soul",
    bpm: 108,
    key: "E minor",
    description: "Syncopated bass, chicken-scratch guitar, tight drums, groove-focused",
    code: `// === FUNK @ 108 BPM ===
setCpm(108/4)

const kick = s("linndrum_bd").gain(0.8)
const snare = s("linndrum_sd").gain(0.65)
const hat = s("linndrum_hh").gain(0.35).struct("t*16")
const oh = s("tr808_oh").gain(0.2)

const bass = note("e2 ~ g2 e2 ~ a2 ~ e2").s("sawtooth").lpf(600).gain(0.55)
const guitar = note("[e3,g3,b3]").s("gm_electric_guitar_muted").gain(0.3).struct("~ t [~ t] t ~ t [~ t] t")
const clavinet = note("e4 ~ g4 ~ b4 ~ g4 e4").s("gm_clavinet").gain(0.2).room(0.15)
const horn = note("<[e4,g4,b4] ~ ~ ~>").s("gm_brass_section").gain(0.2).struct("t ~ ~ ~ ~ ~ t ~").slow(2)

stack(
  kick.struct("t ~ [~ t] ~ t ~ [~ t] ~"),
  snare.struct("~ ~ t ~ ~ ~ t ~"),
  hat,
  oh.struct("~ ~ ~ ~ ~ ~ ~ t"),
  bass,
  guitar,
  clavinet,
  horn
)`,
  },
  {
    id: "disco",
    name: "Disco",
    category: "Funk & Soul",
    bpm: 120,
    key: "F minor",
    description: "Four-on-the-floor, string sweeps, octave bass, dance floor energy",
    code: `// === DISCO @ 120 BPM ===
setCpm(120/4)

const kick = s("tr909_bd").gain(0.85)
const hat = s("tr909_hh").gain(0.4).struct("~ t ~ t ~ t ~ t")
const oh = s("tr909_oh").gain(0.3).struct("~ ~ ~ ~ ~ ~ ~ t")
const clap = s("tr909_cp").gain(0.5)

const bass = note("f2 f2 f3 f2 ab2 ab2 ab3 ab2").s("sawtooth").lpf(800).gain(0.5)
const strings = note("<[f3,ab3,c4] [db3,f3,ab3] [eb3,g3,bb3] [f3,ab3,c4]>").s("gm_string_ensemble_1").gain(0.2).room(0.3)
const guitar = note("[f3,ab3,c4]").s("gm_electric_guitar_clean").gain(0.2).struct("~ t ~ t ~ t ~ t")
const synth = note("f4 ab4 c5 ~ ab4 f4 ~ ~").s("square").lpf(3000).gain(0.15).slow(2)

stack(
  kick.struct("t*4"),
  hat,
  oh,
  clap.struct("~ t ~ ~"),
  bass,
  strings,
  guitar,
  synth
)`,
  },
  {
    id: "glitch",
    name: "Glitch",
    category: "Experimental",
    bpm: 130,
    key: "D minor",
    description: "Micro-edits, digital artifacts, stuttering patterns, precise chaos",
    code: `// === GLITCH @ 130 BPM ===
setCpm(130/4)

const kick = s("tr909_bd").gain(0.7).struct("t ~ [t ~] ~ t [~ t] ~ ~")
const snare = s("tr909_sd").gain(0.4).struct("~ ~ t [t t] ~ ~ [t ~] ~")
const hat = s("tr909_hh").gain(0.35).struct("[t t] ~ [t t t] ~ t ~ [t t] ~")
const glitch = s("tr808_cb tr808_rim tr808_hh").gain(0.3).fast(rand.range(1,4)).pan(rand)

const bass = note("d2 ~ [d2 d2] ~ f2 ~ ~ d2").s("square").lpf(sine.range(200,1000).fast(3)).gain(0.4)
const texture = s("pink").lpf(sine.range(500,4000).fast(7)).gain(0.06).pan(perlin.range(0.2,0.8))

stack(
  kick,
  snare,
  hat,
  glitch,
  bass,
  texture
)`,
  },
];
