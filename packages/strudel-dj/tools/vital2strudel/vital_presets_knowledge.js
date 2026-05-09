// Vital Preset Knowledge Base for Strudel DJ AI
// Auto-generated — do not edit manually
// 75 presets from 13 packs

export const vitalPresets = {
  "banana_wob": {
    name: "Banana Wob",
    pack: "Afro",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(1)
    .warpmode("spin")
    .gain(0.707)
    // envelope
    .decay(1)
    .release(0.416)
    // filter
    .cutoff(54)
    .resonance(9.819)
    // effects
    .shape(0.344),
  note("c3 e3 g3 b3")
    .s("banana_wob_osc2")
    .warp(0.5)
    .gain(0.707)
    // envelope
    .decay(1)
    .release(0.416)
    // filter
    .cutoff(54)
    .resonance(9.819)
    // effects
    .shape(0.344)
)

// === Unmapped modulations (Vital-specific) ===
// macro_control_1 → osc_1_wave_frame (amount: 0.104)
// macro_control_1 → filter_1_cutoff (amount: 0.381)
// macro_control_1 → distortion_filter_cutoff (amount: 0.48)
// macro_control_1 → phaser_center (amount: -0.342)
// macro_control_1 → chorus_dry_wet (amount: 0.272)
// macro_control_1 → eq_low_cutoff (amount: 0.156)
// macro_control_1 → osc_1_level (amount: 1)
// macro_control_1 → phaser_dry_wet (amount: 0.624)`
  },
  "kick_drum_1": {
    name: "Kick Drum 1",
    pack: "Afro",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("kick_drum_1_osc1")
  .warp(0.5)
  // envelope
  .decay(0.608)
  .sustain(0)
  .release(0.334)
  // modulation
  .gain(sine.fast(16).range(0, 1))

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_transpose (amount: 0.63)
// lfo_3 → distortion_drive (amount: 0.245)`
  },
  "random_amp_growl": {
    name: "Random Amp Growl",
    pack: "Afro",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("triangle")
    .warp(0.765)
    .warpmode("bendm")
    .gain(0.707)
    // envelope
    .attack(0.654)
    .decay(1)
    .release(0.58)
    // filter
    .cutoff(135)
    .resonance(13.204)
    // effects
    .shape(0.11),
  note("c3 e3 g3 b3")
    .s("triangle")
    .warp(0.185)
    .warpmode("bendmp")
    .gain(0.707)
    // envelope
    .attack(0.654)
    .decay(1)
    .release(0.58)
    // filter
    .cutoff(135)
    .resonance(13.204)
    // effects
    .shape(0.11),
  note("c3 e3 g3 b3")
    .s("random_amp_growl_osc3")
    .warp(0.5)
    .gain(0.707)
    // envelope
    .attack(0.654)
    .decay(1)
    .release(0.58)
    // filter
    .cutoff(135)
    .resonance(13.204)
    // effects
    .shape(0.11)
)

// === Unmapped modulations (Vital-specific) ===
// macro_control_1 → osc_1_wave_frame (amount: 0.35)
// macro_control_1 → osc_3_level (amount: 0.912)
// macro_control_1 → osc_1_distortion_amount (amount: -0.23)
// macro_control_1 → osc_1_level (amount: 0.533)
// macro_control_1 → osc_2_wave_frame (amount: 0.543)
// macro_control_1 → osc_2_distortion_amount (amount: 0.225)
// macro_control_2 → osc_1_spectral_morph_amount (amount: 1)
// macro_control_1 → filter_1_cutoff (amount: 0.154)`
  },
  "cinema_bells": {
    name: "Cinema Bells",
    pack: "Billain",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(tri.fast(8).range(52, 239))
    // modulation (osc1)
    .gain(tri.fast(4).range(0, 1))
    // effects
    .room(0.165)
    .roomsize(0.5)
    .delay(0.333)
    .delaytime(0.514)
    .delayfeedback(0.632)
    .shape(0.17),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(tri.fast(8).range(52, 239))
    // modulation (osc2)
    .gain(tri.fast(8).range(0.21, 1))
    // effects
    .room(0.165)
    .roomsize(0.5)
    .delay(0.333)
    .delaytime(0.514)
    .delayfeedback(0.632)
    .shape(0.17),
  note("c3 e3 g3 b3")
    .s("cinema_bells_osc3")
    .unison(16)
    .detune(4.472)
    .spread(0.8)
    .gain(0.707)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(tri.fast(8).range(52, 239))
    // modulation (osc3)
    .warp(tri.fast(4).range(0.215, 0.785))
    // effects
    .room(0.165)
    .roomsize(0.5)
    .delay(0.333)
    .delaytime(0.514)
    .delayfeedback(0.632)
    .shape(0.17)
)

// === Unmapped modulations (Vital-specific) ===
// macro_control_3 → osc_3_level (amount: 1)
// mod_wheel → filter_1_cutoff (amount: 0.268)
// macro_control_2 → filter_2_cutoff (amount: 0.333)
// macro_control_1 → distortion_filter_cutoff (amount: 1)
// macro_control_1 → distortion_drive (amount: -0.155)
// macro_control_1 → filter_2_drive (amount: -1)
// macro_control_4 → chorus_dry_wet (amount: 0.395)
// macro_control_4 → reverb_dry_wet (amount: 0.835)`
  },
  "railgun": {
    name: "Railgun",
    pack: "Billain",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    .gain(0.707)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(21096)
    .resonance(9.925)
    // effects
    .room(0.065)
    .roomsize(0.5),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(21096)
    .resonance(9.925)
    // modulation (osc2)
    .gain(tri.fast(16).range(0, 1))
    // effects
    .room(0.065)
    .roomsize(0.5)
)

// === Unmapped modulations (Vital-specific) ===
// env_2 → osc_1_wave_frame (amount: 1)
// env_2 → osc_1_spectral_morph_amount (amount: 1)
// env_2 → osc_1_unison_voices (amount: 1)
// env_2 → filter_1_drive (amount: 0.25)
// env_2 → osc_1_transpose (amount: 0.21)
// env_2 → distortion_drive (amount: 0.29)
// env_2 → osc_2_wave_frame (amount: 1)
// env_2 → osc_2_spectral_morph_amount (amount: 1)`
  },
  "ceramic": {
    name: "Ceramic",
    pack: "Databroth",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("ceramic_osc1")
  .warp(0.998)
  .warpmode("quant")
  .gain(0.232)
  // envelope
  .attack(0.149)
  .decay(0.616)
  .sustain(0.328)
  .release(0.749)
  // filter
  .cutoff(sine.fast(16).range(2415, 3187))
  .resonance(18.428)
  // effects
  .room(0.261)
  .roomsize(0.26)
  .shape(0.18)

// === Unmapped modulations (Vital-specific) ===
// macro_control_1 → filter_1_resonance (amount: 0.25)
// macro_control_1 → filter_2_resonance (amount: -0.996)
// macro_control_1 → filter_fx_cutoff (amount: 0.469)
// macro_control_1 → env_1_release (amount: -0.16)
// macro_control_1 → env_1_decay (amount: -0.108)
// macro_control_1 → env_1_sustain (amount: -0.502)
// macro_control_2 → lfo_1_fade_time (amount: -1)
// macro_control_2 → filter_1_cutoff (amount: 0.086)`
  },
  "disrupt": {
    name: "Disrupt",
    pack: "Databroth",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("disrupt_osc1")
    .warp(0.724)
    .warpmode("bendp")
    .unison(16)
    .detune(4.472)
    .spread(0.8)
    .gain(0.707)
    // envelope
    .attack(0.149)
    .decay(1)
    .sustain(0.767)
    .release(0.876)
    // filter
    .cutoff(897)
    .resonance(10.396)
    .ftype("24db")
    // effects
    .room(0.117)
    .roomsize(0.5)
    .delay(0.133)
    .delaytime(0.25)
    .delayfeedback(0.268)
    .shape(0.411),
  note("c3 e3 g3 b3")
    .s("disrupt_osc2")
    .unison(16)
    .detune(3.468)
    .spread(0.8)
    // envelope
    .attack(0.149)
    .decay(1)
    .sustain(0.767)
    .release(0.876)
    // filter
    .cutoff(897)
    .resonance(10.396)
    .ftype("24db")
    // modulation (osc2)
    .warp(tri.fast(16).range(0, 1))
    .gain(tri.fast(16).range(0.029, 1))
    // effects
    .room(0.117)
    .roomsize(0.5)
    .delay(0.133)
    .delaytime(0.25)
    .delayfeedback(0.268)
    .shape(0.411),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warpmode("fold")
    // envelope
    .attack(0.149)
    .decay(1)
    .sustain(0.767)
    .release(0.876)
    // filter
    .cutoff(897)
    .resonance(10.396)
    .ftype("24db")
    // modulation (osc3)
    .warp(tri.fast(2).range(0, 0.566))
    .wt(tri.fast(4).range(0, 0.5))
    // effects
    .room(0.117)
    .roomsize(0.5)
    .delay(0.133)
    .delaytime(0.25)
    .delayfeedback(0.268)
    .shape(0.411)
)

// === Unmapped modulations (Vital-specific) ===
// env_4 → osc_1_level (amount: 1)
// note → osc_3_spectral_morph_amount (amount: -0.598)
// random_1 → eq_band_cutoff (amount: 0.523)
// random_2 → eq_band_gain (amount: 0.393)
// env_2 → osc_2_wave_frame (amount: 1)
// env_3 → osc_2_spectral_morph_amount (amount: 0.741)
// env_3 → osc_2_distortion_amount (amount: -0.555)
// env_4 → osc_1_transpose (amount: 0.628)`
  },
  "feeder": {
    name: "Feeder",
    pack: "Databroth",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.725)
    .warpmode("fold")
    .unison(16)
    .detune(2.564)
    .spread(0.8)
    .gain(0.707)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(sine.fast(4).range(29, 2356))
    .bandf(261)
    .bandq(10)
    // modulation (osc1)
    .wt(sine.fast(4).range(0, 0.5)),
  note("c3 e3 g3 b3")
    .s("triangle")
    .warpmode("bendmp")
    .gain(0.707)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(sine.fast(4).range(29, 2356))
    .bandf(261)
    .bandq(10)
    // modulation (osc2)
    .wt(sine.fast(4).range(0, 0.5))
    .warp(sine.fast(4).range(0.25, 0.75)),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .gain(0.707)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(sine.fast(4).range(29, 2356))
    .bandf(261)
    .bandq(10)
    // modulation (osc3)
    .wt(sine.fast(4).range(0, 0.5))
    .warp(sine.fast(4).range(0, 1))
)

