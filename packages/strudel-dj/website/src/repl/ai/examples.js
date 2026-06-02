// ============================================================
// Strudel Examples Collection — Effects-Heavy Curated Selection
// ============================================================
// Sources:
//   1. Strudel Official Tunes (tunes.mjs) — by Felix Roos et al.
//      License: CC BY-NC-SA 4.0
//      https://creativecommons.org/licenses/by-nc-sa/4.0/
//   2. strudel.cc official examples — by eddyflux et al.
//
// Selection criteria: only examples with rich effects processing
// (delay, reverb, filter automation, shape, echo, jux, etc.)
//
// The old AI-generated genre examples are in examples_ai_generated_backup.js
// ============================================================

export const GENRE_EXAMPLES = [

  // ============================================================
  // CATEGORY: Full Tracks (Original)
  // ============================================================
  {
    id: "dreamy_demo",
    name: "Dreamy Demo",
    category: "Full Tracks",
    bpm: 112,
    key: "G major",
    description: "Original composition (dynamic Vital bridge version): 3-section arrangement — arpeggiated accompaniment, evolving melodies, climax with full layers, piano pickup",
    code: `// Dreamy Demo — dynamic Vital bridge version
// BPM: 112 | 42 cycles | grid: 16/bar
let cpm = 28.0;

// Load and render real Vital presets through vital-bridge.
await Promise.all([
  vital('Pluck - SAD'),
  vital('CH - Chill E-Piano Lofi'),
  vital('Damped Horn'),
  vital('Keystation'),
  vital('Lead 3'),
  vital('Flute 1'),
])

let KEY = 'vital_keystation';
let PAD = 'vital_flute_1';
let HORN = 'vital_damped_horn';
let PLUCK = 'vital_pluck_sad';
let MARIMBA = 'vital_lead_3';

// ═══ Accompaniment: 26 + 16 = 42 cycles ═══

let track_arp_accompaniment_a = note(\`<
  [g2 a3 b3 fs4 ~ a3 b3 fs4]*2
  [a2 g3 c4 g4 ~ g3 c4 g4]*2
>\`).s(KEY)
  .release(0.8)
  .slow(2)
  .gain(perlin.range(0.38, 0.84).slow(12))
  .lpf(sine.range(1600, 4200).slow(12))
  .room(sine.range(0.35, 0.75).slow(8))
  .delay(".35:.1:.55")
  .lpenv(0.5);

let track_arp_accompaniment_b = note(\`<
[[a2,g2,c3,e3] [g3,b3] ~@14] [[c3,g3] [b3,e4] ~@14]
[[b2,e3,a3,d4] ~@15] [[a2,d3,g3,c4] ~@15]
[[b2,d3,a3,g2] ~@15] [[g2,d3,g3,c4] ~@15]
[g2 ~ d3 ~ a3 ~ [fs4,b3] ~@3 b3 ~ d4 ~@3] [g2 ~ d3 ~ a3 ~ [b3,fs4] ~@3 a3 ~ d4 ~@3]
[[g2,c3,e3,g3] b3 ~@14] [[c3,g3,b3,e4] ~@15]
[[b2,e3,a3] d4 ~@14] [a2 [d3,g3] c4 ~@13]
~ ~ [[g2,b2,d3,a3] ~@15] [a2 [g3,d3,c4] ~@14]
>\`)
  .s(KEY)
  .release(1.2)
  .gain(0.72);

let track_arp_accompaniment = arrange(
  [26, track_arp_accompaniment_a],
  [16, track_arp_accompaniment_b]
)
  .gain(sine.range(0.62, 0.86).slow(16))
  .room(perlin.range(0.08, 0.24).slow(8))
  .lpf(sine.range(1600, 4200).slow(16));

// ═══ Melody 1: 10 cycles ═══

let track_melody1 = note(\`<~ ~ [[fs6,a5] ~@15] ~ [[g6,b5] ~@15] ~ [[a4,a5] ~@15] ~ [[d4,d5] ~@15] ~>\`)
  .s(HORN)
  .release(4)
  .gain(0.95);

// ═══ Melody 2: 16 cycles ═══

let track_melody2_chords = note(\`<
[[d5,fs5,b4] ~@5 [e5,g5,b4] ~@5 [b4,d5,fs5] ~@3] [[g4,a4,d5,b4] ~@5 [a4,e4,c5] ~@5 [b3,d4,g4] ~@3]
[[e5,c5] ~ [d5,a4] ~@3 [a4,fs4] ~ [g4,e4] ~@7] [~@12 [e5,b4] ~ [a4,d5] ~]
[~@4 [b4,g4] ~ [d5,a4] ~@5 [c5,a4] ~ [d4,g4,b4] ~] [~@4 [a4,e4] ~ [d4,b4,g4] ~@5 [g4,c5] ~ [a4,d5] ~]
~ ~
[[g5,b5] ~@5 [g5,a5,e5] ~@5 [g5,d5,b5] ~@3] [[e5,b5] ~@5 [d5,a5] ~@5 [b4,g5,e5] ~@3]
[[a4,b5,e5] ~ [b4,d5,a5] ~@3 [b4,g4] ~ [d5,a4] ~@7] [~@12 [b4,e5] ~ [a4,d5] ~]
[~@4 [g4,b4] ~ [a4,d5] ~@5 [a4,c5] ~ [g4,b4,d4] ~] [~@4 [a4,e4] ~ [g4,b4] ~@5 [e4,a4] ~ [d5,b3] ~]
~ ~
>\`)
  .s(MARIMBA)
  .release(1.6)
  .gain(1.2)
  .room(0.18);

let track_melody2_lead = note(\`<
d5 ~@5 e5 ~@5 fs5 ~@3 b4 ~@5 c5 ~@5 g4 ~@3
e5 ~ d5 ~@3 a4 ~ g4 ~@7 ~@12 e5 ~ d5 ~
~@4 b4 ~ d5 ~@5 c5 ~ b4 ~ ~@4 a4 ~ b4 ~@5 c5 ~ d5 ~
~ ~
b5 ~@5 a5 ~@5 b5 ~@3 b5 ~@5 a5 ~@5 g5 ~@3
e5 ~ a5 ~@3 g4 ~ a4 ~@7 ~@12 e5 ~ d5 ~
~@4 b4 ~ d5 ~@5 c5 ~ b4 ~ ~@4 a4 ~ b4 ~@5 a4 ~ d5 ~
~ ~
>\`)
  .s(HORN)
  .release(3.2)
  .gain(0.52)
  .delay(0.08)
  .room(0.22);

let track_melody2_echo = note(\`<
~ ~ ~ ~ ~ ~ ~ ~
[~@2 b5 ~@3 a5 ~@3 g5 ~@5] [~@2 e5 ~@3 d5 ~@3 b4 ~@5]
[~@2 a5 ~ b5 ~@3 a5 ~ g5 ~@5] [~@2 e5 ~ fs5 ~@3 d5 ~ b4 ~@5]
[~@4 g5 ~ e5 ~@5 c5 ~ b4 ~] [~@4 a4 ~ b4 ~@5 e5 ~ d5 ~]
~ ~
>\`)
  .s(PLUCK)
  .release(1.2)
  .gain(0.15)
  .delay(0.22)
  .room(0.35);

let track_melody2 = stack(
  track_melody2_chords,
  track_melody2_lead,
  track_melody2_echo
)
  .gain("<0.92 1 0.88 1>/8");

// ═══ Melody 3: climax, 16 cycles ═══

let track_melody3_lead = note(\`<
[[b4,g4] ~@5 c5 ~@5 d5 ~@3] [~ [c5,e5] ~@5 b5 ~@5 a5 ~@3]
[d4 [b4,d5] ~@4 fs5 ~@5 a5 ~@3] [[e4,g4,g5] ~@5 c5 ~@5 b4 ~@3]
[[d4,a3,a4] ~@6 b4 ~@4 c5 ~@3] [[c4,g4] d5 ~@4 e5 ~@5 fs5 ~@3]
[[b4,d4] ~@15] ~
[[g4,d4,b4] ~@5 c5 ~@5 d5 ~@3] [[e5,b4,e4] ~@5 b5 ~@5 a5 ~@3]
[[a4,fs4] [d5,d4] ~@4 a5 ~@5 fs5 ~@3] [~@2 c4 g4 [c5,g5] ~@11]
[[a4,e4,c4] ~@5 [b4,fs4] [d4,b3] ~@5 [c5,c4,g4,a4] ~@2] [fs3 [fs4,b3] ~@5 e4 ~@6 d4 ~]
[~@2 [d3,g3,b3] g4 ~@12] ~
>\`).s(HORN).transpose(12)
  .release(3.6)
  .gain("<1.72 1.78 1.84 1.9>/8")
  .room(0.24)
  .early(0.03);

let track_melody3_pad = note(\`<
[[g4,b4,d5] ~@15] [[c5,e5,g5] ~@15] [[d4,fs4,a4,d5] ~@15] [[e4,g4,b4,e5] ~@15]
[[a3,c4,e4,a4] ~@15] [[c4,e4,g4,c5] ~@15] [[g3,b3,d4,g4] ~@15] ~
[[g4,b4,d5,g5] ~@15] [[e4,g4,b4,e5] ~@15] [[d4,fs4,a4,d5] ~@15] [[c4,e4,g4,c5] ~@15]
[[a3,c4,e4,a4] ~@15] [[d4,fs4,a4,d5] ~@15] [[g3,b3,d4,g4] ~@15] ~
>\`)
  .transpose(-12)
  .s(PAD)
  .release(4.5)
  .gain("<0.18 0.22 0.28 0.36>/8")
  .room(0.48)
  .delay(0.12)
  .lpf("<1800 2200 2800 3600>/8");

let track_melody3_sparkle = note(\`<
~ ~ ~ ~ [~@8 e6 ~ g6 ~] [~@8 d6 ~ fs6 ~] ~ ~
[~@6 g6 ~ b6 ~@6] [~@6 e6 ~ a6 ~@6]
[~@4 fs6 ~ a6 ~@5 d7 ~] [~@4 e6 ~ g6 ~@5 c7 ~]
[~@4 e6 ~ fs6 ~@5 a6 ~] [~@4 d6 ~ e6 ~@5 fs6 ~]
[~@2 g6 ~ b6 ~ d7 ~@8] ~
>\`)
  .s(PLUCK)
  .release(1.1)
  .gain("<0.18 0.22 0.28 0.34>/8")
  .room(0.42)
  .delay(0.28);

let track_melody3_low = note(\`<
[g2 ~@15] [a2 ~@15] [d2 ~@15] [e2 ~@15]
[a2 ~@15] [c2 ~@15] [g2 ~@15] ~
[g2 ~@15] [e2 ~@15] [d2 ~@15] [c2 ~@15]
[a2 ~@15] [d2 ~@15] [g2 ~@15] ~
>\`)
  .s(KEY)
  .release(2.5)
  .gain(0.22)
  .lpf(700)
  .room(0.12);

let track_melody3 = stack(
  track_melody3_low,
  track_melody3_pad,
  track_melody3_lead,
  track_melody3_sparkle
)
  .gain("<0.88 0.94 1 1.06>/8");

// ═══ Arrangement: 10 + 16 + 16 = 42 cycles ═══

let track_melodies = arrange(
  [10, track_melody1],
  [16, track_melody2],
  [16, track_melody3]
)
  .room(0.18)
  .delay(0.12);

let track_pickup_accent = arrange(
  [32, s("~")],
  [2, note(\`<[g2 d3 a3 [b3,fs4] ~ b3 d4 ~] [g2 d3 a3 [fs4,b3] ~ a3 d4 ~]>\`)
    .s("piano")
    .gain(0.45)
    .room(0.2)
  ],
  [8, s("~")]
);

stack(
  track_arp_accompaniment,
  track_melodies,
  track_pickup_accent
)
  .cpm(cpm);`,
  },



  {
    id: "chop",
    name: "Chop",
    category: "Delay & Space",
    bpm: 90,
    key: "—",
    description: "Granular texture: looped sample chopped into 128 grains, jux(rev) stereo spread, heavy shape distortion",
    code: `// "Chop"
// @by Felix Roos

samples({ p: 'https://cdn.freesound.org/previews/648/648433_11943129-lq.mp3' })

s("p")
  .loopAt(32)
  .chop(128)
  .jux(rev)
  .shape(.4)
  .decay(.1)
  .sustain(.6)`,
  },
  {
    id: "orbit_delay",
    name: "Orbit Delay",
    category: "Delay & Space",
    bpm: 120,
    key: "—",
    description: "Multi-orbit delay: separate delay times per orbit channel, speed reversal with sometimes, ping-pong feel",
    code: `// "Orbit"
// @by Felix Roos

stack(
    s("bd <sd cp>")
    .delay(.5)
    .delaytime(.33)
    .delayfeedback(.6),
    s("hh*2")
    .delay(.8)
    .delaytime(.08)
    .delayfeedback(.7)
    .orbit(2)
  ).sometimes(x=>x.speed("-1"))`,
  },

  {
    id: "coastline",
    name: "Coastline",
    category: "Full Tracks",
    bpm: null,
    key: null,
    description: "Jazzy chord voicings, phaser, delay, evolving filters, perlin automation — eddyflux",
    code: `// "coastline" @by eddyflux
// @version 1.0
samples('github:eddyflux/crate')
setcps(.75)
let chords = chord("<Bbm9 Fm9>/4").dict('ireal')
stack(
  stack( // DRUMS
    s("bd").struct("<[x*<1 2> [~@3 x]] x>"),
    s("~ [rim, sd:<2 3>]").room("<0 .2>"),
    n("[0 <1 3>]*<2!3 4>").s("hh"),
    s("rd:<1!3 2>*2").mask("<0 0 1 1>/16").gain(.5)
  ).bank('crate')
  .mask("<[0 1] 1 1 1>/16".early(.5))
  , // CHORDS
  chords.offset(-1).voicing().s("gm_epiano1:1")
  .phaser(4).room(.5)
  , // MELODY
  n("<0!3 1*2>").set(chords).mode("root:g2")
  .voicing().s("gm_acoustic_bass"),
  chords.n("[0 <4 3 <2 5>>*2](<3 5>,8)")
  .anchor("D5").voicing()
  .segment(4).clip(rand.range(.4,.8))
  .room(.75).shape(.3).delay(.25)
  .fm(sine.range(3,8).slow(8))
  .lpf(sine.range(500,1000).slow(8)).lpq(5)
  .rarely(ply("2")).chunk(4, fast(2))
  .gain(perlin.range(.6, .9))
  .mask("<0 1 1 0>/16")
)
.late("[0 .01]*4").late("[0 .01]*2").size(4)`,
  },
  {
    id: "broken_cut_1",
    name: "Broken Cut 1",
    category: "Breakbeat & Glitch",
    bpm: null,
    key: null,
    description: "Chopped breaks, filtered bass, glitch textures, room reverb — froos",
    code: `// "broken cut 1" @by froos
// @version 1.0

samples('github:tidalcycles/dirt-samples')
samples({
  'slap': 'https://cdn.freesound.org/previews/495/495416_10350281-lq.mp3',
  'whirl': 'https://cdn.freesound.org/previews/495/495313_10350281-lq.mp3',
  'attack': 'https://cdn.freesound.org/previews/494/494947_10350281-lq.mp3'
})

setcps(1.25)

note("[c2 ~](3,8)*2,eb,g,bb,d").s("sawtooth")
  .noise(0.3)
  .lpf(perlin.range(800,2000).mul(0.6))
  .lpenv(perlin.range(1,5)).lpa(.25).lpd(.1).lps(0)
  .add.mix(note("<0!3 [1 <4!3 12>]>")).late(.5)
  .vib("4:.2")
  .room(1).roomsize(4).slow(4)
  .stack(
    s("bd").late("<0.01 .251>"),
    s("breaks165:1/2").fit()
    .chop(4).sometimesBy(.4, ply("2"))
    .sometimesBy(.1, ply("4")).release(.01)
    .gain(1.5).sometimes(mul(speed("1.05"))).cut(1)
    ,
    s("<whirl attack>?").delay(".8:.1:.8").room(2).slow(8).cut(2),
  ).reset("<x@30 [x*[8 [8 [16 32]]]]@2>".late(2))`,
  },
  {
    id: "acidic_tooth",
    name: "Acidic Tooth",
    category: "Acid & Bass",
    bpm: null,
    key: null,
    description: "Acid bassline, filter modulation, superimposed delay, sidechain pumping — eddyflux",
    code: `// "acidic tooth" @by eddyflux
// @version 1.0
  setcps(1)
  stack(
    note("[<g1 f1>/8](<3 5>,8)")
    .clip(perlin.range(.15,1.5))
    .release(.1)
    .s("sawtooth")
    .lpf(sine.range(400,800).slow(16))
    .lpq(cosine.range(6,14).slow(3))
    .lpenv(sine.mul(4).slow(4))
    .lpd(.2).lpa(.02)
    .ftype('24db')
    .rarely(add(note(12)))
    .room(.2).shape(.3).postgain(.5)
    .superimpose(x=>x.add(note(12)).delay(.5).bpf(1000))
    .gain("[.2 1@3]*2") // fake sidechain
    ,
    stack(
      s("bd*2").mask("<0@4 1@16>"),
      s("hh*8").gain(saw.mul(saw.fast(2))).clip(sine)
      .mask("<0@8 1@16>")
    ).bank('RolandTR909')
  )`,
  },
  {
    id: "caverave",
    name: "Caverave",
    category: "Delay & Space",
    bpm: null,
    key: null,
    description: "Deep cave reverb, echo textures, evolving drone",
    code: `// "Caverave"
// @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
// @by Felix Roos

const keys = x => x.s('sawtooth').cutoff(1200).gain(.5)
  .attack(0).decay(.16).sustain(.3).release(.1);

const drums = stack(
  s("bd*2").mask("<x@7 ~>/8").gain(.8),
  s("~ <sd!7 [sd@3 ~]>").mask("<x@7 ~>/4").gain(.5),
  s("[~ hh]*2").delay(.3).delayfeedback(.5).delaytime(.125).gain(.4)
);

const synths = stack(
  
  "<eb4 d4 c4 b3>/2"
  .scale("<C:minor!3 C:melodic:minor>/2")
  .struct("[~ x]*2")
  .layer(
    x=>x.scaleTranspose(0).early(0),
    x=>x.scaleTranspose(2).early(1/8),
    x=>x.scaleTranspose(7).early(1/4),
    x=>x.scaleTranspose(8).early(3/8)
  ).note().apply(keys).mask("<~ x>/16")
  .color('darkseagreen'),
  
  note("<C2 Bb1 Ab1 [G1 [G2 G1]]>/2")
  .struct("[x [~ x] <[~ [~ x]]!3 [x x]>@2]/2".fast(2))
  .s('sawtooth').attack(0.001).decay(0.2).sustain(1).cutoff(500)
  .color('brown'),
  chord("<Cm7 Bb7 Fm7 G7b13>/2")
  .struct("~ [x@0.2 ~]".fast(2))
  .dict('lefthand').voicing()
  .every(2, early(1/8))
  .apply(keys).sustain(0)
  .delay(.4).delaytime(.12)
  .mask("<x@7 ~>/8".early(1/4))
).add(note("<-1 0>/8"))
stack(
  drums.fast(2).color('tomato'), 
  synths
).slow(2)
  //.pianoroll({fold:1})`,
  },
  {
    id: "belldub",
    name: "Bell Dub",
    category: "Delay & Space",
    bpm: null,
    key: null,
    description: "Dub-style bell patterns, delay feedback, shape modulation",
    code: `// "Belldub"
// @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
// @by Felix Roos

samples({ bell: {b4:'https://cdn.freesound.org/previews/339/339809_5121236-lq.mp3'}})
// "Hand Bells, B, Single.wav" by InspectorJ (www.jshaw.co.uk) of Freesound.org
stack(
  // bass
  note("[0 ~] [2 [0 2]] [4 4*2] [[4 ~] [2 ~] 0@2]".scale('g1 dorian').superimpose(x=>x.add(.02)))
  .s('sawtooth').cutoff(200).resonance(20).gain(.15).shape(.6).release(.05),
  // perc
  s("[~ hh]*4").room("0 0.5".fast(2)).end(perlin.range(0.02,1)),
  s("mt lt ht").struct("x(3,8)").fast(2).gain(.5).room(.5).sometimes(x=>x.speed(".5")),
  s("misc:2").speed(1).delay(.5).delaytime(1/3).gain(.4),
  // chords
  chord("[~ Gm7] ~ [~ Dm7] ~")
  .dict('lefthand').voicing()
  .add(note("0,.1"))
  .s('sawtooth').gain(.8)
  .cutoff(perlin.range(400,3000).slow(8))
  .decay(perlin.range(0.05,.2)).sustain(0)
  .delay(.9).room(1),
  // blips
  note(
    "0 5 4 2".iter(4)
    .off(1/3, add(7))
    .scale('g4 dorian')
  ).s('square').cutoff(2000).decay(.03).sustain(0)
  .degradeBy(.2)
  .orbit(2).delay(.2).delaytime(".33 | .6 | .166 | .25")
  .room(1).gain(.5).mask("<0 1>/8"),
  // bell
  note(rand.range(0,12).struct("x(5,8,-1)").scale('g2 minor pentatonic')).s('bell').begin(.05)
  .delay(.2).degradeBy(.4).gain(.4)
  .mask("<1 0>/8")
).slow(5)`,
  },
  {
    id: "flatrave",
    name: "Flat Rave",
    category: "Filter & Modulation",
    bpm: null,
    key: null,
    description: "LFO filter sweeps, delay, evolving rave textures",
    code: `// "Flatrave"
// @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
// @by Felix Roos

stack(
  s("bd*2,~ [cp,sd]").bank('RolandTR909'),
  
  s("hh:1*4").sometimes(fast("2"))
  .rarely(x=>x.speed(".5").delay(.5))
  .end(perlin.range(0.02,.05).slow(8))
  .bank('RolandTR909').room(.5)
  .gain("0.4,0.4(5,8,-1)"),
  
  note("<0 2 5 3>".scale('G1 minor')).struct("x(5,8,-1)")
  .s('sawtooth').decay(.1).sustain(0)
  .lpa(.1).lpenv(-4).lpf(800).lpq(8),
  
  note("<G4 A4 Bb4 A4>,Bb3,D3").struct("~ x*2").s('square').clip(1)
  .cutoff(sine.range(500,4000).slow(16)).resonance(10)
  .decay(sine.slow(15).range(.05,.2)).sustain(0)
  .room(.5).gain(.3).delay(.2).mask("<0 1@3>/8"),
  
  "0 5 3 2".sometimes(slow(2)).off(1/8,add(5)).scale('G4 minor').note()
  .decay(.05).sustain(0).delay(.2).degradeBy(.5).mask("<0 1>/16")
)`,
  },
  {
    id: "amensister",
    name: "Amen Sister",
    category: "Breakbeat & Glitch",
    bpm: null,
    key: null,
    description: "Amen break chops, LPF automation, shape distortion",
    code: `// "Amensister"
// @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
// @by Felix Roos

samples('github:tidalcycles/dirt-samples')

stack(
  // amen
  n("0 1 2 3 4 5 6 7")
  .sometimes(x=>x.ply(2))
  .rarely(x=>x.speed("2 | -2"))
  .sometimesBy(.4, x=>x.delay(".5"))
  .s("amencutup")
  .slow(2)
  .room(.5)
  ,
  // bass
  sine.add(saw.slow(4)).range(0,7).segment(8)
  .superimpose(x=>x.add(.1))
  .scale('G0 minor').note()
  .s("sawtooth")
  .gain(.4).decay(.1).sustain(0)
  .lpa(.1).lpenv(-4).lpq(10)
  .cutoff(perlin.range(300,3000).slow(8))
  .degradeBy("0 0.1 .5 .1")
  .rarely(add(note("12")))
  ,
  // chord
  note("Bb3,D4".superimpose(x=>x.add(.2)))
  .s('sawtooth').lpf(1000).struct("<~@3 [~ x]>")
  .decay(.05).sustain(.0).delay(.8).delaytime(.125).room(.8)
  ,
  // alien
  s("breath").room(1).shape(.6).chop(16).rev().mask("<x ~@7>")
  ,
  n("0 1").s("east").delay(.5).degradeBy(.8).speed(rand.range(.5,1.5))
).reset("<x@7 x(5,8,-1)>")`,
  },
  {
    id: "juxUndTollerei",
    name: "Jux und Tollerei",
    category: "Stereo & Panning",
    bpm: null,
    key: null,
    description: "Jux stereo spread, delay, LPF modulation",
    code: `// "Jux und tollerei"
// @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
// @by Felix Roos

note("c3 eb3 g3 bb3").palindrome()
.s('sawtooth')
.jux(x=>x.rev().color('green').s('sawtooth'))
.off(1/4, x=>x.add(note("<7 12>/2")).slow(2).late(.005).s('triangle'))
.lpf(sine.range(200,2000).slow(8))
.lpa(.2).lpenv(-2)
.decay(.05).sustain(0)
.room(.6)
.delay(.5).delaytime(.1).delayfeedback(.4)
.pianoroll()`,
  },
  {
    id: "blippyRhodes",
    name: "Blippy Rhodes",
    category: "Melodic & Harmonic",
    bpm: null,
    key: null,
    description: "Rhodes-like tones, delay, room reverb",
    code: `// "Blippy Rhodes"
// @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
// @by Felix Roos

samples({
  bd: 'samples/tidal/bd/BT0A0D0.wav',
  sn: 'samples/tidal/sn/ST0T0S3.wav',
  hh: 'samples/tidal/hh/000_hh3closedhh.wav',
  rhodes: {
  E1: 'samples/rhodes/MK2Md2000.mp3',
  E2: 'samples/rhodes/MK2Md2012.mp3',
  E3: 'samples/rhodes/MK2Md2024.mp3',
  E4: 'samples/rhodes/MK2Md2036.mp3',
  E5: 'samples/rhodes/MK2Md2048.mp3',
  E6: 'samples/rhodes/MK2Md2060.mp3',
  E7: 'samples/rhodes/MK2Md2072.mp3'
  }
}, 'https://loophole-letters.vercel.app/')

stack(
  s("<bd sn> <hh hh*2 hh*3>").color('#00B8D4'),
  "<g4 c5 a4 [ab4 <eb5 f5>]>"
  .scale("<C:major C:mixolydian F:lydian [F:minor <Db:major Db:mixolydian>]>")
  .struct("x*8")
  .scaleTranspose("0 [-5,-2] -7 [-9,-2]")
  .slow(2)
  .note()
  .clip(.3)
  .s('rhodes')
  .room(.5)
  .delay(.3)
  .delayfeedback(.4)
  .delaytime(1/12).gain(.5).color('#7ED321'),
  "<c2 c3 f2 [[F2 C2] db2]>/2"
  .add("0,.02")
  .note().gain(.3)
  .clip("<1@3 [.3 1]>/2")
  .cutoff(600)
  .lpa(.2).lpenv(-4)
  .s('sawtooth').color('#F8E71C'),
).fast(3/2)
//.pianoroll({fold:1})`,
  },
  {
    id: "randomBells",
    name: "Random Bells",
    category: "Melodic & Harmonic",
    bpm: null,
    key: null,
    description: "Random bell patterns, echo, delay modulation",
    code: `// "Random bells"
// @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
// @by Felix Roos

samples({
  bell: { c6: 'https://cdn.freesound.org/previews/411/411089_5121236-lq.mp3' },
  bass: { d2: 'https://cdn.freesound.org/previews/608/608286_13074022-lq.mp3' }
})

stack(
  // bells
  n("0").euclidLegato(3,8)
  .echo(3, 1/16, .5)
  .add(n(rand.range(0,12)))
  .scale("D:minor:pentatonic")
  .velocity(rand.range(.5,1))
  .s('bell').gain(.6).delay(.2).delaytime(1/3).delayfeedback(.8),
  // bass
  note("<D2 A2 G2 F2>").euclidLegatoRot(6,8,4).s('bass').clip(1).gain(.8)
)
  .slow(6)
  .pianoroll({vertical:1})`,
  },
  {
    id: "arpoon",
    name: "Arpoon",
    category: "Melodic & Harmonic",
    bpm: null,
    key: null,
    description: "Arpeggiated patterns, delay, pan spread",
    code: `// "Arpoon"
// @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
// @by Felix Roos

samples('github:tidalcycles/dirt-samples')

n("[0,3] 2 [1,3] 2".fast(3).lastOf(4, fast(2))).clip(2)
  .offset("<<1 2> 2 1 1>")
  .chord("<<Am7 C^7> C7 F^7 [Fm7 E7b9]>")
  .dict('lefthand').voicing()
  .add(perlin.range(0,0.2).add("<-12 0>/8").note())
  .cutoff(perlin.range(500,4000)).resonance(12)
  .gain("<.5 .8>*16")
  .decay(.16).sustain(0.5)
  .delay(.2)
  .room(.5).pan(sine.range(.3,.6))
  .s('piano')
  .stack(
    "<<A1 C2>!2 F2 F2>"
    .add.out("0 -5".fast(2))
    .add("0,.12").note()
    .s('sawtooth').cutoff(180)
    .lpa(.1).lpenv(2)
  )
  .slow(4)
  .stack(s("bd*4, [~ [hh hh? hh?]]*2,~ [sd ~ [sd:2? bd?]]").bank('RolandTR909').gain(.5).slow(2))`,
  },


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
