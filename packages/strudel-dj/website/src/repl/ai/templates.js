/**
 * Genre Templates - High-quality few-shot examples for LLM generation
 * Source: strudel-claude-music-generator patterns + live-coding-music-mcp examples
 * 
 * Each genre has 'simple' and 'advanced' templates that demonstrate
 * correct Strudel syntax, proper sound usage, and professional structure.
 */

export const GENRE_TEMPLATES = {
  house: {
    simple: `// Deep House - C minor @ 124 BPM
setCpm(124/4)
stack(
  // Kick - four on the floor
  s("bd*4").gain(0.9),
  // Clap on 2 and 4
  s("~ cp ~ cp").gain(0.65).room(0.3),
  // Hi-hats - offbeat groove
  s("~ hh ~ hh").gain(0.4).hpf(6000).pan(0.6),
  // Open hat accent
  s("~ ~ ~ [~ oh]").gain(0.3).hpf(4000).delay(0.1),
  // Bass - synth bass with filter movement
  n("<0 0 3 5>").scale("C2:minor").sound("gm_synth_bass_1")
    .lpf(sine.range(300, 800).slow(8)).gain(0.8),
  // Chord stabs
  n("[0,2,4] ~ [3,5,0] ~").scale("C4:minor").sound("gm_epiano1")
    .gain(0.45).room(0.4).delay(0.125),
  // Pad - warm background
  n("<0 2 4 6> <3 5 7 0>").scale("C3:minor").sound("gm_pad_warm")
    .gain(0.3).room(0.6).slow(4)
)`,
    advanced: `// Progressive House - A minor @ 128 BPM
setCpm(128/4)
const energy = slider(0.6, 0, 1, 0.01)
const space = slider(0.4, 0, 1, 0.01)
stack(
  // Kick with sidechain feel
  s("bd*4").gain(0.92).lpf(200),
  // Rim for groove
  s("~ [~ rim] ~ rim").gain(0.35).hpf(2000),
  // Hats - 16th note shuffle
  s("hh*8").gain(energy.mul(0.4).add(0.15)).hpf(6000)
    .pan(perlin.range(0.3, 0.7)),
  // Clap with reverb
  s("~ cp ~ ~").gain(0.6).room(space.mul(0.5)).hpf(800),
  // Bass - driving eighth notes
  n("<0 0 5 3>*2").scale("A2:minor").sound("gm_synth_bass_1")
    .lpf(energy.mul(600).add(200)).gain(0.8),
  // Pluck melody
  n("0 [2 ~] 4 ~ 5 [~ 3] 2 0").scale("A4:minor").sound("gm_epiano1")
    .gain(0.5).delay(0.2).room(space.mul(0.3)),
  // Supersaw pad - filtered
  n("<[0,2,4] [3,5,7] [5,7,2] [4,6,1]>").scale("A3:minor").sound("supersaw")
    .lpf(energy.mul(2000).add(500)).gain(0.35).room(space.mul(0.6)).slow(2),
  // Atmospheric texture
  s("pink").gain(0.06).lpf(energy.mul(3000).add(500)).hpf(200)
    .room(0.8).pan(perlin.range(0.2, 0.8))
)`,
  },

  techno: {
    simple: `// Minimal Techno - E minor @ 132 BPM
setCpm(132/4)
stack(
  // Kick - punchy 4/4
  s("bd*4").gain(0.92).lpf(180).shape(0.1),
  // Snare on 2 and 4
  s("~ sd ~ sd").gain(0.7).hpf(400).room(0.15),
  // Hi-hats - driving 16ths
  s("hh*16").gain(sine.range(0.2, 0.45).slow(4)).hpf(8000),
  // Open hat accent
  s("~ ~ oh ~").gain(0.3).hpf(4000),
  // Bass - acid-style
  n("<0 0 0 -2>*4").scale("E2:minor").sound("sawtooth")
    .lpf(sine.range(300, 1200).slow(8)).gain(0.75).shape(0.2),
  // Ride for texture
  s("~ rd ~ rd").gain(0.2).hpf(8000).pan(0.7)
)`,
    advanced: `// Industrial Techno - A minor @ 138 BPM
setCpm(138/4)
const drive = slider(0.5, 0, 1, 0.01)
const darkness = slider(0.6, 0, 1, 0.01)
stack(
  // Heavy kick
  s("bd*4").gain(0.95).lpf(200).shape(drive.mul(0.3)),
  // Clap - distorted
  s("~ cp ~ [cp ~]").gain(0.7).shape(drive.mul(0.2)).room(0.1),
  // Hats - relentless
  s("hh*16").gain(drive.mul(0.3).add(0.15)).hpf(8000)
    .pan(perlin.range(0.3, 0.7)),
  // Ride - metallic
  s("[~ rd]*4").gain(0.25).hpf(10000).delay(0.05),
  // Bass - dark sawtooth
  n("<0 0 0 -2>*4").scale("A1:minor").sound("sawtooth")
    .lpf(darkness.mul(800).add(200)).shape(drive.mul(0.4)).gain(0.8),
  // Stab - dissonant
  n("~ [0,3,6] ~ ~").scale("A3:minor").sound("square")
    .lpf(darkness.mul(2000).add(500)).gain(0.45).room(0.2)
    .delay(0.125).delaytime(0.1875),
  // Atmosphere - dark texture
  s("brown").gain(0.08).lpf(darkness.mul(1000).add(200))
    .hpf(100).room(0.7).pan(perlin.range(0.2, 0.8)),
  // Noise sweep
  s("white").gain(drive.mul(0.06)).hpf(sine.range(2000, 12000).slow(16))
    .lpf(8000).pan(sine.range(0.3, 0.7).slow(7))
)`,
  },

  jazz: {
    simple: `// Modal Jazz - D Dorian @ 95 BPM
setCpm(95/4)
stack(
  // Brush-style kick
  s("bd ~ ~ [~ bd] ~ ~ bd ~").gain(0.5).lpf(200),
  // Snare ghost notes
  s("~ [~ sd] ~ [sd ~]").gain(0.4).hpf(600).room(0.4),
  // Ride cymbal - swing
  s("rd*3 [rd rd]").gain(0.35).hpf(6000),
  // Upright bass - walking
  n("0 2 4 5 3 1 6 4").scale("D2:dorian").sound("gm_acoustic_bass")
    .gain(0.7).room(0.2),
  // Piano comping - sparse
  n("[0,2,4] ~ [3,5,0] ~").scale("D3:dorian").sound("piano")
    .gain(0.5).room(0.4).delay(0.1),
  // Trumpet melody
  n("5 ~ [4 3] ~ 2 [~ 4] 5 6").scale("D4:dorian").sound("gm_trumpet")
    .gain(0.45).room(0.5).delay(0.15)
)`,
  },

  ambient: {
    simple: `// Ambient Drift - F Lydian @ 65 BPM
setCpm(65/4)
stack(
  // Evolving pad - main texture
  n("<0 2 4 6> <4 6 1 3>").scale("F3:lydian").sound("gm_pad_new_age")
    .gain(sine.range(0.25, 0.5).slow(16)).room(0.85).slow(4),
  // Bell melody - sparse and delayed
  n("~ 4 ~ ~ 6 ~ 2 ~").scale("F5:lydian").sound("gm_vibraphone")
    .gain(0.35).room(0.7).delay(0.4).delaytime(0.5).delayfeedback(0.5).slow(2),
  // Sub drone
  n("<0 4>").scale("F2:lydian").sound("sine")
    .gain(0.25).room(0.5).slow(8),
  // Texture - filtered noise
  s("pink").gain(0.05).lpf(sine.range(400, 2000).slow(32))
    .hpf(200).room(0.9).pan(perlin.range(0.2, 0.8)),
  // Crystal accents
  n("~ ~ 6 ~ ~ ~ 3 ~").scale("F6:lydian").sound("gm_glockenspiel")
    .gain(0.2).room(0.8).delay(0.5).slow(3)
)`,
  },

  dnb: {
    simple: `// Liquid DnB - A minor @ 174 BPM
setCpm(174/4)
stack(
  // Classic 2-step break pattern
  s("[bd ~ bd ~] [~ sd ~ ~]").gain(0.85),
  // Fast hats
  s("hh*8").gain(0.35).hpf(8000).pan(perlin.range(0.3, 0.7)),
  // Open hat offbeats
  s("~ [~ oh] ~ ~").gain(0.25).hpf(4000).room(0.2),
  // Reese bass - sub + harmonics
  n("<0 5 3 7>").scale("A1:minor").sound("sawtooth")
    .lpf(600).gain(0.8).shape(0.15),
  // Pad - liquid atmosphere
  n("<[0,2,4] [5,7,2] [3,5,0] [7,2,4]>").scale("A3:minor").sound("gm_pad_warm")
    .gain(0.35).room(0.6).slow(2),
  // Lead - smooth and delayed
  n("0 2 4 [~ 5] 7 5 [4 ~] 2").scale("A4:minor").sound("gm_epiano1")
    .gain(0.45).delay(0.2).room(0.4)
)`,
  },

  hiphop: {
    simple: `// Boom Bap - G minor @ 92 BPM
setCpm(92/4)
stack(
  // Kick - punchy boom bap
  s("bd ~ ~ [~ bd] ~ ~ bd ~").gain(0.9).lpf(200),
  // Snare - cracking
  s("~ ~ sd ~ ~ ~ sd ~").gain(0.8).hpf(400).room(0.15),
  // Hats - simple groove
  s("hh*4").gain(0.3).hpf(6000),
  // Open hat accent
  s("~ ~ ~ [~ oh]").gain(0.25),
  // Bass - deep and simple
  n("<0 0 3 5>").scale("G2:minor").sound("gm_synth_bass_1")
    .lpf(400).gain(0.8),
  // Rhodes chords
  n("[0,2,4] ~ [3,5,0] [~ [5,7,2]]").scale("G3:minor").sound("gm_epiano1")
    .gain(0.5).room(0.3).delay(0.1)
)`,
  },

  trap: {
    simple: `// Trap - F# minor @ 145 BPM
setCpm(145/4)
stack(
  // 808 kick - deep
  s("bd ~ ~ [~ bd] ~ ~ ~ [bd ~]").gain(0.95).lpf(150),
  // Snare - hard hitting
  s("~ ~ sd ~ ~ ~ sd ~").gain(0.8).hpf(300),
  // Hi-hats - triplet rolls
  s("hh*8 [hh*3] hh*8 [hh*6]").gain(0.4).hpf(8000)
    .pan(perlin.range(0.3, 0.7)),
  // 808 bass - sustaining sine
  n("<0 ~ 0 -2>*2").scale("F#1:minor").sound("sine")
    .gain(0.85).lpf(200).decay(0.8),
  // Melody - dark
  n("~ 7 ~ 5 ~ 3 ~ 0").scale("F#4:minor").sound("gm_lead_2_sawtooth")
    .lpf(2000).gain(0.4).delay(0.2).room(0.3)
)`,
  },

  lofi: {
    simple: `// Lo-fi Hip Hop - C minor @ 78 BPM
setCpm(78/4)
stack(
  // Kick - soft
  s("bd ~ ~ bd ~ ~ bd ~").gain(0.6).lpf(300),
  // Snare - muted
  s("~ ~ sd ~ ~ ~ sd ~").gain(0.5).lpf(3000).room(0.3),
  // Hats - dusty
  s("hh*4").gain(0.2).hpf(4000).lpf(8000),
  // Bass - warm
  n("<0 3 5 7>").scale("C2:minor").sound("gm_electric_bass_finger")
    .lpf(600).gain(0.6).room(0.2),
  // Piano - jazzy chords with vinyl feel
  n("[0,2,4] [3,5,0] [5,7,2] [4,6,1]").scale("C3:minor").sound("piano")
    .gain(0.45).room(0.4).lpf(3000),
  // Vibraphone melody - sparse
  n("~ 4 ~ ~ 6 ~ 2 ~").scale("C5:minor").sound("gm_vibraphone")
    .gain(0.3).room(0.5).delay(0.25)
)`,
  },

  dubstep: {
    simple: `// Dubstep - E minor @ 140 BPM
setCpm(140/4)
const wobble = slider(0.6, 0, 1, 0.01)
stack(
  // Kick
  s("bd ~ ~ ~ bd ~ ~ ~").gain(0.9).lpf(200),
  // Snare - heavy
  s("~ ~ sd ~ ~ ~ sd ~").gain(0.85).room(0.15),
  // Hats
  s("hh*8").gain(0.3).hpf(8000),
  // Wobble bass - characteristic LFO
  n("<0 0 3 5>*2").scale("E1:minor").sound("sawtooth")
    .lpf(sine.range(200, wobble.mul(3000).add(500)).fast(wobble.mul(4).add(1)))
    .gain(0.8).shape(0.3),
  // Mid bass layer
  n("<0 3 5 7>").scale("E2:minor").sound("square")
    .lpf(1000).gain(0.4).shape(0.1),
  // FX hits
  s("~ ~ ~ [~ cr]").gain(0.3).room(0.5).delay(0.3).hpf(2000)
)`,
  },

  reggae: {
    simple: `// Reggae - G major @ 80 BPM
setCpm(80/4)
stack(
  // One drop kick
  s("~ ~ bd ~").gain(0.85).lpf(200),
  // Snare on 3
  s("~ ~ sd ~").gain(0.7).room(0.2),
  // Rimshot - offbeat skank
  s("~ rim ~ rim").gain(0.4),
  // Hats
  s("hh*4").gain(0.25).hpf(6000),
  // Bass - root-fifth style
  n("0 ~ 4 ~ 0 ~ 4 ~").scale("G2:major").sound("gm_electric_bass_finger")
    .gain(0.75).lpf(500),
  // Organ skank - offbeat
  n("~ [0,2,4] ~ [0,2,4]").scale("G3:major").sound("gm_drawbar_organ")
    .gain(0.4).room(0.3),
  // Guitar skank
  n("~ [0,4] ~ [2,5]").scale("G4:major").sound("gm_electric_guitar_clean")
    .gain(0.35).room(0.2)
)`,
  },

  classical: {
    simple: `// Romantic Strings - D minor @ 72 BPM
setCpm(72/4)
stack(
  // Cello - bass line
  n("0 ~ 4 ~ 5 ~ 3 ~").scale("D2:minor").sound("gm_cello")
    .gain(0.6).room(0.5).slow(2),
  // Viola - inner voice
  n("[0,2] [4,6] [3,5] [2,4]").scale("D3:minor").sound("gm_viola")
    .gain(0.45).room(0.5).slow(2),
  // Violin 1 - melody
  n("5 4 3 2 0 2 4 5 7 5 4 2").scale("D4:minor").sound("gm_violin")
    .gain(0.5).room(0.6),
  // Violin 2 - countermelody
  n("~ 2 ~ 4 ~ 5 ~ 3").scale("D4:minor").sound("gm_violin")
    .gain(0.35).room(0.5).slow(2),
  // Timpani - sparse accents
  n("0 ~ ~ ~ ~ ~ ~ ~").scale("D2:minor").sound("gm_timpani")
    .gain(0.5).room(0.4).slow(4)
)`,
  },

  funk: {
    simple: `// Funk - E minor @ 110 BPM
setCpm(110/4)
stack(
  // Kick - syncopated
  s("bd ~ [~ bd] ~ bd ~ ~ [bd ~]").gain(0.85),
  // Snare - ghost notes
  s("~ [~ sd] sd ~ ~ [sd ~] sd [~ sd]").gain(0.6).hpf(400),
  // Hats - 16th note groove
  s("hh*8").gain(0.3).hpf(6000).pan(sine.range(0.4, 0.6)),
  // Open hat
  s("~ ~ ~ oh").gain(0.25),
  // Slap bass - funky line
  n("0 ~ [3 ~] 5 ~ [7 5] 3 0").scale("E2:minor").sound("gm_slap_bass_1")
    .gain(0.75).lpf(800),
  // Clavinet - rhythm
  n("[0,2,4] ~ [~ [3,5]] ~").scale("E4:minor").sound("gm_clavinet")
    .gain(0.5).hpf(800),
  // Brass stabs
  n("~ ~ [0,2,4,6] ~").scale("E3:minor").sound("gm_brass_section")
    .gain(0.4).room(0.2)
)`,
  },

  garage: {
    simple: `// UK Garage - C minor @ 134 BPM
setCpm(134/4)
stack(
  // Kick - shuffled
  s("bd ~ [~ bd] ~").gain(0.85),
  // Snare - 2-step
  s("~ sd ~ [~ sd]").gain(0.7).room(0.2),
  // Hats - swung 16ths
  s("hh*8").gain(0.35).hpf(6000).pan(perlin.range(0.3, 0.7)),
  // Rim ghost notes
  s("[~ rim] ~ [rim ~] ~").gain(0.3).hpf(3000),
  // Bass - wobbling
  n("<0 3 5 7>*2").scale("C2:minor").sound("gm_synth_bass_1")
    .lpf(sine.range(300, 900).slow(4)).gain(0.8),
  // Vocal chop pad
  n("[0,2,4] [3,5,7]").scale("C4:minor").sound("gm_choir_aahs")
    .gain(0.35).room(0.5).delay(0.15).slow(2)
)`,
  },

  trance: {
    simple: `// Uplifting Trance - A minor @ 140 BPM
setCpm(140/4)
const filter = slider(0.5, 0, 1, 0.01)
stack(
  // Kick
  s("bd*4").gain(0.9),
  // Clap on 2 and 4
  s("~ cp ~ cp").gain(0.65).room(0.2),
  // Offbeat hats
  s("~ hh ~ hh").gain(0.4).hpf(8000),
  // Open hat
  s("~ ~ ~ oh").gain(0.25).hpf(4000),
  // Bass - rolling
  n("<0 0 5 3>*4").scale("A1:minor").sound("sawtooth")
    .lpf(filter.mul(1000).add(200)).gain(0.8).shape(0.1),
  // Supersaw lead - anthem
  n("0 2 4 5 7 5 4 2").scale("A4:minor").sound("supersaw")
    .lpf(filter.mul(4000).add(1000)).gain(0.5).room(0.3).delay(0.125),
  // Pad - wide
  n("<[0,2,4] [3,5,7] [5,7,2] [4,6,1]>").scale("A3:minor").sound("gm_pad_sweep")
    .gain(0.3).room(0.6).slow(2)
)`,
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