// === Unmapped modulations (Vital-specific) ===
// random_2 → filter_fx_blend (amount: 1)
// lfo_1 → filter_1_resonance (amount: -0.423)
// random_1 → lfo_2_tempo (amount: 0.409)
// random_3 → filter_fx_mix (amount: -0.646)
// lfo_3 → chorus_dry_wet (amount: 1)
// lfo_1 → chorus_mod_depth (amount: 0.097)
// macro_control_1 → filter_fx_mix (amount: -1)
// macro_control_1 → reverb_dry_wet (amount: 0.556)`
  },
  "fleet": {
    name: "Fleet",
    pack: "Databroth",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("triangle")
    .warpmode("bendm")
    .unison(2)
    .detune(3.558)
    .spread(0.8)
    .gain(0.812)
    // envelope
    .attack(0.329)
    .decay(1.185)
    .release(1.355)
    // filter
    .cutoff(sine.fast(4).range(20, 321))
    // modulation (osc1)
    .warp(sine.slow(4).range(0.235, 0.785))
    // effects
    .room(0.311)
    .roomsize(0.5),
  note("c3 e3 g3 b3")
    .s("fleet_osc2")
    .wt(0.754)
    .warpmode("pwm")
    .unison(16)
    .detune(3.546)
    .spread(0.8)
    .gain(0.556)
    // envelope
    .attack(0.329)
    .decay(1.185)
    .release(1.355)
    // filter
    .cutoff(sine.fast(4).range(20, 321))
    // modulation (osc2)
    .warp(sine.fast(4).range(0.626, 1))
    // effects
    .room(0.311)
    .roomsize(0.5),
  note("c3 e3 g3 b3")
    .s("fleet_osc3")
    .wt(0.221)
    .warp(0.5)
    .gain(0.707)
    // envelope
    .attack(0.329)
    .decay(1.185)
    .release(1.355)
    // filter
    .cutoff(sine.fast(4).range(20, 321))
    // effects
    .room(0.311)
    .roomsize(0.5)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → filter_1_mix (amount: 0.865)
// lfo_2 → modulation_1_amount (amount: -0.447)
// lfo_2 → osc_2_unison_detune (amount: -0.998)
// lfo_1 → chorus_dry_wet (amount: -1)
// lfo_4 → reverb_dry_wet (amount: -0.474)
// lfo_3 → modulation_9_amount (amount: -0.499)
// lfo_6 → lfo_5_frequency (amount: 1)
// macro_control_1 → filter_2_mix (amount: -1)`
  },
  "gorgled": {
    name: "Gorgled",
    pack: "Databroth",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("triangle")
    .warp(0.5)
    .warpmode("bendm")
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .bandf(261)
    .bandq(15.586)
    // modulation (osc1)
    .wt(sine.fast(8).range(0, 0.5))
    // effects
    .shape(0.169),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    .unison(16)
    .detune(4.472)
    .spread(0.8)
    .gain(0.61)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .bandf(261)
    .bandq(15.586)
    // modulation (osc2)
    .wt(sine.fast(4).range(0, 0.297))
    // effects
    .shape(0.169),
  note("c3 e3 g3 b3")
    .s("gorgled_osc3")
    .warp(0.218)
    .warpmode("asym")
    .gain(0.707)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .bandf(261)
    .bandq(15.586)
    // effects
    .shape(0.169)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → filter_1_blend_transpose (amount: 1)
// lfo_2 → filter_2_blend_transpose (amount: 1)
// lfo_6 → distortion_drive (amount: 0.234)
// macro_control_1 → filter_fx_mix (amount: 0.998)
// macro_control_1 → lfo_7_tempo (amount: 0.042)
// macro_control_2 → osc_2_level (amount: 0.39)
// macro_control_2 → osc_1_level (amount: -0.96)
// macro_control_2 → chorus_dry_wet (amount: 1)`
  },
  "snowcrash": {
    name: "Snowcrash",
    pack: "Databroth",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("snowcrash_osc1")
    .warp(0.52)
    .warpmode("fold")
    .unison(15)
    .detune(3.69)
    .spread(0.8)
    .gain(0.707)
    // envelope
    .attack(1.313)
    .decay(1)
    .release(1.495)
    // filter
    .cutoff(tri.fast(16).range(435, 740))
    .bandf(568)
    .bandq(11.118)
    // modulation (osc1)
    .wt(tri.fast(2).range(0, 0.109))
    // effects
    .delay(0.333)
    .delaytime(0.333)
    .delayfeedback(0.5)
    .coarse(4),
  note("c3 e3 g3 b3")
    .s("snowcrash_osc2")
    .gain(0.707)
    // envelope
    .attack(1.313)
    .decay(1)
    .release(1.495)
    // filter
    .cutoff(tri.fast(16).range(435, 740))
    .bandf(568)
    .bandq(11.118)
    // effects
    .delay(0.333)
    .delaytime(0.333)
    .delayfeedback(0.5)
    .coarse(4),
  note("c3 e3 g3 b3")
    .s("snowcrash_osc3")
    .unison(16)
    .detune(2.651)
    .spread(0.8)
    .gain(0.707)
    // envelope
    .attack(1.313)
    .decay(1)
    .release(1.495)
    // filter
    .cutoff(tri.fast(16).range(435, 740))
    .bandf(568)
    .bandq(11.118)
    // effects
    .delay(0.333)
    .delaytime(0.333)
    .delayfeedback(0.5)
    .coarse(4)
)

// === Unmapped modulations (Vital-specific) ===
// macro_control_1 → modulation_2_amount (amount: 0.282)
// macro_control_1 → modulation_4_amount (amount: 0.051)
// macro_control_1 → modulation_3_amount (amount: 0.067)
// macro_control_1 → filter_1_resonance (amount: 0.303)
// macro_control_1 → modulation_13_amount (amount: 0.164)
// macro_control_1 → modulation_14_amount (amount: 0.103)
// macro_control_1 → modulation_15_amount (amount: -0.183)
// macro_control_1 → modulation_16_amount (amount: 0.076)`
  },
  "ah_eh_ee_oh": {
    name: "Ah Eh Ee Oh",
    pack: "Factory",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("sawtooth")
  .warp(0.7)
  .unison(16)
  .detune(1.072)
  .spread(0.8)
  .gain(0.707)
  // envelope
  .attack(0.268)
  .decay(1)
  .release(0.548)
  // filter
  .cutoff(677)
  // modulation
  .wt(tri.fast(64).range(0, 0.11))

// === Unmapped modulations (Vital-specific) ===
// random_1 → osc_1_wave_frame (amount: 0.74)
// random_2 → osc_1_spectral_morph_amount (amount: 0.6)
// macro_control_1 → osc_1_spectral_morph_amount (amount: 0.5)
// macro_control_2 → delay_dry_wet (amount: 0.667)
// mod_wheel → filter_1_cutoff (amount: 0.489)
// mod_wheel → filter_2_cutoff (amount: -0.432)
// macro_control_3 → filter_1_cutoff (amount: 0.465)
// macro_control_3 → filter_2_cutoff (amount: 0.621)`
  },
  "fm_drum_circle": {
    name: "FM Drum Circle",
    pack: "Factory",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("fm_drum_circle_osc1")
  // envelope
  .attack(0.21)
  .decay(1)
  .release(0.548)
  // filter
  .cutoff(523)
  .ftype("24db")
  // effects
  .shape(0.333)

// === Unmapped modulations (Vital-specific) ===
// random_1 → osc_2_transpose (amount: 0.5)
// random_2 → osc_3_transpose (amount: 0.498)
// mod_wheel → random_2_tempo (amount: 0.167)
// mod_wheel → random_1_tempo (amount: 0.167)
// mod_wheel → lfo_1_tempo (amount: 0.167)
// macro_control_1 → modulation_2_amount (amount: 0.102)
// macro_control_1 → modulation_4_amount (amount: 0.071)
// macro_control_1 → distortion_filter_cutoff (amount: 0.285)`
  },
  "plucked_string": {
    name: "Plucked String",
    pack: "Factory",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("sawtooth")
  // envelope
  .attack(0.115)
  .decay(0.936)
  .release(0.809)
  // filter
  .bandf(261)
  .bandq(19.8)
  // effects
  .room(0.394)
  .roomsize(0.5)
  .shape(0.397)

// === Unmapped modulations (Vital-specific) ===
// env_2 → sample_level (amount: 1)
// velocity → filter_2_cutoff (amount: 0.367)
// macro_control_1 → modulation_3_amount (amount: 0.377)
// macro_control_2 → filter_1_blend (amount: 1)
// macro_control_3 → reverb_decay_time (amount: 0.691)
// macro_control_1 → filter_1_blend_transpose (amount: 0.16)`
  },
  "shepard_tone_template": {
    name: "Shepard Tone Template",
    pack: "Factory",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("shepard_tone_template_osc1")
  .unison(10)
  .detune(3.097)
  .spread(0.8)
  .gain(0.707)
  // envelope
  .attack(0.149)
  .decay(1)
  .release(0.548)
  // modulation
  .warp(tri.range(0, 1))`
  },
  "staggered_phrases": {
    name: "Staggered Phrases",
    pack: "Factory",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .unison(14)
    .detune(1.32)
    .spread(0.8)
    .pan(0.785)
    .gain(0.707)
    // envelope
    .attack(0.329)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(1589)
    .resonance(11.489)
    .ftype("ladder")
    // modulation (osc1)
    .wt(sine.fast(16).range(0, 0.5))
    // effects
    .shape(0.119)
    .coarse(4),
  note("c3 e3 g3 b3")
    .s("staggered_phrases_osc3")
    .wt(0.335)
    .warp(0.5)
    .pan(0)
    // envelope
    .attack(0.329)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(1589)
    .resonance(11.489)
    .ftype("ladder")
    // effects
    .shape(0.119)
    .coarse(4)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_2 → lfo_1_tempo (amount: 0.552)
// lfo_1 → distortion_drive (amount: -0.862)
// macro_control_1 → filter_1_blend (amount: 0.502)
// macro_control_2 → filter_1_drive (amount: 0.771)
// lfo_3 → modulation_1_amount (amount: 1)
// mod_wheel → modulation_8_amount (amount: 0.433)
// macro_control_3 → distortion_filter_cutoff (amount: -0.485)
// macro_control_3 → distortion_filter_resonance (amount: 0.65)`
  },
  "text_to_wavetable_template": {
    name: "Text To Wavetable Template",
    pack: "Factory",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("sawtooth")
  .warp(0.5)
  .gain(0.707)
  // envelope
  .attack(0.149)
  .decay(1)
  .release(0.548)
  // modulation
  .wt(tri.fast(8).range(0, 0.5))`
  },
  "touch_tone": {
    name: "Touch Tone",
    pack: "Factory",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("touch_tone_osc1")
    // envelope
    .attack(0.218)
    .decay(1)
    .release(0.302),
  note("c3 e3 g3 b3")
    .s("touch_tone_osc2")
    // envelope
    .attack(0.218)
    .decay(1)
    .release(0.302)
)

// === Unmapped modulations (Vital-specific) ===
// note_in_octave → osc_1_transpose (amount: 0.5)
// note_in_octave → osc_1_tune (amount: 0.5)
// note_in_octave → osc_2_transpose (amount: 0.5)
// note_in_octave → osc_2_tune (amount: 0.5)
// note_in_octave → modulation_5_amount (amount: -1)
// note_in_octave → modulation_6_amount (amount: -1)`
  },
  "digestive_trauma": {
    name: "Digestive Trauma",
    pack: "Glorkglunk",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("triangle")
    .warpmode("bendm")
    .gain(0.707)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(261)
    // modulation (osc1)
    .wt(sine.fast(16).range(0, 0.435))
    .warp(sine.fast(16).range(0.335, 0.665))
    // effects
    .shape(0.08),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    .gain(0.707)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(261)
    // modulation (osc3)
    .wt(sine.fast(16).range(0, 0.14))
    // effects
    .shape(0.08)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_2 → distortion_drive (amount: -0.16)
// lfo_1 → chorus_dry_wet (amount: 0.62)
// macro_control_1 → osc_1_spectral_morph_amount (amount: 0.32)
// macro_control_2 → modulation_2_amount (amount: 0.141)
// macro_control_2 → filter_2_cutoff (amount: -0.298)
// macro_control_2 → filter_2_resonance (amount: 0.425)
// macro_control_2 → modulation_5_amount (amount: 0.164)
// macro_control_2 → distortion_filter_cutoff (amount: -0.35)`
  },
  "special_glitch_thing": {
    name: "Special Glitch Thing",
    pack: "Glorkglunk",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("sawtooth")
  .gain(0.707)
  // envelope
  .attack(0.149)
  .decay(1)
  .release(1.023)
  // filter
  .cutoff(tri.slow(4).range(80, 20))
  // modulation
  .warp(tri.slow(4).range(0, 1))
  .wt(tri.slow(4).range(0.5, 1))

// === Unmapped modulations (Vital-specific) ===
// random_1 → osc_1_distortion_amount (amount: 1)
// random_2 → osc_1_unison_detune (amount: 1)
// lfo_1 → osc_1_detune_power (amount: 1)
// random_3 → delay_frequency (amount: -0.67)
// macro_control_4 → distortion_mix (amount: 1)
// lfo_2 → filter_1_resonance (amount: 1)
// lfo_1 → filter_1_blend (amount: 1)
// random_4 → flanger_center (amount: 0.743)`
  },
  "squish_clicker": {
    name: "Squish Clicker",
    pack: "Glorkglunk",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("squish_clicker_osc1")
  .warp(0.5)
  .gain(0.707)
  // envelope
  .attack(0.149)
  .decay(1)
  .release(0.548)
  // filter
  .cutoff(tri.fast(8).range(79, 589))
  .resonance(17.045)
  // effects
  .shape(0.23)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_transpose (amount: -0.54)
// lfo_3 → filter_1_blend (amount: 0.79)
// macro_control_1 → osc_1_spectral_morph_amount (amount: 0.5)
// lfo_1 → delay_frequency (amount: -0.384)
// macro_control_2 → delay_dry_wet (amount: 1)
// macro_control_3 → osc_1_transpose (amount: 0.812)`
  },
  "thunk": {
    name: "THUNK",
    pack: "Glorkglunk",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("thunk_osc1")
  .gain(0.707)
  // envelope
  .attack(0.149)
  .decay(1)
  .release(0.548)
  // filter
  .cutoff(sine.fast(16).range(26, 567))
  // effects
  .shape(0.19)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → compressor_mix (amount: 1)
// lfo_1 → modulation_4_power (amount: -0.537)
// lfo_1 → voice_transpose (amount: 0.272)
// macro_control_1 → modulation_1_amount (amount: 0.46)
// macro_control_2 → modulation_4_amount (amount: 0.146)
// macro_control_3 → osc_1_distortion_amount (amount: 0.265)
// lfo_1 → distortion_drive (amount: 0.16)
// macro_control_4 → filter_fx_mix (amount: 1)`
  },
  "thumpus": {
    name: "Thumpus",
    pack: "Glorkglunk",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("triangle")
    .warp(0.58)
    .warpmode("bendm")
    .unison(6)
    .detune(2.472)
    .spread(0.8)
    .gain(0.707)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(tri.slow(8).range(20000, 2649))
    .ftype("24db")
    // modulation (osc1)
    .wt(tri.slow(8).range(0, 0.5)),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    .gain(0.707)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(tri.slow(8).range(20000, 2649))
    .ftype("24db")
    // modulation (osc2)
    .wt(tri.slow(8).range(0, 0.295)),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    .gain(0.645)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(tri.slow(8).range(20000, 2649))
    .ftype("24db")
    // modulation (osc3)
    .wt(tri.slow(8).range(0.523, 1))
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → filter_1_blend (amount: 1)
// lfo_2 → lfo_1_phase (amount: 1)
// macro_control_1 → modulation_6_power (amount: 0.5)
// macro_control_2 → osc_3_spectral_morph_amount (amount: 0.15)
// macro_control_2 → osc_1_spectral_morph_amount (amount: 0.33)
// lfo_1 → osc_2_transpose (amount: 0.5)
// macro_control_1 → modulation_11_power (amount: 0.5)
// macro_control_2 → osc_2_spectral_morph_amount (amount: 0.25)`
  },
  "swiss_army_knife": {
    name: "Swiss Army Knife",
    pack: "Halcyon Future Riddim Vol 1",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    .gain(0.707)
    // envelope
    .attack(0.042)
    .decay(1)
    .release(1.011)
    // filter
    .cutoff(68)
    .resonance(12.526)
    .ftype("24db")
    // effects
    .room(0.19)
    .roomsize(0.13)
    .delay(0.05)
    .delaytime(0.25)
    .delayfeedback(0.5)
    .shape(0.13),
  note("c3 e3 g3 b3")
    .s("swiss_army_knife_osc2")
    .wt(0.263)
    .warp(0.5)
    // envelope
    .attack(0.042)
    .decay(1)
    .release(1.011)
    // filter
    .cutoff(68)
    .resonance(12.526)
    .ftype("24db")
    // effects
    .room(0.19)
    .roomsize(0.13)
    .delay(0.05)
    .delaytime(0.25)
    .delayfeedback(0.5)
    .shape(0.13)
)

// === Unmapped modulations (Vital-specific) ===
// note → sample_transpose (amount: 0.61)
// lfo_4 → osc_1_tune (amount: 1)
// lfo_5 → osc_1_tune (amount: 0.05)
// mod_wheel → modulation_3_amount (amount: 0.7)
// mod_wheel → lfo_5_frequency (amount: 0.07)
// lfo_5 → osc_2_tune (amount: 0.017)
// mod_wheel → modulation_7_amount (amount: 0.08)
// mod_wheel → modulation_6_amount (amount: 0.802)`
  },
  "boot_scre3n": {
    name: "Boot Scre3n",
    pack: "Halcyon Future Riddim Vol 1",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .gain(0.707)
    // envelope
    .attack(0.625)
    .decay(0.667)
    .release(0.75)
    // modulation (osc1)
    .warp(sine.fast(16).range(0.435, 0.565))
    // effects
    .room(0.41)
    .roomsize(0.78),
  note("c3 e3 g3 b3")
    .s("boot_scre3n_osc2")
    .warpmode("sync")
    .unison(2)
    .detune(3.522)
    .spread(0.8)
    .gain(0.707)
    // envelope
    .attack(0.625)
    .decay(0.667)
    .release(0.75)
    // modulation (osc2)
    .warp(sine.fast(16).range(0.43, 0.57))
    // effects
    .room(0.41)
    .roomsize(0.78),
  note("c3 e3 g3 b3")
    .s("boot_scre3n_osc3")
    .unison(3)
    .detune(4.472)
    .spread(0.925)
    .gain(0.677)
    // envelope
    .attack(0.625)
    .decay(0.667)
    .release(0.75)
    // effects
    .room(0.41)
    .roomsize(0.78)
)

// === Unmapped modulations (Vital-specific) ===
// env_2 → osc_3_spectral_morph_amount (amount: -0.64)
// env_2 → osc_3_unison_detune (amount: -0.127)
// macro_control_1 → osc_1_spectral_morph_amount (amount: 0.06)
// macro_control_1 → osc_1_level (amount: 0.253)
// macro_control_2 → osc_2_spectral_morph_amount (amount: -0.45)
// macro_control_2 → osc_2_distortion_amount (amount: 0.45)
// macro_control_2 → osc_1_transpose (amount: 0.05)
// macro_control_2 → osc_2_level (amount: -0.087)`
  },
  "memory_leak": {
    name: "Memory Leak",
    pack: "Halcyon Future Riddim Vol 1",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("memory_leak_osc1")
    .wt(0.478)
    .warpmode("sync")
    .unison(2)
    .detune(2.522)
    .spread(0.8)
    .gain(0.707)
    // envelope
    .attack(0.601)
    .decay(1)
    .release(0.714)
    // modulation (osc1)
    .warp(sine.fast(16).range(0.34, 0.66))
    // effects
    .delay(1)
    .delaytime(0.111)
    .delayfeedback(0.03)
    .shape(0.26)
    .coarse(4),
  note("c3 e3 g3 b3")
    .s("memory_leak_osc2")
    .warp(0.5)
    .pan(0.375)
    .gain(0.707)
    // envelope
    .attack(0.601)
    .decay(1)
    .release(0.714)
    // effects
    .delay(1)
    .delaytime(0.111)
    .delayfeedback(0.03)
    .shape(0.26)
    .coarse(4),
  note("c3 e3 g3 b3")
    .s("memory_leak_osc3")
    .wt(0.471)
    .warp(0.5)
    .pan(0.62)
    .gain(0.707)
    // envelope
    .attack(0.601)
    .decay(1)
    .release(0.714)
    // effects
    .delay(1)
    .delaytime(0.111)
    .delayfeedback(0.03)
    .shape(0.26)
    .coarse(4)
)

// === Unmapped modulations (Vital-specific) ===
// macro_control_1 → osc_1_distortion_amount (amount: 0.2)
// macro_control_3 → sample_level (amount: 1)
// lfo_2 → voice_transpose (amount: 0.5)
// random_1 → osc_1_wave_frame (amount: -0.35)
// macro_control_2 → modulation_3_amount (amount: 0.18)
// macro_control_2 → osc_1_wave_frame (amount: -0.278)
// macro_control_3 → delay_feedback (amount: 0.315)
// macro_control_3 → delay_aux_frequency (amount: -0.07)`
  },
  "oolacile_evil_dubstep_bass": {
    name: "Oolacile Evil Dubstep Bass",
    pack: "Halcyon Future Riddim Vol 1",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("triangle")
    .warp(0.255)
    .warpmode("bendm")
    .gain(0.677)
    // envelope
    .attack(0.804)
    .decay(0.869)
    .sustain(0.365)
    .release(0.667)
    // filter
    .cutoff(sine.fast(16).range(39, 138))
    .resonance(11.782)
    // effects
    .shape(0.21),
  note("c3 e3 g3 b3")
    .s("triangle")
    .warp(0.5)
    .warpmode("bendm")
    .unison(4)
    .detune(4.472)
    .spread(0.8)
    .gain(0.632)
    // envelope
    .attack(0.804)
    .decay(0.869)
    .sustain(0.365)
    .release(0.667)
    // filter
    .cutoff(sine.fast(16).range(39, 138))
    .resonance(11.782)
    // effects
    .shape(0.21),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    .gain(0.707)
    // envelope
    .attack(0.804)
    .decay(0.869)
    .sustain(0.365)
    .release(0.667)
    // filter
    .cutoff(sine.fast(16).range(39, 138))
    .resonance(11.782)
    // effects
    .shape(0.21)
)

// === Unmapped modulations (Vital-specific) ===
// env_2 → osc_1_wave_frame (amount: 1)
// env_3 → osc_1_spectral_morph_amount (amount: -0.305)
// env_3 → osc_1_distortion_amount (amount: 0.21)
// env_2 → osc_2_wave_frame (amount: -0.54)
// env_3 → osc_2_spectral_morph_amount (amount: -1)
// env_3 → osc_3_wave_frame (amount: -0.406)
// env_4 → osc_3_spectral_morph_amount (amount: -0.51)
// env_5 → osc_3_tune (amount: 0.25)`
  },
  "satellites": {
    name: "Satellites",
    pack: "Halcyon Future Riddim Vol 1",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("satellites_osc1")
    .warp(0.5)
    .unison(4)
    .detune(4.472)
    .spread(0.8)
    .gain(0.165)
    // envelope
    .attack(0.673)
    .decay(1)
    .sustain(0.52)
    .release(0.845)
    // filter
    .cutoff(2407)
    .ftype("24db")
    // effects
    .room(0.13)
    .roomsize(0.335)
    .delay(0.173)
    .delaytime(0.5)
    .delayfeedback(0.62)
    .shape(0.03),
  note("c3 e3 g3 b3")
    .s("satellites_osc2")
    .gain(0.707)
    // envelope
    .attack(0.673)
    .decay(1)
    .sustain(0.52)
    .release(0.845)
    // filter
    .cutoff(2407)
    .ftype("24db")
    // effects
    .room(0.13)
    .roomsize(0.335)
    .delay(0.173)
    .delaytime(0.5)
    .delayfeedback(0.62)
    .shape(0.03),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    .gain(0.707)
    // envelope
    .attack(0.673)
    .decay(1)
    .sustain(0.52)
    .release(0.845)
    // filter
    .cutoff(2407)
    .ftype("24db")
    // effects
    .room(0.13)
    .roomsize(0.335)
    .delay(0.173)
    .delaytime(0.5)
    .delayfeedback(0.62)
    .shape(0.03)
)

// === Unmapped modulations (Vital-specific) ===
// random → osc_1_spectral_morph_amount (amount: 0.3)
// random → osc_1_tune (amount: -0.12)
// random → env_1_sustain (amount: 0.1)
// env_2 → osc_2_spectral_morph_amount (amount: -0.3)
// random → osc_2_level (amount: 0.173)
// random_1 → osc_1_tune (amount: 0.14)
// random_1 → osc_2_tune (amount: -0.2)
// velocity → osc_1_level (amount: 0.73)`
  },
  "space_station": {
    name: "Space Station",
    pack: "Halcyon Future Riddim Vol 1",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("space_station_osc1")
    .warp(0.5)
    .warpmode("bendmp")
    .unison(3)
    .detune(4.472)
    .spread(0.8)
    .gain(0.535)
    // envelope
    .attack(0.59)
    .decay(1)
    .release(0.762)
    // filter
    .cutoff(sine.fast(4).range(84, 1580))
    .resonance(3.168)
    // effects
    .delay(0.655)
    .delaytime(0.145)
    .delayfeedback(-0.62),
  note("c3 e3 g3 b3")
    .s("space_station_osc2")
    .warpmode("sync")
    .gain(0.442)
    // envelope
    .attack(0.59)
    .decay(1)
    .release(0.762)
    // filter
    .cutoff(sine.fast(4).range(84, 1580))
    .resonance(3.168)
    // modulation (osc2)
    .warp(sine.fast(2).range(0.24, 0.76))
    // effects
    .delay(0.655)
    .delaytime(0.145)
    .delayfeedback(-0.62),
  note("c3 e3 g3 b3")
    .s("space_station_osc3")
    .warp(0.095)
    .warpmode("bendm")
    .unison(7)
    .detune(4.472)
    .spread(0.8)
    // envelope
    .attack(0.59)
    .decay(1)
    .release(0.762)
    // filter
    .cutoff(sine.fast(4).range(84, 1580))
    .resonance(3.168)
    // modulation (osc3)
    .gain(sine.fast(2).range(0.425, 1))
    // effects
    .delay(0.655)
    .delaytime(0.145)
    .delayfeedback(-0.62)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_detune_range (amount: -0.34)
// lfo_1 → osc_3_detune_range (amount: 0.4)
// lfo_2 → distortion_drive (amount: 0.536)
// lfo_1 → filter_1_drive (amount: 0.85)
// lfo_4 → chorus_dry_wet (amount: 0.21)
// lfo_1 → stereo_routing (amount: 0.33)
// lfo_5 → delay_dry_wet (amount: 0.263)
// macro_control_3 → osc_1_distortion_amount (amount: -0.36)`
  },
  "simple_weoum": {
    name: "Simple Weoum",
    pack: "Halcyon Future Riddim Vol 1",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(tri.fast(2).range(378, 2639))
    // modulation (osc1)
    .wt(tri.fast(32).range(0.121, 0.311))
    .gain(tri.fast(2).range(0, 1))
    // effects
    .delay(0.233)
    .delaytime(0.292)
    .delayfeedback(0.26)
    .shape(0.19),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(tri.fast(2).range(378, 2639))
    // modulation (osc2)
    .gain(tri.fast(2).range(0, 1))
    // effects
    .delay(0.233)
    .delaytime(0.292)
    .delayfeedback(0.26)
    .shape(0.19),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(tri.fast(2).range(378, 2639))
    // modulation (osc3)
    .gain(tri.fast(2).range(0, 1))
    // effects
    .delay(0.233)
    .delaytime(0.292)
    .delayfeedback(0.26)
    .shape(0.19)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → flanger_center (amount: -0.188)
// lfo_2 → flanger_dry_wet (amount: 0.545)
// lfo_1 → phaser_center (amount: -0.092)
// macro_control_1 → flanger_center (amount: 0.202)
// macro_control_2 → phaser_center (amount: 0.352)
// macro_control_3 → delay_frequency (amount: 0.167)
// mod_wheel → lfo_2_frequency (amount: 0.16)`
  },
  "vlt_future_gun": {
    name: "VLT Future Gun",
    pack: "Halcyon Future Riddim Vol 1",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("vlt_future_gun_osc1")
    // envelope
    .attack(0.149)
    .decay(0.96)
    .release(0.402)
    // filter
    .cutoff(259)
    // modulation (osc1)
    .warp(tri.fast(64).range(0.164, 0.836))
    .gain(tri.fast(64).range(0.178, 1))
    // effects
    .shape(0.377),
  note("c3 e3 g3 b3")
    .s("vlt_future_gun_osc2")
    .warpmode("fold")
    // envelope
    .attack(0.149)
    .decay(0.96)
    .release(0.402)
    // filter
    .cutoff(259)
    // modulation (osc2)
    .warp(tri.fast(64).range(0.46, 0.784))
    .gain(tri.fast(64).range(0, 1))
    // effects
    .shape(0.377),
  note("c3 e3 g3 b3")
    .s("vlt_future_gun_osc3")
    .warp(0.5)
    .gain(0.709)
    // envelope
    .attack(0.149)
    .decay(0.96)
    .release(0.402)
    // filter
    .cutoff(259)
    // effects
    .shape(0.377)
)

// === Unmapped modulations (Vital-specific) ===
// stereo → osc_2_distortion_amount (amount: 0.049)
// macro_control_1 → lfo_1_tempo (amount: 0.148)
// env_1 → reverb_dry_wet (amount: 0.263)
// macro_control_2 → osc_2_distortion_amount (amount: 0.298)
// macro_control_3 → modulation_9_amount (amount: 0.236)
// macro_control_3 → modulation_11_amount (amount: 0.5)
// lfo_2 → osc_3_transpose (amount: 0.5)
// macro_control_4 → osc_2_spectral_morph_amount (amount: 0.309)`
  },
  "analog_pad": {
    name: "Analog Pad",
    pack: "In The Mix",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    .unison(7)
    .detune(3.022)
    .spread(0.8)
    .gain(0.305)
    // envelope
    .attack(0.518)
    .decay(1.057)
    .sustain(0.611)
    .release(0.892)
    // filter
    .cutoff(100)
    // modulation (osc1)
    .wt(tri.fast(2).range(0, 0.5)),
  note("c3 e3 g3 b3")
    .s("analog_pad_osc2")
    .warp(0.403)
    .warpmode("bendmp")
    .gain(0.105)
    // envelope
    .attack(0.518)
    .decay(1.057)
    .sustain(0.611)
    .release(0.892)
    // filter
    .cutoff(100)
)

// === Unmapped modulations (Vital-specific) ===
// macro_control_1 → filter_1_cutoff (amount: 0.311)
// random_1 → osc_2_distortion_amount (amount: 0.155)
// velocity → osc_1_level (amount: 0.84)
// velocity → osc_2_level (amount: 0.41)
// macro_control_2 → reverb_dry_wet (amount: 0.46)
// macro_control_3 → delay_dry_wet (amount: 0.25)
// macro_control_4 → distortion_drive (amount: 0.295)`
  },
  "distant_majestic_lead": {
    name: "Distant Majestic Lead",
    pack: "In The Mix",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("sawtooth")
  .warp(0.495)
  .unison(8)
  .spread(0.8)
  .gain(0.707)
  // envelope
  .attack(0.274)
  .decay(0.89)
  .sustain(0.064)
  // filter
  .cutoff(21096)

// === Unmapped modulations (Vital-specific) ===
// velocity → osc_1_level (amount: 1)
// note → filter_1_cutoff (amount: -0.25)
// macro_control_1 → reverb_dry_wet (amount: 1)
// macro_control_2 → delay_dry_wet (amount: 0.207)
// macro_control_3 → filter_fx_cutoff (amount: 0.402)
// macro_control_3 → filter_fx_mix (amount: 0.488)
// macro_control_4 → env_1_release (amount: 1)`
  },
  "growl_bass_sidechain": {
    name: "Growl Bass Sidechain",
    pack: "In The Mix",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    // envelope
    .attack(0.257)
    .decay(0.834)
    .release(0.488)
    // filter
    .cutoff(10786)
    .resonance(1.368)
    // modulation (osc1)
    .gain(tri.fast(32).range(0.707, 1)),
  note("c3 e3 g3 b3")
    .s("growl_bass_sidechain_osc2")
    .wt(0.411)
    .warp(0.5)
    .unison(12)
    .detune(2.9)
    .spread(0.8)
    // envelope
    .attack(0.257)
    .decay(0.834)
    .release(0.488)
    // filter
    .cutoff(10786)
    .resonance(1.368)
    // modulation (osc2)
    .gain(tri.fast(32).range(0.587, 1))
)

// === Unmapped modulations (Vital-specific) ===
// macro_control_4 → chorus_dry_wet (amount: 1)
// macro_control_3 → reverb_dry_wet (amount: 0.36)
// macro_control_1 → eq_low_gain (amount: 0.105)
// macro_control_2 → filter_fx_cutoff (amount: 1)
// macro_control_4 → osc_2_spectral_morph_amount (amount: 0.135)
// macro_control_1 → distortion_mix (amount: 0.27)
// random_1 → osc_1_spectral_morph_amount (amount: 0.14)`
  },
  "moog_pluck": {
    name: "Moog Pluck",
    pack: "In The Mix",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("moog_pluck_osc1")
    .wt(0.411)
    .warp(0.5)
    .gain(0.772)
    // envelope
    .attack(0.369)
    .decay(1.187)
    .sustain(0.558)
    .release(0.571)
    // filter
    .cutoff(29)
    .ftype("24db")
    .lpenv(0.77)
    .lpdecay(1.023)
    .lpsustain(0.232)
    .lprelease(0.548),
  note("c3 e3 g3 b3")
    .s("moog_pluck_osc2")
    .wt(0.403)
    .warp(0.73)
    .warpmode("bendm")
    .unison(5)
    .detune(3.1)
    .spread(0.8)
    .gain(0.27)
    // envelope
    .attack(0.369)
    .decay(1.187)
    .sustain(0.558)
    .release(0.571)
    // filter
    .cutoff(29)
    .ftype("24db")
    .lpenv(0.77)
    .lpdecay(1.023)
    .lpsustain(0.232)
    .lprelease(0.548)
)

// === Unmapped modulations (Vital-specific) ===
// macro_control_1 → reverb_dry_wet (amount: 0.27)
// macro_control_2 → env_1_attack (amount: 0.14)
// macro_control_3 → filter_fx_cutoff (amount: 1)`
  },
  "strings_section": {
    name: "Strings Section",
    pack: "In The Mix",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("strings_section_osc1")
    .unison(7)
    .detune(2.622)
    .spread(0.8)
    .gain(0.707)
    // envelope
    .attack(0.899)
    .decay(1.544)
    .sustain(0.656)
    .release(1.19)
    // filter
    .cutoff(469)
    .lpenv(0.133)
    .lpattack(0.911)
    .lpdecay(1.455)
    .lpsustain(0.224)
    .lprelease(0.548)
    // effects
    .delay(0.113)
    .delaytime(0.25)
    .delayfeedback(0.33)
    .shape(0.05),
  note("c3 e3 g3 b3")
    .s("strings_section_osc2")
    .warp(0.36)
    .warpmode("asym")
    .unison(7)
    .detune(3.15)
    .spread(0.8)
    .gain(0.707)
    // envelope
    .attack(0.899)
    .decay(1.544)
    .sustain(0.656)
    .release(1.19)
    // filter
    .cutoff(469)
    .lpenv(0.133)
    .lpattack(0.911)
    .lpdecay(1.455)
    .lpsustain(0.224)
    .lprelease(0.548)
    // effects
    .delay(0.113)
    .delaytime(0.25)
    .delayfeedback(0.33)
    .shape(0.05)
)

// === Unmapped modulations (Vital-specific) ===
// velocity → osc_1_level (amount: 0.69)
// velocity → osc_2_level (amount: 0.943)
// macro_control_1 → filter_1_cutoff (amount: 0.116)
// macro_control_2 → env_1_attack (amount: 0.237)
// lfo_1 → lfo_2_frequency (amount: 0.18)
// lfo_2 → osc_1_unison_detune (amount: 0.068)
// macro_control_3 → reverb_dry_wet (amount: 0.6)
// macro_control_3 → reverb_decay_time (amount: 0.395)`
  },
  "complex_electro_1": {
    name: "Complex Electro 1",
    pack: "Level 8",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("sawtooth")
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(tri.fast(4).range(2946, 20000))
    // modulation (osc1)
    .gain(tri.fast(4).range(0.4, 1))
    // effects
    .room(0.065)
    .roomsize(0.245),
  note("c3 e3 g3 b3")
    .s("complex_electro_1_osc2")
    .warp(0.5)
    .unison(3)
    .spread(1)
    .gain(0.707)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(tri.fast(4).range(2946, 20000))
    // effects
    .room(0.065)
    .roomsize(0.245),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    .gain(0.707)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(tri.fast(4).range(2946, 20000))
    // modulation (osc3)
    .wt(tri.fast(32).range(0, 0.5))
    // effects
    .room(0.065)
    .roomsize(0.245)
)

// === Unmapped modulations (Vital-specific) ===
// macro_control_1 → filter_1_cutoff (amount: -0.81)
// macro_control_2 → modulation_6_amount (amount: 0.199)
// macro_control_2 → volume (amount: -0.37)
// macro_control_3 → osc_1_wave_frame (amount: 1)
// macro_control_3 → osc_1_spectral_morph_amount (amount: -0.53)
// note → macro_control_3 (amount: 0.28)
// macro_control_4 → distortion_mix (amount: 0.58)
// mod_wheel → filter_1_cutoff (amount: 1)`
  },
  "crescendo_bells": {
    name: "Crescendo Bells",
    pack: "Level 8",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("crescendo_bells_osc1")
    .warp(0.5)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(1.154)
    // filter
    .cutoff(tri.fast(8).range(173, 2381))
    .resonance(6.19)
    // modulation (osc1)
    .gain(tri.fast(8).range(0.23, 1))
    // effects
    .room(0.465)
    .roomsize(0.605)
    .delay(0.258)
    .delaytime(0.333)
    .delayfeedback(0.5),
  note("c3 e3 g3 b3")
    .s("crescendo_bells_osc2")
    .wt(0.073)
    .warp(0.5)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(1.154)
    // filter
    .cutoff(tri.fast(8).range(173, 2381))
    .resonance(6.19)
    // modulation (osc2)
    .gain(tri.fast(8).range(0.17, 1))
    // effects
    .room(0.465)
    .roomsize(0.605)
    .delay(0.258)
    .delaytime(0.333)
    .delayfeedback(0.5),
  note("c3 e3 g3 b3")
    .s("crescendo_bells_osc3")
    .wt(0.161)
    .warp(0.5)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(1.154)
    // filter
    .cutoff(tri.fast(8).range(173, 2381))
    .resonance(6.19)
    // modulation (osc3)
    .gain(tri.fast(8).range(0.18, 1))
    // effects
    .room(0.465)
    .roomsize(0.605)
    .delay(0.258)
    .delaytime(0.333)
    .delayfeedback(0.5)
)

// === Unmapped modulations (Vital-specific) ===
// macro_control_2 → flanger_dry_wet (amount: 0.78)
// lfo_5 → lfo_3_delay_time (amount: -0.22)
// lfo_5 → lfo_2_delay_time (amount: -0.13)
// macro_control_1 → lfo_2_delay_time (amount: -0.09)
// macro_control_1 → lfo_3_delay_time (amount: -0.18)
// velocity → volume (amount: 0.165)
// velocity → reverb_dry_wet (amount: 0.175)
// velocity → delay_dry_wet (amount: 0.107)`
  },
  "damped_horn": {
    name: "Damped Horn",
    pack: "Level 8",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    .unison(8)
    .detune(1.722)
    .spread(0.8)
    .gain(0.452)
    // envelope
    .attack(0.863)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(tri.fast(16).range(20, 67))
    .resonance(4.095)
    // modulation (osc1)
    .wt(tri.fast(16).range(0, 0.5))
    // effects
    .room(0.33)
    .roomsize(0.5)
    .delay(0.163)
    .delaytime(0.333)
    .delayfeedback(0.35)
    .shape(0.1),
  note("c3 e3 g3 b3")
    .s("damped_horn_osc2")
    .warp(0.5)
    .unison(7)
    .detune(4.672)
    .spread(0.33)
    .gain(0.147)
    // envelope
    .attack(0.863)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(tri.fast(16).range(20, 67))
    .resonance(4.095)
    // effects
    .room(0.33)
    .roomsize(0.5)
    .delay(0.163)
    .delaytime(0.333)
    .delayfeedback(0.35)
    .shape(0.1),
  note("c3 e3 g3 b3")
    .s("damped_horn_osc3")
    .warp(0.5)
    .unison(6)
    .detune(4.572)
    .spread(0.305)
    .gain(0.707)
    // envelope
    .attack(0.863)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(tri.fast(16).range(20, 67))
    .resonance(4.095)
    // effects
    .room(0.33)
    .roomsize(0.5)
    .delay(0.163)
    .delaytime(0.333)
    .delayfeedback(0.35)
    .shape(0.1)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_3 → voice_tune (amount: -0.276)
// lfo_4 → voice_tune (amount: 0.276)
// macro_control_1 → lfo_4_smooth_time (amount: -0.99)
// velocity → filter_2_cutoff (amount: 0.55)
// macro_control_2 → lfo_5_smooth_time (amount: -0.93)
// velocity → filter_1_cutoff (amount: 0.81)
// env_2 → osc_2_unison_detune (amount: 0.093)
// macro_control_3 → osc_3_level (amount: -0.13)`
  },
  "fm_mode": {
    name: "FM Mode",
    pack: "Level 8",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("fm_mode_osc1")
  .warp(0.095)
  .warpmode("asym")
  // envelope
  .attack(0.149)
  .decay(1)
  .release(0.999)
  // filter
  .cutoff(tri.fast(32).range(25, 163))
  .resonance(2.381)
  // modulation
  .gain(tri.fast(32).range(0.21, 1))
  // effects
  .room(0.57)
  .roomsize(0.5)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → compressor_release (amount: -0.74)
// lfo_1 → reverb_dry_wet (amount: -0.375)
// lfo_1 → distortion_mix (amount: 0.58)
// lfo_1 → distortion_drive (amount: 0.05)
// lfo_1 → filter_1_resonance (amount: 0.221)
// lfo_1 → filter_2_resonance (amount: 0.229)
// macro_control_1 → modulation_2_amount (amount: 0.178)
// velocity → modulation_3_amount (amount: 0.097)`
  },
  "horror_of_melbourne_1": {
    name: "Horror of Melbourne 1",
    pack: "Level 8",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("horror_of_melbourne_1_osc1")
    .gain(0.707)
    // envelope
    .attack(0.34)
    .decay(1)
    .release(0.512)
    // filter
    .cutoff(101)
    .resonance(20)
    // effects
    .room(0.445)
    .roomsize(0.5),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .gain(0.707)
    // envelope
    .attack(0.34)
    .decay(1)
    .release(0.512)
    // filter
    .cutoff(101)
    .resonance(20)
    // effects
    .room(0.445)
    .roomsize(0.5)
)

// === Unmapped modulations (Vital-specific) ===
// macro_control_1 → distortion_filter_resonance (amount: 0.06)
// macro_control_2 → distortion_mix (amount: 1)
// env_1 → reverb_dry_wet (amount: -0.95)
// macro_control_3 → filter_1_cutoff (amount: 0.768)
// macro_control_1 → filter_2_cutoff (amount: 0.595)
// mod_wheel → osc_2_level (amount: 0.77)
// mod_wheel → osc_1_level (amount: -1)
// macro_control_4 → modulation_10_amount (amount: 0.5)`
  },
  "smoker_s_lounge": {
    name: "Smoker's Lounge",
    pack: "Level 8",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    .unison(7)
    .detune(3.622)
    .spread(0.8)
    .gain(0.762)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.976)
    // filter
    .cutoff(tri.fast(16).range(20, 242))
    .resonance(2.857)
    // modulation (osc1)
    .wt(tri.fast(16).range(0.341, 0.447))
    // effects
    .room(0.345)
    .roomsize(0.5),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    .unison(7)
    .detune(3.122)
    .spread(0.8)
    .gain(0.692)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.976)
    // filter
    .cutoff(tri.fast(16).range(20, 242))
    .resonance(2.857)
    // effects
    .room(0.345)
    .roomsize(0.5),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    .unison(8)
    .detune(2.372)
    .spread(0.8)
    .gain(0.727)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.976)
    // filter
    .cutoff(tri.fast(16).range(20, 242))
    .resonance(2.857)
    // effects
    .room(0.345)
    .roomsize(0.5)
)

// === Unmapped modulations (Vital-specific) ===
// velocity → filter_1_cutoff (amount: 0.381)
// macro_control_1 → filter_1_cutoff (amount: 0.828)
// macro_control_2 → distortion_mix (amount: 1)
// velocity → macro_control_2 (amount: -0.36)
// macro_control_3 → osc_3_wave_frame (amount: 0.7)
// macro_control_3 → osc_2_wave_frame (amount: 0.836)
// macro_control_3 → osc_1_wave_frame (amount: 0.22)
// macro_control_4 → flanger_dry_wet (amount: 1)`
  },
  "cursed_steps": {
    name: "Cursed Steps",
    pack: "Mr Bill",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("cursed_steps_osc1")
    .unison(3)
    .detune(4.222)
    .spread(0.8)
    // envelope
    .attack(0.149)
    .decay(1)
    // filter
    .cutoff(tri.fast(4).range(20, 904))
    .resonance(9.935)
    .ftype("24db")
    // modulation (osc1)
    .warp(tri.fast(16).range(0.23, 0.77))
    .gain(tri.fast(16).range(0.11, 1))
    // effects
    .room(0.515)
    .roomsize(0.54)
    .shape(0.04),
  note("c3 e3 g3 b3")
    .s("cursed_steps_osc2")
    .warp(0.5)
    .unison(3)
    .detune(5.75)
    .spread(0.8)
    // envelope
    .attack(0.149)
    .decay(1)
    // filter
    .cutoff(tri.fast(4).range(20, 904))
    .resonance(9.935)
    .ftype("24db")
    // modulation (osc2)
    .gain(tri.fast(16).range(0.54, 1))
    // effects
    .room(0.515)
    .roomsize(0.54)
    .shape(0.04),
  note("c3 e3 g3 b3")
    .s("cursed_steps_osc3")
    .wt(0.466)
    .warp(0.5)
    .unison(3)
    .detune(3.372)
    .spread(0.8)
    .gain(0.42)
    // envelope
    .attack(0.149)
    .decay(1)
    // filter
    .cutoff(tri.fast(4).range(20, 904))
    .resonance(9.935)
    .ftype("24db")
    // effects
    .room(0.515)
    .roomsize(0.54)
    .shape(0.04)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_2 → osc_1_transpose (amount: 0.5)
// macro_control_1 → filter_fx_cutoff (amount: 0.459)
// macro_control_2 → osc_3_transpose (amount: 0.26)
// macro_control_3 → osc_2_transpose (amount: 0.5)
// random_1 → macro_control_2 (amount: 0.93)
// random_2 → macro_control_3 (amount: 0.475)
// macro_control_4 → compressor_attack (amount: 1)
// macro_control_4 → compressor_release (amount: 0.99)`
  },
  "e4_one_note_metallophone": {
    name: "E4 One Note Metallophone",
    pack: "Mr Bill",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("e4_one_note_metallophone_osc1")
    .warp(0.5)
    .gain(0.497)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.904)
    // filter
    .cutoff(tri.slow(4).range(44, 406)),
  note("c3 e3 g3 b3")
    .s("e4_one_note_metallophone_osc2")
    .warp(0.5)
    .gain(0.707)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.904)
    // filter
    .cutoff(tri.slow(4).range(44, 406)),
  note("c3 e3 g3 b3")
    .s("e4_one_note_metallophone_osc3")
    .warp(0.5)
    .gain(0.422)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.904)
    // filter
    .cutoff(tri.slow(4).range(44, 406))
)

// === Unmapped modulations (Vital-specific) ===
// lfo_2 → osc_2_transpose (amount: 0.97)
// macro_control_1 → osc_2_level (amount: 0.65)
// macro_control_2 → sample_level (amount: 0.515)
// macro_control_3 → chorus_dry_wet (amount: 0.405)
// macro_control_3 → reverb_dry_wet (amount: 0.575)
// macro_control_4 → compressor_mix (amount: 1)
// macro_control_4 → volume (amount: -0.16)
// macro_control_4 → distortion_mix (amount: 1)`
  },
  "float_chords": {
    name: "Float Chords",
    pack: "Mr Bill",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.435)
    .warpmode("sync")
    .unison(5)
    .detune(3.522)
    .spread(0.8)
    // envelope
    .attack(0.708)
    .decay(1)
    .release(1.285)
    // filter
    .cutoff(tri.fast(4).range(20, 81))
    // modulation (osc1)
    .gain(tri.fast(4).range(0, 1))
    // effects
    .room(0.385)
    .roomsize(0.73),
  note("c3 e3 g3 b3")
    .s("float_chords_osc2")
    .warp(0.5)
    .unison(5)
    .detune(2.622)
    .spread(0.8)
    // envelope
    .attack(0.708)
    .decay(1)
    .release(1.285)
    // filter
    .cutoff(tri.fast(4).range(20, 81))
    // modulation (osc2)
    .gain(tri.fast(4).range(0, 1))
    .wt(tri.fast(4).range(0, 0.478))
    // effects
    .room(0.385)
    .roomsize(0.73),
  note("c3 e3 g3 b3")
    .s("float_chords_osc3")
    .wt(0.482)
    .warp(0.5)
    // envelope
    .attack(0.708)
    .decay(1)
    .release(1.285)
    // filter
    .cutoff(tri.fast(4).range(20, 81))
    // modulation (osc3)
    .gain(tri.fast(4).range(0.02, 1))
    // effects
    .room(0.385)
    .roomsize(0.73)
)

// === Unmapped modulations (Vital-specific) ===
// env_1 → osc_1_distortion_amount (amount: 0.08)
// macro_control_1 → delay_dry_wet (amount: 1)
// macro_control_1 → distortion_mix (amount: 1)
// macro_control_2 → sample_level (amount: 0.575)
// macro_control_3 → lfo_2_stereo (amount: 0.5)
// macro_control_4 → filter_1_cutoff (amount: 0.4)`
  },
  "honk_wub": {
    name: "Honk Wub",
    pack: "Mr Bill",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("square")
    .warp(0.5)
    .warpmode("pwm")
    // envelope
    .decay(1)
    .release(0.405)
    // filter
    .cutoff(tri.fast(32).range(2531, 8575))
    .resonance(20)
    .ftype("24db")
    // modulation (osc1)
    .wt(tri.fast(16).range(0, 0.324))
    .gain(tri.fast(32).range(0.005, 1))
    // effects
    .delay(0.18)
    .delaytime(1)
    .delayfeedback(0.26),
  note("c3 e3 g3 b3")
    .s("honk_wub_osc2")
    .warp(0.5)
    .warpmode("pwm")
    // envelope
    .decay(1)
    .release(0.405)
    // filter
    .cutoff(tri.fast(32).range(2531, 8575))
    .resonance(20)
    .ftype("24db")
    // modulation (osc2)
    .gain(tri.fast(32).range(0.11, 1))
    // effects
    .delay(0.18)
    .delaytime(1)
    .delayfeedback(0.26),
  note("c3 e3 g3 b3")
    .s("square")
    .warp(0.5)
    .warpmode("pwm")
    // envelope
    .decay(1)
    .release(0.405)
    // filter
    .cutoff(tri.fast(32).range(2531, 8575))
    .resonance(20)
    .ftype("24db")
    // modulation (osc3)
    .gain(tri.fast(32).range(0, 1))
    .wt(tri.fast(16).range(0, 0.808))
    // effects
    .delay(0.18)
    .delaytime(1)
    .delayfeedback(0.26)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_3 → filter_1_blend_transpose (amount: 0.415)
// lfo_2 → filter_1_formant_y (amount: 0.99)
// lfo_5 → filter_1_formant_x (amount: 0.54)
// lfo_5 → filter_1_formant_spread (amount: -0.57)
// env_2 → osc_2_spectral_morph_amount (amount: 0.51)
// env_3 → osc_3_spectral_morph_amount (amount: -0.24)
// env_4 → filter_fx_drive (amount: 0.99)
// lfo_2 → distortion_drive (amount: 0.985)`
  },
  "lorn_style_lead": {
    name: "LORN Style Lead",
    pack: "Mr Bill",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("lorn_style_lead_osc1")
  .wt(0.285)
  .warp(0.5)
  // envelope
  .attack(0.149)
  .decay(1.027)
  // filter
  .cutoff(tri.fast(8).range(20, 299))
  .resonance(13.464)
  // modulation
  .gain(tri.slow(4).range(0.005, 1))

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_transpose (amount: 0.5)
// lfo_1 → compressor_high_gain (amount: 0.25)
// lfo_2 → compressor_mix (amount: 0.965)
// lfo_1 → filter_fx_formant_transpose (amount: 0.858)
// macro_control_1 → chorus_dry_wet (amount: 0.87)
// lfo_3 → lfo_2_tempo (amount: 0.333)
// lfo_3 → lfo_2_frequency (amount: 0.9)
// macro_control_2 → distortion_drive (amount: 0.11)`
  },
  "real_squarepusher_hours": {
    name: "Real Squarepusher Hours",
    pack: "Mr Bill",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.72)
    .unison(3)
    .detune(1.022)
    .spread(0.8)
    .gain(0.497)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.179)
    // filter
    .cutoff(606)
    .resonance(5.49)
    // modulation (osc1)
    .wt(tri.fast(2).range(0, 0.538))
    // effects
    .room(0.59)
    .roomsize(0.5)
    .shape(0.19),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.179)
    // filter
    .cutoff(606)
    .resonance(5.49)
    // modulation (osc2)
    .gain(tri.fast(2).range(0.605, 1))
    // effects
    .room(0.59)
    .roomsize(0.5)
    .shape(0.19),
  note("c3 e3 g3 b3")
    .s("real_squarepusher_hours_osc3")
    .warp(0.5)
    .unison(3)
    .detune(1.822)
    .spread(0.8)
    .gain(0.757)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.179)
    // filter
    .cutoff(606)
    .resonance(5.49)
    // effects
    .room(0.59)
    .roomsize(0.5)
    .shape(0.19)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_transpose (amount: 0.5)
// lfo_2 → osc_3_transpose (amount: 0.5)
// lfo_3 → osc_2_transpose (amount: 0.5)
// lfo_5 → osc_1_transpose (amount: 0.5)
// macro_control_1 → osc_1_transpose (amount: 0.5)
// macro_control_2 → filter_1_cutoff (amount: 0.48)
// macro_control_3 → filter_1_drive (amount: 1)
// macro_control_3 → distortion_drive (amount: 0.115)`
  },
  "remedial_shikari": {
    name: "Remedial Shikari",
    pack: "Mr Bill",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("remedial_shikari_osc1")
    .wt(0.079)
    .warp(0.3)
    .warpmode("sync")
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // modulation (osc1)
    .gain(tri.range(0.04, 1))
    // effects
    .delay(0.373)
    .delaytime(0.333)
    .delayfeedback(0.5)
    .shape(0.25),
  note("c3 e3 g3 b3")
    .s("remedial_shikari_osc2")
    .wt(0.197)
    .warp(0.5)
    .warpmode("sync")
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // modulation (osc2)
    .gain(tri.range(0, 1))
    // effects
    .delay(0.373)
    .delaytime(0.333)
    .delayfeedback(0.5)
    .shape(0.25)
)

// === Unmapped modulations (Vital-specific) ===
// random_1 → osc_1_spectral_morph_amount (amount: -0.3)
// random_1 → osc_1_distortion_amount (amount: 0.505)
// lfo_1 → osc_1_unison_voices (amount: 1)
// macro_control_1 → osc_1_spectral_morph_amount (amount: 0.05)
// macro_control_1 → osc_1_distortion_amount (amount: 0.13)
// lfo_3 → osc_2_transpose (amount: 0.75)
// macro_control_3 → distortion_drive (amount: 0.145)
// macro_control_2 → osc_2_spectral_morph_amount (amount: 0.5)`
  },
  "super_nice_pluck": {
    name: "Super Nice Pluck",
    pack: "Mr Bill",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("super_nice_pluck_osc2")
  .wt(0.352)
  .warp(0.5)
  .unison(13)
  .detune(2.722)
  .spread(0.8)
  .gain(0.275)
  // envelope
  .decay(0.765)
  .sustain(0.005)
  .release(0.919)
  // filter
  .cutoff(133)
  .resonance(10)
  .lpenv(0.264)
  .lpattack(0.149)
  .lpdecay(1)
  .lpsustain(1)
  .lprelease(0.548)
  // effects
  .shape(0.38)

// === Unmapped modulations (Vital-specific) ===
// env_1 → compressor_mix (amount: 0.395)
// random_1 → osc_1_wave_frame (amount: 0.62)
// random_1 → osc_1_spectral_morph_amount (amount: 0.14)
// random_1 → osc_1_distortion_amount (amount: 0.5)
// env_1 → osc_1_level (amount: 0.19)
// env_1 → osc_2_level (amount: 0.43)
// macro_control_1 → env_1_decay (amount: 0.153)
// macro_control_1 → env_1_release (amount: 0.304)`
  },
  "dispersed_grit": {
    name: "Dispersed Grit",
    pack: "Navi Retlav Studio",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("triangle")
    .warpmode("bendmp")
    .gain(0.675)
    // envelope
    .attack(0.25)
    .decay(0.523)
    .sustain(0.765)
    .release(0.25)
    // modulation (osc1)
    .warp(tri.fast(4).range(0.708, 1))
    // effects
    .shape(0.33),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    // envelope
    .attack(0.25)
    .decay(0.523)
    .sustain(0.765)
    .release(0.25)
    // modulation (osc2)
    .warp(tri.fast(4).range(0, 0.39))
    // effects
    .shape(0.33)
)

// === Unmapped modulations (Vital-specific) ===
// macro_control_1 → osc_2_distortion_amount (amount: 0.495)
// macro_control_3 → lfo_1_stereo (amount: 0.5)
// mod_wheel → filter_fx_cutoff (amount: 0.594)
// mod_wheel → lfo_1_tempo (amount: 0.21)
// macro_control_4 → reverb_dry_wet (amount: 0.51)
// macro_control_2 → phaser_dry_wet (amount: 1)
// mod_wheel → phaser_tempo (amount: -0.4)
// velocity → modulation_6_amount (amount: 0.442)`
  },
  "drowning_machine": {
    name: "Drowning Machine",
    pack: "Navi Retlav Studio",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .unison(3)
    .detune(1.872)
    .spread(0.8)
    .gain(0.707)
    // envelope
    .decay(0.774)
    .sustain(0.9)
    .release(1.297)
    // filter
    .cutoff(1243)
    .resonance(10.677)
    .ftype("ladder")
    // effects
    .shape(0.08),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .unison(3)
    .detune(2.05)
    .spread(0.8)
    .gain(0.707)
    // envelope
    .decay(0.774)
    .sustain(0.9)
    .release(1.297)
    // filter
    .cutoff(1243)
    .resonance(10.677)
    .ftype("ladder")
    // effects
    .shape(0.08),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    .gain(0.707)
    // envelope
    .decay(0.774)
    .sustain(0.9)
    .release(1.297)
    // filter
    .cutoff(1243)
    .resonance(10.677)
    .ftype("ladder")
    // effects
    .shape(0.08)
)

// === Unmapped modulations (Vital-specific) ===
// env_2 → osc_1_spectral_morph_amount (amount: 0.5)
// env_2 → osc_2_spectral_morph_amount (amount: -0.5)
// velocity → modulation_3_amount (amount: 0.29)
// env_2 → osc_3_spectral_morph_amount (amount: -0.49)
// env_1 → compressor_high_gain (amount: 0.283)
// macro_control_1 → env_1_attack (amount: 0.865)
// macro_control_2 → modulation_8_amount (amount: -0.1)
// macro_control_2 → modulation_9_amount (amount: 0.135)`
  },
  "phaser_man": {
    name: "Phaser Man",
    pack: "Navi Retlav Studio",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("triangle")
  .warpmode("bendm")
  .gain(0.707)
  // envelope
  .attack(0.071)
  .decay(1)
  .release(0.238)
  // filter
  .cutoff(tri.fast(16).range(20, 715))
  // modulation
  .warp(tri.fast(16).range(0.71, 1))
  // effects
  .shape(0.3)

// === Unmapped modulations (Vital-specific) ===
// lfo_2 → osc_1_distortion_phase (amount: 1)
// macro_control_4 → reverb_dry_wet (amount: 0.6)
// lfo_5 → phaser_center (amount: -0.32)
// macro_control_3 → phaser_dry_wet (amount: 1)
// velocity → modulation_1_amount (amount: 0.5)
// macro_control_1 → lfo_2_tempo (amount: 0.13)
// macro_control_1 → lfo_1_tempo (amount: -0.143)
// macro_control_1 → lfo_3_tempo (amount: 0.087)`
  },
  "physical_tension": {
    name: "Physical Tension",
    pack: "Navi Retlav Studio",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("sawtooth")
  .warp(0.5)
  .gain(0.707)
  // envelope
  .decay(0.274)
  .sustain(0)
  // filter
  .cutoff(54)
  .resonance(10.504)

// === Unmapped modulations (Vital-specific) ===
// macro_control_4 → reverb_dry_wet (amount: 1)
// macro_control_1 → chorus_delay_2 (amount: -0.99)
// macro_control_1 → chorus_delay_1 (amount: -1)
// macro_control_2 → modulation_1_amount (amount: 0.25)
// note → osc_1_transpose (amount: 1)
// macro_control_3 → chorus_cutoff (amount: 1)
// mod_wheel → chorus_feedback (amount: 1)
// velocity → osc_1_level (amount: 1)`
  },
  "skew_resandal": {
    name: "Skew Resandal",
    pack: "Navi Retlav Studio",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("triangle")
  .warpmode("bendmp")
  .gain(0.707)
  // envelope
  .attack(0.149)
  .decay(1)
  .release(0.298)
  // filter
  .cutoff(16)
  .resonance(4.493)
  .lpenv(1)
  .lpdecay(1.071)
  .lprelease(0.655)
  // modulation
  .wt(tri.fast(8).range(0, 0.5))
  .warp(tri.fast(8).range(0.5, 1))

// === Unmapped modulations (Vital-specific) ===
// macro_control_1 → osc_1_spectral_morph_amount (amount: 1)
// macro_control_2 → lfo_1_tempo (amount: 0.25)
// macro_control_2 → lfo_2_tempo (amount: 0.25)
// macro_control_3 → modulation_6_amount (amount: 0.5)
// mod_wheel → env_2_sustain (amount: 1)
// velocity → modulation_9_amount (amount: 0.5)
// mod_wheel → delay_dry_wet (amount: 0.732)
// macro_control_4 → delay_dry_wet (amount: 0.352)`
  },
  "super_pluck": {
    name: "Super Pluck",
    pack: "Navi Retlav Studio",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("sawtooth")
  .warp(0.5)
  .unison(7)
  .detune(4.422)
  .spread(0.8)
  .gain(0.707)
  // envelope
  .decay(1.035)
  .sustain(0.005)
  .release(0.666)
  // effects
  .shape(0.41)

// === Unmapped modulations (Vital-specific) ===
// env_1 → osc_2_level (amount: 0.793)
// macro_control_1 → env_1_decay (amount: 0.53)
// env_1 → osc_1_wave_frame (amount: 0.08)
// env_1 → osc_1_unison_detune (amount: -0.557)
// macro_control_2 → modulation_2_amount (amount: 0.5)
// macro_control_2 → modulation_3_amount (amount: 0.5)
// macro_control_2 → modulation_9_amount (amount: 0.312)
// macro_control_2 → modulation_11_amount (amount: 0.312)`
  },
  "a_happy_ending_of_the_world": {
    name: "A happy ending of the world",
    pack: "Unsystematic Fragmentation",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .unison(3)
    .spread(0.8)
    // envelope
    .attack(0.958)
    .decay(1)
    .sustain(0.55)
    .release(1.13)
    // filter
    .cutoff(261)
    .resonance(20)
    // modulation (osc1)
    .warp(tri.slow(2).range(0.115, 0.885))
    .gain(tri.fast(2).range(0, 1)),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .unison(4)
    .spread(0.8)
    // envelope
    .attack(0.958)
    .decay(1)
    .sustain(0.55)
    .release(1.13)
    // filter
    .cutoff(261)
    .resonance(20)
    // modulation (osc2)
    .warp(tri.slow(2).range(0.145, 0.855))
    .gain(tri.fast(2).range(0.12, 1)),
  note("c3 e3 g3 b3")
    .s("a_happy_ending_of_the_world_osc3")
    .gain(0.83)
    // envelope
    .attack(0.958)
    .decay(1)
    .sustain(0.55)
    .release(1.13)
    // filter
    .cutoff(261)
    .resonance(20)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → chorus_mod_depth (amount: 0.645)
// lfo_2 → chorus_delay_1 (amount: 0.5)
// random_1 → lfo_3_frequency (amount: 0.33)
// macro_control_1 → distortion_mix (amount: 1)
// macro_control_2 → reverb_dry_wet (amount: 0.9)
// macro_control_3 → delay_dry_wet (amount: 0.415)
// macro_control_4 → eq_high_cutoff (amount: -0.44)
// mod_wheel → filter_1_mix (amount: 1)`
  },
  "chorusy_keys": {
    name: "Chorusy Keys",
    pack: "Unsystematic Fragmentation",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    .unison(16)
    .detune(2.1)
    .spread(1)
    .gain(0.74)
    // envelope
    .attack(0.149)
    .decay(0.643)
    .sustain(0.295)
    // filter
    .cutoff(373)
    .resonance(2.118)
    // modulation (osc1)
    .wt(tri.fast(16).range(0, 0.26)),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .unison(8)
    .detune(2.222)
    .spread(1)
    .gain(0.517)
    // envelope
    .attack(0.149)
    .decay(0.643)
    .sustain(0.295)
    // filter
    .cutoff(373)
    .resonance(2.118)
    // modulation (osc2)
    .warp(tri.fast(16).range(0.285, 0.715))
)

// === Unmapped modulations (Vital-specific) ===
// env_2 → chorus_feedback (amount: 0.36)
// macro_control_1 → env_1_release (amount: 0.3)
// lfo_2 → voice_tune (amount: 1)
// macro_control_2 → filter_2_blend (amount: -0.6)
// macro_control_2 → filter_1_blend (amount: 0.5)
// mod_wheel → filter_fx_cutoff (amount: 1)
// macro_control_4 → delay_dry_wet (amount: 0.22)
// macro_control_3 → osc_2_distortion_amount (amount: 1)`
  },
  "fun_pulse": {
    name: "Fun Pulse",
    pack: "Unsystematic Fragmentation",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("sawtooth")
  .warp(0.54)
  .unison(5)
  .spread(0.8)
  .gain(0.775)
  // envelope
  .attack(0.149)
  .decay(1)
  // filter
  .cutoff(tri.fast(64).range(20, 346))
  // modulation
  .wt(tri.fast(8).range(0, 0.536))

// === Unmapped modulations (Vital-specific) ===
// random_1 → osc_1_transpose (amount: 0.5)
// random_1 → filter_2_cutoff (amount: 0.334)
// macro_control_1 → distortion_mix (amount: 0.5)
// macro_control_2 → chorus_dry_wet (amount: 1)
// macro_control_3 → reverb_dry_wet (amount: 0.34)
// macro_control_3 → delay_dry_wet (amount: 0.392)
// random_1 → filter_fx_cutoff (amount: 0.094)
// macro_control_4 → filter_fx_mix (amount: 1)`
  },
  "moving_harmonics": {
    name: "Moving Harmonics",
    pack: "Unsystematic Fragmentation",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .unison(3)
    .spread(0.8)
    .gain(0.707)
    // envelope
    .attack(0.149)
    .decay(0.929)
    .release(0.321)
    // filter
    .cutoff(455)
    // modulation (osc1)
    .warp(tri.fast(4).range(0, 1)),
  note("c3 e3 g3 b3")
    .s("moving_harmonics_osc2")
    .wt(0.01)
    .warp(0.5)
    // envelope
    .attack(0.149)
    .decay(0.929)
    .release(0.321)
    // filter
    .cutoff(455),
  note("c3 e3 g3 b3")
    .s("moving_harmonics_osc3")
    .warp(0.5)
    .unison(6)
    .detune(3.2)
    .spread(0.8)
    .gain(0.49)
    // envelope
    .attack(0.149)
    .decay(0.929)
    .release(0.321)
    // filter
    .cutoff(455)
)

// === Unmapped modulations (Vital-specific) ===
// macro_control_1 → filter_2_mix (amount: 1)
// macro_control_2 → delay_dry_wet (amount: 0.277)
// macro_control_2 → reverb_dry_wet (amount: 0.405)
// macro_control_3 → distortion_mix (amount: 0.5)
// macro_control_1 → eq_high_gain (amount: -0.195)
// mod_wheel → filter_fx_cutoff (amount: 0.996)
// env_1 → modulation_9_amount (amount: 0.235)`
  },
  "phaser_entropy": {
    name: "Phaser Entropy ",
    pack: "Unsystematic Fragmentation",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("sawtooth")
  .warpmode("fold")
  .unison(7)
  .spread(1)
  // envelope
  .attack(0.149)
  .decay(1)
  // filter
  .cutoff(tri.fast(8).range(87, 535))
  .resonance(13.412)
  // modulation
  .wt(tri.fast(8).range(0, 0.5))
  .gain(tri.fast(8).range(0.16, 1))
  .warp(tri.fast(8).range(0.475, 0.525))

// === Unmapped modulations (Vital-specific) ===
// env_1 → chorus_dry_wet (amount: 0.54)
// macro_control_1 → filter_fx_cutoff (amount: 0.619)
// lfo_2 → filter_1_resonance (amount: -0.86)
// lfo_2 → filter_2_resonance (amount: -0.57)
// lfo_2 → filter_fx_resonance (amount: 0.551)
// lfo_2 → phaser_center (amount: -0.46)
// lfo_2 → phaser_mod_depth (amount: -0.66)
// lfo_2 → phaser_phase_offset (amount: -0.422)`
  },
  "corrupted_boot-": {
    name: "corrupted_...+=boot-_",
    pack: "Unsystematic Fragmentation",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("sawtooth")
  .unison(16)
  .detune(3.2)
  .spread(0.8)
  .gain(0.745)
  // envelope
  .attack(1.267)
  .decay(1.19)
  .sustain(0.745)
  .release(0.856)
  // filter
  .cutoff(261)
  // modulation
  .wt(tri.fast(2).range(0, 0.5))
  // effects
  .coarse(4)

// === Unmapped modulations (Vital-specific) ===
// macro_control_1 → delay_dry_wet (amount: 0.53)
// macro_control_1 → reverb_dry_wet (amount: 1)
// random_1 → phaser_center (amount: 0.042)
// random_1 → lfo_1_phase (amount: 1)
// env_1 → phaser_dry_wet (amount: 1)
// lfo_3 → phaser_mod_depth (amount: 0.26)
// macro_control_2 → chorus_dry_wet (amount: 1)
// env_1 → filter_fx_resonance (amount: 0.332)`
  },
  "a_night_in_kalyan": {
    name: "A Night in Kalyan",
    pack: "Yuli Yolo",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .gain(0.432)
    // envelope
    .attack(1.089)
    .decay(1.143)
    .sustain(0.65)
    .release(1.178)
    // filter
    .cutoff(1046)
    .resonance(20)
    // modulation (osc1)
    .wt(tri.slow(4).range(0, 0.36))
    .warp(tri.slow(4).range(0.402, 0.598))
    // effects
    .room(0.25)
    .roomsize(0.5),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    // envelope
    .attack(1.089)
    .decay(1.143)
    .sustain(0.65)
    .release(1.178)
    // filter
    .cutoff(1046)
    .resonance(20)
    // modulation (osc2)
    .wt(tri.fast(4.4).range(0.388, 1))
    // effects
    .room(0.25)
    .roomsize(0.5)
)

// === Unmapped modulations (Vital-specific) ===
// random_1 → lfo_4_smooth_time (amount: -0.36)
// random_2 → lfo_4_frequency (amount: -0.348)
// random_1 → osc_1_level (amount: 0.166)
// macro_control_1 → modulation_9_amount (amount: 0.227)
// macro_control_2 → lfo_4_frequency (amount: 0.214)
// macro_control_1 → modulation_13_amount (amount: 0.014)
// macro_control_3 → modulation_15_amount (amount: 0.031)
// macro_control_4 → reverb_dry_wet (amount: 0.75)`
  },
  "abbysun": {
    name: "Abbysun",
    pack: "Yuli Yolo",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    .warpmode("sync")
    .unison(16)
    .detune(4.472)
    .spread(0.8)
    .gain(0.707)
    // envelope
    .attack(1.422)
    .decay(1.654)
    .release(1.558)
    // filter
    .cutoff(261)
    .resonance(16.072)
    .ftype("24db")
    .lpenv(0.383)
    .lpattack(1.648)
    .lpdecay(1.916)
    .lpsustain(0.305)
    .lprelease(1.677)
    // effects
    .room(0.25)
    .roomsize(0.5)
    .delay(0.323)
    .delaytime(0.333)
    .delayfeedback(0.5),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.5)
    .unison(3)
    .detune(3.3)
    .spread(1)
    // envelope
    .attack(1.422)
    .decay(1.654)
    .release(1.558)
    // filter
    .cutoff(261)
    .resonance(16.072)
    .ftype("24db")
    .lpenv(0.383)
    .lpattack(1.648)
    .lpdecay(1.916)
    .lpsustain(0.305)
    .lprelease(1.677)
    // modulation (osc3)
    .gain(tri.slow(4).range(0.68, 1))
    // effects
    .room(0.25)
    .roomsize(0.5)
    .delay(0.323)
    .delaytime(0.333)
    .delayfeedback(0.5)
)

// === Unmapped modulations (Vital-specific) ===
// velocity → modulation_1_amount (amount: 0.289)
// env_2 → osc_2_level (amount: 0.648)
// macro_control_1 → env_1_attack (amount: -0.178)
// macro_control_1 → env_2_delay (amount: -0.59)
// macro_control_1 → env_2_attack (amount: -0.013)
// macro_control_4 → reverb_dry_wet (amount: 0.258)
// macro_control_4 → reverb_decay_time (amount: 0.164)
// lfo_2 → env_2_sustain (amount: 0.132)`
  },
  "diy": {
    name: "DIY",
    pack: "Yuli Yolo",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("sawtooth")
  .warp(0.5)
  .unison(8)
  .gain(0.4)
  // envelope
  .attack(0.084)
  .decay(1)
  .release(0.94)
  // filter
  .cutoff(523)
  .resonance(18.378)
  .ftype("24db")
  // modulation
  .wt(tri.slow(2.469).range(0.445, 1))
  // effects
  .room(0.485)
  .roomsize(0.595)
  .shape(0.211)

// === Unmapped modulations (Vital-specific) ===
// mod_wheel → filter_2_cutoff (amount: -0.186)
// mod_wheel → sample_level (amount: 0.215)
// velocity → osc_1_level (amount: 0.636)
// velocity → modulation_5_amount (amount: 0.184)
// macro_control_4 → reverb_decay_time (amount: 0.253)
// stereo → osc_1_unison_blend (amount: 1)
// stereo → osc_1_unison_detune (amount: 1)
// env_3 → osc_3_transpose (amount: 0.289)`
  },
  "destruction": {
    name: "Destruction",
    pack: "Yuli Yolo",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("destruction_osc1")
    .warp(0.61)
    .warpmode("fold")
    .unison(16)
    .detune(4.472)
    .spread(0.8)
    .gain(0.707)
    // envelope
    .attack(0.534)
    .decay(1)
    .release(0.441)
    // filter
    .cutoff(tri.fast(8).range(501, 809))
    .ftype("24db")
    .lpenv(0.157)
    .lpattack(0.934)
    .lpdecay(1)
    .lprelease(1.154)
    // effects
    .shape(0.19),
  note("c3 e3 g3 b3")
    .s("destruction_osc2")
    .warp(0.5)
    .warpmode("fold")
    // envelope
    .attack(0.534)
    .decay(1)
    .release(0.441)
    // filter
    .cutoff(tri.fast(8).range(501, 809))
    .ftype("24db")
    .lpenv(0.157)
    .lpattack(0.934)
    .lpdecay(1)
    .lprelease(1.154)
    // modulation (osc2)
    .gain(tri.fast(4).range(0, 1))
    // effects
    .shape(0.19),
  note("c3 e3 g3 b3")
    .s("destruction_osc3")
    .warp(0.5)
    .gain(0.622)
    // envelope
    .attack(0.534)
    .decay(1)
    .release(0.441)
    // filter
    .cutoff(tri.fast(8).range(501, 809))
    .ftype("24db")
    .lpenv(0.157)
    .lpattack(0.934)
    .lpdecay(1)
    .lprelease(1.154)
    // effects
    .shape(0.19)
)

// === Unmapped modulations (Vital-specific) ===
// env_2 → osc_1_tune (amount: -0.5)
// stereo → filter_1_cutoff (amount: 0.036)
// env_4 → modulation_4_amount (amount: 0.171)
// stereo → osc_1_wave_frame (amount: 1)
// stereo → osc_1_level (amount: -0.28)
// lfo_1 → filter_1_blend (amount: 0.991)
// env_2 → osc_2_tune (amount: -0.5)
// mod_wheel → stereo_routing (amount: 0.292)`
  },
  "easy_mallet": {
    name: "Easy Mallet",
    pack: "Yuli Yolo",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
note("c3 e3 g3 b3")
  .s("sawtooth")
  // envelope
  .attack(0.397)
  .decay(1.31)
  .sustain(0.755)
  .release(0.904)
  // filter
  .cutoff(686)
  .resonance(4.28)
  // effects
  .room(0.45)
  .roomsize(0.91)
  .shape(0.05)

// === Unmapped modulations (Vital-specific) ===
// velocity → modulation_1_amount (amount: 0.259)
// velocity → env_1_attack (amount: -0.065)
// velocity → modulation_6_amount (amount: 0.1)
// velocity → modulation_3_amount (amount: 0.324)
// lfo_2 → modulation_9_amount (amount: 0.5)
// stereo → filter_2_cutoff (amount: 0.228)
// mod_wheel → modulation_5_amount (amount: 0.289)
// lfo_2 → modulation_13_amount (amount: 0.078)`
  },
  "jupiter_bass": {
    name: "Jupiter Bass",
    pack: "Yuli Yolo",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("jupiter_bass_osc2")
    .warp(0.5)
    .gain(0.294)
    // envelope
    .attack(0.4)
    .decay(1)
    .release(0.643)
    // filter
    .cutoff(858)
    .resonance(14.331)
    .ftype("ladder")
    // effects
    .room(0.118)
    .roomsize(0.5),
  note("c3 e3 g3 b3")
    .s("jupiter_bass_osc3")
    .wt(0.837)
    .warp(0.5)
    .gain(0.441)
    // envelope
    .attack(0.4)
    .decay(1)
    .release(0.643)
    // filter
    .cutoff(858)
    .resonance(14.331)
    .ftype("ladder")
    // effects
    .room(0.118)
    .roomsize(0.5)
)

// === Unmapped modulations (Vital-specific) ===
// env_2 → filter_1_resonance (amount: 0.112)
// macro_control_2 → sample_level (amount: 0.124)
// macro_control_3 → osc_2_unison_voices (amount: 0.22)
// macro_control_4 → modulation_6_amount (amount: 0.018)
// macro_control_4 → modulation_7_amount (amount: 0.09)
// macro_control_4 → modulation_8_amount (amount: 0.012)
// macro_control_4 → modulation_9_amount (amount: -0.024)
// mod_wheel → env_2_sustain (amount: 0.994)`
  },
  "keystation": {
    name: "Keystation",
    pack: "Yuli Yolo",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("keystation_osc1")
    .warp(0.755)
    .warpmode("bendm")
    .unison(3)
    .detune(2.363)
    .gain(0.211)
    // envelope
    .attack(0.347)
    .decay(1)
    .release(1.379)
    // filter
    .cutoff(261)
    .resonance(1.216)
    .ftype("24db")
    // effects
    .room(0.25)
    .roomsize(0.5),
  note("c3 e3 g3 b3")
    .s("keystation_osc2")
    .gain(0.145)
    // envelope
    .attack(0.347)
    .decay(1)
    .release(1.379)
    // filter
    .cutoff(261)
    .resonance(1.216)
    .ftype("24db")
    // effects
    .room(0.25)
    .roomsize(0.5)
)

// === Unmapped modulations (Vital-specific) ===
// velocity → modulation_1_amount (amount: 0.086)
// velocity → osc_1_level (amount: 0.438)
// note → osc_1_distortion_amount (amount: 1)
// velocity → env_1_attack (amount: -0.06)
// velocity → osc_2_level (amount: 0.258)
// velocity → modulation_7_amount (amount: 0.181)
// note → env_2_decay (amount: -0.525)
// macro_control_4 → reverb_decay_time (amount: 0.219)`
  },
  "metal_head": {
    name: "Metal Head",
    pack: "Yuli Yolo",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("metal_head_osc2")
    .warp(0.5)
    .unison(16)
    .detune(10)
    .spread(0.8)
    .gain(0.015)
    // envelope
    .attack(0.345)
    .decay(1)
    .release(1.321)
    // filter
    .cutoff(261)
    // effects
    .room(0.42)
    .roomsize(0)
    .delay(0.161)
    .delaytime(0.667)
    .delayfeedback(0.57)
    .shape(0.229),
  note("c3 e3 g3 b3")
    .s("metal_head_osc3")
    .warp(0.5)
    .unison(8)
    .detune(10)
    .spread(0.675)
    .gain(0.02)
    // envelope
    .attack(0.345)
    .decay(1)
    .release(1.321)
    // filter
    .cutoff(261)
    // effects
    .room(0.42)
    .roomsize(0)
    .delay(0.161)
    .delaytime(0.667)
    .delayfeedback(0.57)
    .shape(0.229)
)

// === Unmapped modulations (Vital-specific) ===
// velocity → modulation_2_amount (amount: 0.5)
// stereo → osc_1_detune_range (amount: 0.719)
// stereo → osc_1_unison_detune (amount: 0.207)
// stereo → osc_1_spectral_morph_amount (amount: 0.109)
// stereo → env_2_release (amount: -0.123)
// stereo → env_2_decay (amount: 0.107)
// stereo → env_2_hold (amount: 0.38)
// stereo → osc_1_distortion_amount (amount: -0.133)`
  },
  "salomon": {
    name: "Salomon",
    pack: "Yuli Yolo",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("triangle")
    .unison(16)
    .detune(2.25)
    .gain(0.707)
    // envelope
    .attack(0.934)
    .decay(1)
    .sustain(0.735)
    .release(1.166)
    // filter
    .cutoff(1569)
    .resonance(17.143)
    // modulation (osc1)
    .wt(sine.slow(4).range(0.069, 0.417))
    // effects
    .room(0.38)
    .roomsize(0.5)
    .delay(0.093)
    .delaytime(0.333)
    .delayfeedback(0.5)
    .shape(0.06),
  note("c3 e3 g3 b3")
    .s("salomon_osc2")
    .warpmode("bendm")
    .unison(8)
    .detune(3.122)
    .spread(0.31)
    .gain(0.382)
    // envelope
    .attack(0.934)
    .decay(1)
    .sustain(0.735)
    .release(1.166)
    // filter
    .cutoff(1569)
    .resonance(17.143)
    // modulation (osc2)
    .warp(sine.slow(4).range(0.43, 0.57))
    .wt(sine.slow(4).range(0, 0.5))
    // effects
    .room(0.38)
    .roomsize(0.5)
    .delay(0.093)
    .delaytime(0.333)
    .delayfeedback(0.5)
    .shape(0.06),
  note("c3 e3 g3 b3")
    .s("sawtooth")
    .warp(0.32)
    .warpmode("sync")
    .pan(0.52)
    .gain(0.325)
    // envelope
    .attack(0.934)
    .decay(1)
    .sustain(0.735)
    .release(1.166)
    // filter
    .cutoff(1569)
    .resonance(17.143)
    // effects
    .room(0.38)
    .roomsize(0.5)
    .delay(0.093)
    .delaytime(0.333)
    .delayfeedback(0.5)
    .shape(0.06)
)

// === Unmapped modulations (Vital-specific) ===
// random_1 → osc_1_spectral_morph_amount (amount: 0.49)
// lfo_3 → osc_3_transpose (amount: -0.44)
// random_1 → modulation_4_amount (amount: 0.242)
// random_1 → modulation_2_amount (amount: 0.252)
// random → osc_1_pan (amount: 0.29)
// random_1 → osc_1_pan (amount: 0.21)
// lfo_5 → sample_transpose (amount: -0.49)
// velocity → filter_1_mix (amount: 1)`
  },
  "synthetic_quartet": {
    name: "Synthetic Quartet",
    pack: "Yuli Yolo",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("synthetic_quartet_osc1")
    .wt(0.016)
    .warp(0.575)
    .warpmode("sync")
    // envelope
    .attack(1.006)
    .decay(1.226)
    .sustain(0.61)
    .release(0.678)
    // filter
    .cutoff(479)
    .ftype("24db")
    // effects
    .room(0.5)
    .roomsize(1)
    .delay(0.198)
    .delaytime(0.333)
    .delayfeedback(0.489)
    .shape(0.04),
  note("c3 e3 g3 b3")
    .s("synthetic_quartet_osc2")
    .wt(0.496)
    .warp(0.696)
    .warpmode("sync")
    .gain(0.64)
    // envelope
    .attack(1.006)
    .decay(1.226)
    .sustain(0.61)
    .release(0.678)
    // filter
    .cutoff(479)
    .ftype("24db")
    // effects
    .room(0.5)
    .roomsize(1)
    .delay(0.198)
    .delaytime(0.333)
    .delayfeedback(0.489)
    .shape(0.04),
  note("c3 e3 g3 b3")
    .s("synthetic_quartet_osc3")
    .warp(0.5)
    .warpmode("bendm")
    .gain(0.815)
    // envelope
    .attack(1.006)
    .decay(1.226)
    .sustain(0.61)
    .release(0.678)
    // filter
    .cutoff(479)
    .ftype("24db")
    // effects
    .room(0.5)
    .roomsize(1)
    .delay(0.198)
    .delaytime(0.333)
    .delayfeedback(0.489)
    .shape(0.04)
)

// === Unmapped modulations (Vital-specific) ===
// velocity → env_1_attack (amount: -0.093)
// env_3 → modulation_1_amount (amount: 0.18)
// env_3 → modulation_3_amount (amount: 0.18)
// macro_control_4 → reverb_decay_time (amount: 0.144)
// env_3 → lfo_2_frequency (amount: 0.038)
// env_3 → modulation_8_amount (amount: 0.164)
// macro_control_1 → osc_2_distortion_amount (amount: -0.329)
// macro_control_2 → osc_1_spectral_morph_amount (amount: 0.114)`
  },
  "big_stomp": {
    name: "Big Stomp",
    pack: "inktome",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("triangle")
    .warp(0.68)
    .warpmode("bendm")
    .unison(3)
    .spread(0.64)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(679)
    .lpenv(-0.159)
    .lpdecay(0.845)
    .lprelease(0.548)
    // modulation (osc1)
    .gain(sine.fast(16).range(0.703, 1))
    // effects
    .shape(0.18),
  note("c3 e3 g3 b3")
    .s("big_stomp_osc2")
    .wt(0.594)
    .warp(0.5)
    .gain(0.707)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(679)
    .lpenv(-0.159)
    .lpdecay(0.845)
    .lprelease(0.548)
    // effects
    .shape(0.18)
)

// === Unmapped modulations (Vital-specific) ===
// env_3 → osc_1_wave_frame (amount: 0.72)
// env_3 → filter_1_blend_transpose (amount: 0.6)
// stereo → filter_1_cutoff (amount: -0.01)
// env_2 → osc_2_transpose (amount: 0.5)
// env_2 → osc_1_transpose (amount: 0.5)
// env_4 → osc_1_unison_detune (amount: 0.99)
// macro_control_1 → env_2_decay (amount: 0.135)
// macro_control_2 → env_2_attack (amount: 0.24)`
  },
  "digital_roller": {
    name: "Digital roller",
    pack: "inktome",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("digital_roller_osc1")
    .warp(0.445)
    .warpmode("bendp")
    .gain(0.707)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(tri.fast(8).range(157, 6364))
    // modulation (osc1)
    .wt(tri.fast(8).range(0, 0.544))
    // effects
    .shape(0.48),
  note("c3 e3 g3 b3")
    .s("digital_roller_osc2")
    .gain(0.8)
    // envelope
    .attack(0.149)
    .decay(1)
    .release(0.548)
    // filter
    .cutoff(tri.fast(8).range(157, 6364))
    // effects
    .shape(0.48)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_2 → filter_fx_blend_transpose (amount: 0.75)
// lfo_2 → osc_2_transpose (amount: 0.5)
// lfo_2 → osc_1_transpose (amount: -0.1)
// macro_control_1 → chorus_dry_wet (amount: 0.25)
// macro_control_2 → osc_2_distortion_amount (amount: 0.285)
// macro_control_2 → modulation_10_amount (amount: 0.243)
// macro_control_1 → modulation_11_amount (amount: -0.035)`
  },
  "piano_from_the_yard_sale": {
    name: "Piano from the yard sale",
    pack: "inktome",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("piano_from_the_yard_sale_osc1")
    .warp(0.5)
    .unison(2)
    .detune(10)
    .spread(1)
    .gain(0.707)
    // envelope
    .decay(1.274)
    .sustain(0)
    .release(1.011)
    // filter
    .cutoff(261)
    .resonance(4.632)
    .ftype("ladder"),
  note("c3 e3 g3 b3")
    .s("piano_from_the_yard_sale_osc3")
    .warp(0.5)
    .gain(0.707)
    // envelope
    .decay(1.274)
    .sustain(0)
    .release(1.011)
    // filter
    .cutoff(261)
    .resonance(4.632)
    .ftype("ladder")
)

// === Unmapped modulations (Vital-specific) ===
// env_2 → osc_1_detune_power (amount: -0.81)
// env_2 → osc_1_spectral_morph_spread (amount: 0.38)
// env_2 → osc_1_frame_spread (amount: 0.26)
// env_2 → osc_1_transpose (amount: 0.5)
// env_2 → osc_1_level (amount: 0.773)
// env_3 → filter_2_blend_transpose (amount: 0.065)
// env_3 → filter_2_blend (amount: 0.118)
// note → osc_2_transpose (amount: -0.13)`
  },
};

// Preset names by category for quick lookup
export const presetsByPack = {
  "Afro": ["banana_wob", "kick_drum_1", "random_amp_growl"],
  "Billain": ["cinema_bells", "railgun"],
  "Databroth": ["ceramic", "disrupt", "feeder", "fleet", "gorgled", "snowcrash"],
  "Factory": ["ah_eh_ee_oh", "fm_drum_circle", "plucked_string", "shepard_tone_template", "staggered_phrases", "text_to_wavetable_template", "touch_tone"],
  "Glorkglunk": ["digestive_trauma", "special_glitch_thing", "squish_clicker", "thunk", "thumpus"],
  "Halcyon Future Riddim Vol 1": ["swiss_army_knife", "boot_scre3n", "memory_leak", "oolacile_evil_dubstep_bass", "satellites", "space_station", "simple_weoum", "vlt_future_gun"],
  "In The Mix": ["analog_pad", "distant_majestic_lead", "growl_bass_sidechain", "moog_pluck", "strings_section"],
  "Level 8": ["complex_electro_1", "crescendo_bells", "damped_horn", "fm_mode", "horror_of_melbourne_1", "smoker_s_lounge"],
  "Mr Bill": ["cursed_steps", "e4_one_note_metallophone", "float_chords", "honk_wub", "lorn_style_lead", "real_squarepusher_hours", "remedial_shikari", "super_nice_pluck"],
  "Navi Retlav Studio": ["dispersed_grit", "drowning_machine", "phaser_man", "physical_tension", "skew_resandal", "super_pluck"],
  "Unsystematic Fragmentation": ["a_happy_ending_of_the_world", "chorusy_keys", "fun_pulse", "moving_harmonics", "phaser_entropy", "corrupted_boot-"],
  "Yuli Yolo": ["a_night_in_kalyan", "abbysun", "diy", "destruction", "easy_mallet", "jupiter_bass", "keystation", "metal_head", "salomon", "synthetic_quartet"],
  "inktome": ["big_stomp", "digital_roller", "piano_from_the_yard_sale"],
};