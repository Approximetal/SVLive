// Vital Preset Knowledge Base for Strudel DJ AI
// Auto-generated — do not edit manually
// 75 presets from 13 packs

export const vitalPresets = {
  "banana_wob": {
    name: "Banana Wob",
    pack: "Afro",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c2 e2 g2 b2")
    .s("banana_wob_osc1")
    .begin(0.572)
    .gain(0.01)
    // envelope
    .release(0.416)
    // filter
    .hpf(107)
    .hpq(9.8)
    // effects
    .shape(0.677)
    .compressor("-10:20:10:.002:.02"),
  note("c2 e2 g2 b2")
    .s("banana_wob_osc2")
    .gain(0.01)
    // envelope
    .release(0.416)
    // effects
    .shape(0.677)
    .compressor("-10:20:10:.002:.02"),
  note("c5 e5 g5 b5")
    .s("banana_wob_osc3")
    .gain(0.01)
    // envelope
    .release(0.416)
    // effects
    .shape(0.677)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// macro_control_1 → phaser_center (amount: -0.342)
// macro_control_1 → eq_low_cutoff (amount: 0.156)
// macro_control_1 → eq_high_gain (amount: 0.14)
// macro_control_1 → eq_band_cutoff (amount: -0.16)
// macro_control_1 → eq_band_gain (amount: -0.083)
`
  },
  "kick_drum_1": {
    name: "Kick Drum 1",
    pack: "Afro",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("a1 db2 e2 ab2")
  .s("kick_drum_1_osc1")
  .gain(0.774)
  // envelope
  .decay(0.608)
  .sustain(0.0)
  .release(0.334)
  // pitch
  .penv(37.8)
  .pdecay(2.0)
  .pcurve(1)
  // effects
  .shape(0.193)
  .compressor("-10:20:10:.002:.02")

// === Unmapped modulations (Vital-specific) ===
// lfo_3 → distortion_drive (amount: 0.245)
`
  },
  "random_amp_growl": {
    name: "Random Amp Growl",
    pack: "Afro",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c2 e2 g2 b2")
    .s("random_amp_growl_osc1")
    .begin(0.332)
    .gain(0.01)
    // envelope
    .attack(0.654)
    .release(0.58)
    // filter
    .lpf(157)
    .lpq(13.2)
    // effects
    .shape(0.443)
    .compressor("-10:20:10:.002:.02"),
  note("c2 e2 g2 b2")
    .s("random_amp_growl_osc2")
    .begin(0.117)
    .gain(0.01)
    // envelope
    .attack(0.654)
    .release(0.58)
    // filter
    .lpf(157)
    .lpq(13.2)
    // effects
    .shape(0.443)
    .compressor("-10:20:10:.002:.02"),
  note("c2 e2 g2 b2")
    .s("random_amp_growl_osc3")
    .gain(0.01)
    // envelope
    .attack(0.654)
    .release(0.58)
    // effects
    .shape(0.443)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// macro_control_1 → filter_fx_cutoff (amount: 0.104)
// macro_control_1 → eq_low_cutoff (amount: 0.521)
// macro_control_1 → eq_low_resonance (amount: 0.334)
`
  },
  "cinema_bells": {
    name: "Cinema Bells",
    pack: "Billain",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("cinema_bells_osc1")
    .begin(0.007)
    .gain(0.774)
    // envelope
    .attack(0.149)
    .release(0.548)
    .tremolosync(8.0)
    // effects
    .room(0.165)
    .delay(0.333)
    .delaytime(0.514)
    .delayfeedback(0.632)
    .shape(0.503)
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("cinema_bells_osc2")
    .gain(0.774)
    // envelope
    .attack(0.149)
    .release(0.548)
    // filter
    .hpf(2309)
    .hpq(10.0)
    .tremolosync(2.67)
    .tremolodepth(0.79)
    // effects
    .room(0.165)
    .delay(0.333)
    .delaytime(0.514)
    .delayfeedback(0.632)
    .shape(0.503)
    .compressor("-10:20:10:.002:.02"),
  note("c2 e2 g2 b2")
    .s("cinema_bells_osc3")
    .unison(16)
    .detune(4.472)
    .gain(0.01)
    // envelope
    .attack(0.149)
    .release(0.548)
    // filter
    .lpf(286)
    // effects
    .room(0.165)
    .delay(0.333)
    .delaytime(0.514)
    .delayfeedback(0.632)
    .shape(0.503)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_3 → osc_3_spectral_morph_amount (amount: 0.57)
`
  },
  "railgun": {
    name: "Railgun",
    pack: "Billain",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("railgun_osc1")
    .gain(0.537)
    // envelope
    .attack(0.149)
    .release(0.548)
    // filter
    .bpf(20000)
    .bpq(9.9)
    // pitch
    .penv(12.6)
    .pattack(0.166)
    .pdecay(0.859)
    .pcurve(1)
    .vib(4.0)
    .vibmod(9.9)
    .tremolosync(4.0)
    .tremolodepth(0.29)
    // effects
    .room(0.065)
    .shape(0.143)
    .compressor("-10:20:10:.002:.02"),
  note("c2 e2 g2 b2")
    .s("railgun_osc2")
    .gain(0.759)
    // envelope
    .attack(0.149)
    .release(0.548)
    // filter
    .bpf(72)
    .lpenv(8.0)
    .lpattack(0.166)
    .lpdecay(0.859)
    .lpsustain(0.0)
    // pitch
    .penv(13.5)
    .pattack(0.166)
    .pdecay(0.859)
    .pcurve(1)
    .vib(4.0)
    .vibmod(10.2)
    .tremolosync(4.0)
    // effects
    .room(0.065)
    .shape(0.143)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// env_2 → osc_1_unison_voices (amount: 1.0)
// env_2 → filter_fx_cutoff (amount: 0.705)
// env_2 → flanger_center (amount: 1.0)
// lfo_2 → flanger_dry_wet (amount: 1.0)
// lfo_5 → modulation_18_amount (amount: -0.415)
// env_3 → distortion_filter_cutoff (amount: 1.0)
// env_3 → sample_transpose (amount: 0.34)
`
  },
  "ceramic": {
    name: "Ceramic",
    pack: "Databroth",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("ceramic_osc1")
    .gain(0.207)
    // envelope
    .attack(0.149)
    .decay(0.616)
    .sustain(0.328)
    .release(0.749)
    // filter
    .lpf(3337)
    .lpq(18.4)
    // effects
    .room(0.261)
    .roomsize(0.26)
    .shape(0.513),
  note("d5 gb5 a5 db6")
    .s("ceramic_osc2")
    .gain(0.01)
    // envelope
    .attack(0.149)
    .decay(0.616)
    .sustain(0.328)
    .release(0.749)
    // filter
    .bpf(2216)
    .bpq(0.2)
    // effects
    .room(0.261)
    .roomsize(0.26)
    .shape(0.513),
  note("ab6 c7 eb7 g7")
    .s("ceramic_osc3")
    .gain(0.01)
    // envelope
    .attack(0.149)
    .decay(0.616)
    .sustain(0.328)
    .release(0.749)
    // effects
    .room(0.261)
    .roomsize(0.26)
    .shape(0.513)
)

// === Unmapped modulations (Vital-specific) ===
// env_3 → filter_fx_cutoff (amount: 0.281)
`
  },
  "disrupt": {
    name: "Disrupt",
    pack: "Databroth",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("disrupt_osc1")
    .unison(16)
    .detune(4.472)
    .gain(0.577)
    // envelope
    .attack(0.149)
    .sustain(0.767)
    .release(0.876)
    // pitch
    .penv(37.7)
    .pattack(0.149)
    .pdecay(0.981)
    .prelease(1.013)
    .pcurve(1)
    // effects
    .room(0.117)
    .delay(0.133)
    .delaytime(0.188)
    .delayfeedback(0.268)
    .shape(0.744)
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("disrupt_osc2")
    .begin(0.004)
    .unison(16)
    .detune(3.468)
    .gain(0.577)
    // envelope
    .attack(0.149)
    .sustain(0.767)
    .release(0.876)
    // filter
    .hpf(897)
    .hpq(10.4)
    .ftype("24db")
    .tremolosync(4.0)
    .tremolodepth(0.97)
    // effects
    .room(0.117)
    .delay(0.133)
    .delaytime(0.188)
    .delayfeedback(0.268)
    .shape(0.744)
    .compressor("-10:20:10:.002:.02"),
  note("c3 e3 g3 b3")
    .s("disrupt_osc3")
    .gain(0.577)
    // envelope
    .attack(0.149)
    .sustain(0.767)
    .release(0.876)
    // effects
    .room(0.117)
    .delay(0.133)
    .delaytime(0.188)
    .delayfeedback(0.268)
    .shape(0.744)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// random_1 → eq_band_cutoff (amount: 0.523)
// random_2 → eq_band_gain (amount: 0.393)
// lfo_1 → osc_2_distortion_amount (amount: 1.0)
// lfo_1 → osc_3_spectral_morph_amount (amount: 0.134)
// lfo_2 → osc_3_wave_frame (amount: 1.0)
// lfo_3 → osc_3_distortion_amount (amount: 0.869)
// random_3 → filter_2_cutoff (amount: -0.186)
// random_4 → filter_1_cutoff (amount: -0.258)
// lfo_5 → distortion_filter_cutoff (amount: 0.714)
`
  },
  "feeder": {
    name: "Feeder",
    pack: "Databroth",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("feeder_osc1")
    .unison(16)
    .detune(2.564)
    .gain(0.446)
    // envelope
    .attack(0.149)
    .release(0.548)
    // filter
    .bpf(261)
    .bpq(10.0)
    // effects
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("feeder_osc2")
    .gain(0.446)
    // envelope
    .attack(0.149)
    .release(0.548)
    // filter
    .bpf(261)
    .bpq(10.0)
    // effects
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("feeder_osc3")
    .gain(0.446)
    // envelope
    .attack(0.149)
    .release(0.548)
    // filter
    .bpf(261)
    .bpq(10.0)
    // effects
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_wave_frame (amount: 1.0)
// random_2 → filter_fx_blend (amount: 1.0)
// lfo_1 → osc_2_wave_frame (amount: 1.0)
// lfo_1 → osc_2_distortion_amount (amount: -0.501)
// lfo_1 → osc_3_wave_frame (amount: 1.0)
// lfo_1 → osc_3_spectral_morph_amount (amount: -1.0)
// lfo_1 → filter_1_resonance (amount: -0.423)
// lfo_2 → filter_fx_cutoff (amount: 0.793)
// random_1 → lfo_2_tempo (amount: 0.409)
// lfo_2 → distortion_filter_cutoff (amount: 1.0)
// random_3 → filter_fx_mix (amount: -0.646)
// lfo_3 → chorus_dry_wet (amount: 1.0)
// lfo_1 → chorus_mod_depth (amount: 0.097)
// lfo_2 → filter_2_blend_transpose (amount: 0.5)
// lfo_2 → filter_2_blend (amount: -0.305)
// random_1 → lfo_4_tempo (amount: -0.309)
// macro_control_3 → modulation_23_amount (amount: 0.5)
// macro_control_3 → modulation_26_amount (amount: 0.5)
// macro_control_3 → modulation_28_amount (amount: 0.5)
// lfo_5 → flanger_center (amount: 0.411)
`
  },
  "fleet": {
    name: "Fleet",
    pack: "Databroth",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("fleet_osc1")
    .begin(0.38)
    .unison(2)
    .detune(3.558)
    .gain(0.559)
    // envelope
    .attack(0.329)
    .sustain(0.988)
    .release(1.355)
    // filter
    .lpf(507)
    .tremolosync(4.81)
    // effects
    .room(0.311)
    .compressor("-10:20:10:.002:.02"),
  note("c5 e5 g5 b5")
    .s("fleet_osc2")
    .unison(16)
    .detune(3.546)
    .gain(0.383)
    // envelope
    .attack(0.329)
    .sustain(0.988)
    .release(1.355)
    // filter
    .bpf(79)
    .vib(8.0)
    .vibmod(24.0)
    // effects
    .room(0.311)
    .compressor("-10:20:10:.002:.02"),
  note("c3 e3 g3 b3")
    .s("fleet_osc3")
    .begin(0.222)
    .gain(0.01)
    // envelope
    .attack(0.329)
    .sustain(0.988)
    .release(1.355)
    // effects
    .room(0.311)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → filter_1_mix (amount: 0.865)
// lfo_2 → modulation_1_amount (amount: -0.447)
// lfo_2 → osc_2_distortion_amount (amount: -0.469)
// lfo_3 → osc_1_distortion_amount (amount: 0.55)
// lfo_1 → chorus_dry_wet (amount: -1.0)
// lfo_4 → reverb_dry_wet (amount: -0.474)
// lfo_3 → modulation_9_amount (amount: -0.499)
// lfo_6 → lfo_5_frequency (amount: 1.0)
// random_1 → delay_filter_cutoff (amount: -1.0)
// lfo_7 → distortion_drive (amount: 0.244)
// lfo_7 → distortion_filter_cutoff (amount: 0.647)
`
  },
  "gorgled": {
    name: "Gorgled",
    pack: "Databroth",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("gorgled_osc1")
    .gain(0.727)
    // envelope
    .attack(0.149)
    .release(0.548)
    // filter
    .bpf(261)
    .bpq(15.6)
    // effects
    .distort(1.507)
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("gorgled_osc2")
    .begin(0.011)
    .unison(16)
    .detune(4.472)
    .gain(0.49)
    // envelope
    .attack(0.149)
    .release(0.548)
    // filter
    .bpf(261)
    .bpq(15.6)
    // effects
    .distort(1.507)
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("gorgled_osc3")
    .begin(0.008)
    .gain(0.01)
    // envelope
    .attack(0.149)
    .release(0.548)
    // effects
    .distort(1.507)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → filter_1_blend_transpose (amount: 1.0)
// lfo_2 → filter_2_blend_transpose (amount: 1.0)
// lfo_3 → osc_2_wave_frame (amount: 0.571)
// lfo_4 → osc_1_wave_frame (amount: 1.0)
// lfo_5 → osc_1_distortion_amount (amount: 1.0)
// lfo_6 → distortion_drive (amount: 0.234)
// lfo_5 → distortion_filter_cutoff (amount: 0.249)
// lfo_7 → filter_fx_cutoff (amount: -0.622)
`
  },
  "snowcrash": {
    name: "Snowcrash",
    pack: "Databroth",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("snowcrash_osc1")
    .unison(15)
    .detune(3.69)
    .gain(0.547)
    // envelope
    .attack(1.313)
    .release(1.495)
    // filter
    .bpf(568)
    .bpq(11.1)
    // effects
    .delay(0.333)
    .delaytime(0.125)
    .coarse(1)
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("snowcrash_osc2")
    .gain(0.01)
    // envelope
    .attack(1.313)
    .release(1.495)
    // effects
    .delay(0.333)
    .delaytime(0.125)
    .coarse(1)
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("snowcrash_osc3")
    .unison(16)
    .detune(2.651)
    .gain(0.01)
    // envelope
    .attack(1.313)
    .release(1.495)
    // filter
    .bpf(4958)
    .bpq(15.5)
    // effects
    .delay(0.333)
    .delaytime(0.125)
    .coarse(1)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_wave_frame (amount: 0.219)
// random → osc_1_wave_frame (amount: 1.0)
`
  },
  "ah_eh_ee_oh": {
    name: "Ah Eh Ee Oh",
    pack: "Factory",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c4 e4 g4 b4")
  .s("ah_eh_ee_oh_osc1")
  .unison(16)
  .detune(1.072)
  .gain(0.59)
  // envelope
  .attack(0.268)
  .release(0.548)
  // filter
  .lpf(3779)
  .lpq(0.3)
  // effects
  .compressor("-10:20:10:.002:.02")

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_wave_frame (amount: 0.22)
// random_1 → osc_1_wave_frame (amount: 0.74)
// random_2 → osc_1_spectral_morph_amount (amount: 0.6)
`
  },
  "fm_drum_circle": {
    name: "FM Drum Circle",
    pack: "Factory",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("fm_drum_circle_osc1")
    .gain(0.783)
    // envelope
    .attack(0.21)
    .release(0.548)
    // filter
    .lpf(523)
    .ftype("24db")
    // effects
    .shape(0.666)
    .compressor("-10:20:10:.002:.02"),
  note("c2 e2 g2 b2")
    .s("fm_drum_circle_osc2")
    .gain(0.01)
    // envelope
    .attack(0.21)
    .release(0.548)
    // effects
    .shape(0.666)
    .compressor("-10:20:10:.002:.02"),
  note("c2 e2 g2 b2")
    .s("fm_drum_circle_osc3")
    .gain(0.01)
    // envelope
    .attack(0.21)
    .release(0.548)
    // effects
    .shape(0.666)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// random_1 → osc_2_transpose (amount: 0.5)
// random_2 → osc_3_transpose (amount: 0.498)
// macro_control_1 → modulation_2_amount (amount: 0.102)
// macro_control_1 → modulation_4_amount (amount: 0.071)
`
  },
  "plucked_string": {
    name: "Plucked String",
    pack: "Factory",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
note("c4 e4 g4 b4")
  .s("plucked_string_osc1")
  .gain(0.574)
  // envelope
  .attack(0.115)
  .decay(0.936)
  .release(0.809)
  // effects
  .room(0.394)
  .shape(0.73)

// === Unmapped modulations (Vital-specific) ===
// macro_control_2 → filter_1_blend (amount: 1.0)
// macro_control_3 → reverb_decay_time (amount: 0.691)
`
  },
  "shepard_tone_template": {
    name: "Shepard Tone Template",
    pack: "Factory",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c4 e4 g4 b4")
  .s("shepard_tone_template_osc1")
  .unison(10)
  .detune(3.097)
  .gain(0.524)
  // envelope
  .attack(0.149)
  .release(0.548)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_spectral_morph_amount (amount: 1.0)
`
  },
  "staggered_phrases": {
    name: "Staggered Phrases",
    pack: "Factory",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("staggered_phrases_osc1")
    .unison(14)
    .detune(1.32)
    .gain(0.452)
    // envelope
    .attack(0.329)
    .release(0.548)
    // filter
    .lpf(1589)
    .lpq(11.5)
    .ftype("ladder")
    // effects
    .coarse(9)
    .compressor("-10:20:10:.002:.02"),
  note("c3 e3 g3 b3")
    .s("staggered_phrases_osc3")
    .begin(0.336)
    .gain(0.639)
    // envelope
    .attack(0.329)
    .release(0.548)
    // effects
    .coarse(9)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_wave_frame (amount: 1.0)
// lfo_2 → lfo_1_tempo (amount: 0.552)
// lfo_1 → distortion_drive (amount: -0.862)
// lfo_3 → modulation_1_amount (amount: 1.0)
`
  },
  "text_to_wavetable_template": {
    name: "Text To Wavetable Template",
    pack: "Factory",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c4 e4 g4 b4")
  .s("text_to_wavetable_template_osc1")
  .gain(0.531)
  // envelope
  .attack(0.149)
  .release(0.548)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_wave_frame (amount: 1.0)
`
  },
  "touch_tone": {
    name: "Touch Tone",
    pack: "Factory",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c5 e5 g5 b5")
    .s("touch_tone_osc1")
    .gain(0.69)
    // envelope
    .attack(0.218),
  note("c5 e5 g5 b5")
    .s("touch_tone_osc2")
    .gain(0.69)
    // envelope
    .attack(0.218)
)

// === Unmapped modulations (Vital-specific) ===
// note_in_octave → osc_1_transpose (amount: 0.5)
// note_in_octave → osc_1_tune (amount: 0.5)
// note_in_octave → osc_2_transpose (amount: 0.5)
// note_in_octave → osc_2_tune (amount: 0.5)
// note_in_octave → modulation_5_amount (amount: -1.0)
// note_in_octave → modulation_6_amount (amount: -1.0)
`
  },
  "digestive_trauma": {
    name: "Digestive Trauma",
    pack: "Glorkglunk",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("digestive_trauma_osc1")
    .gain(0.55)
    // envelope
    .attack(0.149)
    .release(0.548)
    // filter
    .bpf(261)
    // effects
    .shape(0.413)
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("digestive_trauma_osc3")
    .gain(0.55)
    // envelope
    .attack(0.149)
    .release(0.548)
    // effects
    .shape(0.413)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_wave_frame (amount: 0.87)
// lfo_1 → osc_1_spectral_morph_amount (amount: 0.33)
// lfo_2 → distortion_drive (amount: -0.16)
// lfo_1 → chorus_dry_wet (amount: 0.62)
// macro_control_2 → modulation_2_amount (amount: 0.141)
// macro_control_2 → filter_2_resonance (amount: 0.425)
// macro_control_2 → modulation_5_amount (amount: 0.164)
// lfo_1 → osc_3_wave_frame (amount: 0.28)
`
  },
  "special_glitch_thing": {
    name: "Special Glitch Thing",
    pack: "Glorkglunk",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c4 e4 g4 b4")
  .s("special_glitch_thing_osc1")
  .begin(1.0)
  .gain(0.595)
  // envelope
  .attack(0.149)
  .release(1.023)
  // filter
  .bpf(86)
  .vib(0.01)
  .vibmod(24.0)
  // effects
  .compressor("-10:20:10:.002:.02")

// === Unmapped modulations (Vital-specific) ===
// lfo_4 → osc_1_spectral_morph_amount (amount: 1.0)
// lfo_3 → osc_1_wave_frame (amount: -1.0)
// lfo_2 → osc_2_wave_frame (amount: 0.27)
// random_1 → osc_1_distortion_amount (amount: 1.0)
// lfo_5 → osc_2_wave_frame (amount: 0.31)
// random_2 → osc_1_unison_detune (amount: 1.0)
// random_3 → delay_frequency (amount: -0.67)
// lfo_3 → delay_filter_cutoff (amount: -0.66)
// lfo_2 → filter_1_resonance (amount: 1.0)
// lfo_1 → filter_1_blend (amount: 1.0)
// random_4 → flanger_center (amount: 0.743)
// lfo_4 → filter_1_blend_transpose (amount: 0.895)
// lfo_7 → distortion_filter_cutoff (amount: 0.438)
// lfo_8 → lfo_7_keytrack_transpose (amount: 0.22)
// lfo_5 → filter_2_blend_transpose (amount: 0.5)
// lfo_5 → filter_2_blend (amount: 1.0)
// random_1 → eq_band_cutoff (amount: 0.438)
// random_2 → osc_1_unison_voices (amount: 0.57)
// random_3 → osc_2_transpose (amount: 0.5)
// lfo_4 → delay_aux_frequency (amount: -0.5)
`
  },
  "squish_clicker": {
    name: "Squish Clicker",
    pack: "Glorkglunk",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c2 e2 g2 b2")
  .s("squish_clicker_osc1")
  .gain(0.547)
  // envelope
  .attack(0.149)
  .release(0.548)
  // filter
  .bpf(823)
  .bpq(17.0)
  .vib(2.67)
  .vibmod(24.0)
  // effects
  .distort(1.69)
  .compressor("-10:20:10:.002:.02")

// === Unmapped modulations (Vital-specific) ===
// lfo_3 → filter_1_blend (amount: 0.79)
// lfo_1 → delay_frequency (amount: -0.384)
`
  },
  "thunk": {
    name: "THUNK",
    pack: "Glorkglunk",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("thunk_osc1")
    .gain(0.547)
    // envelope
    .attack(0.149)
    .release(0.548)
    // filter
    .lpf(122)
    .lpq(1.0)
    .lpenv(4.4)
    .lpdecay(1.0)
    .lpsustain(0)
    // pitch
    .penv(16.3)
    .pdecay(1.0)
    .pcurve(1)
    // effects
    .shape(0.523),
  note("c4 e4 g4 b4")
    .s("thunk_osc2")
    .gain(0.01)
    // envelope
    .attack(0.149)
    .release(0.548)
    // effects
    .shape(0.523)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → compressor_mix (amount: 1.0)
// lfo_1 → modulation_4_power (amount: -0.537)
// macro_control_1 → modulation_1_amount (amount: 0.46)
// macro_control_2 → modulation_4_amount (amount: 0.146)
// lfo_1 → distortion_drive (amount: 0.16)
`
  },
  "thumpus": {
    name: "Thumpus",
    pack: "Glorkglunk",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("thumpus_osc1")
    .unison(6)
    .detune(2.472)
    .gain(0.547)
    // envelope
    .attack(0.149)
    .release(0.548)
    // filter
    .lpf(20000)
    // effects
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("thumpus_osc2")
    .gain(0.547)
    // envelope
    .attack(0.149)
    .release(0.548)
    // effects
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("thumpus_osc3")
    .begin(0.936)
    .gain(0.499)
    // envelope
    .attack(0.149)
    .release(0.548)
    // filter
    .lpf(20000)
    // effects
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_wave_frame (amount: 1.0)
// lfo_1 → filter_1_blend (amount: 1.0)
// lfo_1 → osc_3_wave_frame (amount: -0.82)
// lfo_1 → eq_high_cutoff (amount: 0.851)
// lfo_2 → lfo_1_phase (amount: 1.0)
// macro_control_1 → modulation_6_power (amount: 0.5)
// lfo_1 → osc_2_wave_frame (amount: 0.59)
// lfo_1 → osc_2_transpose (amount: 0.5)
// macro_control_1 → modulation_11_power (amount: 0.5)
// macro_control_4 → filter_fx_blend (amount: 0.53)
// macro_control_3 → filter_fx_resonance (amount: 0.573)
`
  },
  "swiss_army_knife": {
    name: "Swiss Army Knife",
    pack: "Halcyon Future Riddim Vol 1",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("swiss_army_knife_osc1")
    .gain(0.447)
    // envelope
    .attack(0.042)
    .release(1.011)
    // filter
    .lpf(13096)
    .lpq(12.5)
    .ftype("ladder")
    .vib(4.0)
    .vibmod(24.0)
    // effects
    .room(0.19)
    .roomsize(0.13)
    .delay(0.05)
    .delaytime(0.188)
    .distort(1.39)
    .compressor("-10:20:10:.002:.02"),
  note("f5 a5 c6 e6")
    .s("swiss_army_knife_osc2")
    .begin(0.264)
    .gain(0.632)
    // envelope
    .attack(0.042)
    .release(1.011)
    // filter
    .lpf(13096)
    .lpq(12.5)
    .ftype("ladder")
    .vib(1.96)
    // effects
    .room(0.19)
    .roomsize(0.13)
    .delay(0.05)
    .delaytime(0.188)
    .distort(1.39)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_5 → osc_1_tune (amount: 0.05)
// lfo_4 → osc_2_tune (amount: -0.006)
`
  },
  "boot_scre3n": {
    name: "Boot Scre3n",
    pack: "Halcyon Future Riddim Vol 1",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("boot_scre3n_osc1")
    .gain(0.496)
    // envelope
    .attack(0.625)
    .decay(0.667)
    .release(0.75)
    // effects
    .room(0.41)
    .roomsize(0.78)
    .compressor("-10:20:10:.002:.02"),
  note("c3 e3 g3 b3")
    .s("boot_scre3n_osc2")
    .unison(2)
    .detune(3.522)
    .gain(0.496)
    // envelope
    .attack(0.625)
    .decay(0.667)
    .release(0.75)
    // effects
    .room(0.41)
    .roomsize(0.78)
    .compressor("-10:20:10:.002:.02"),
  note("c6 e6 g6 b6")
    .s("boot_scre3n_osc3")
    .unison(3)
    .detune(4.472)
    .spread(0.925)
    .gain(0.475)
    // envelope
    .attack(0.625)
    .decay(0.667)
    .release(0.75)
    // pitch
    .penv(-7.6)
    .pattack(0.994)
    .prelease(0.976)
    // effects
    .room(0.41)
    .roomsize(0.78)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_2 → osc_1_spectral_morph_amount (amount: -0.13)
// lfo_2 → osc_2_spectral_morph_amount (amount: -0.14)
`
  },
  "memory_leak": {
    name: "Memory Leak",
    pack: "Halcyon Future Riddim Vol 1",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("memory_leak_osc1")
    .begin(0.48)
    .unison(2)
    .detune(2.522)
    .gain(0.547)
    // envelope
    .attack(0.601)
    .release(0.714)
    .vib(4.0)
    .vibmod(24.0)
    // effects
    .delay(1.0)
    .delaytime(0.111)
    .delayfeedback(0.03)
    .coarse(11)
    .compressor("-10:20:10:.002:.02"),
  note("c3 e3 g3 b3")
    .s("memory_leak_osc2")
    .gain(0.01)
    // envelope
    .attack(0.601)
    .release(0.714)
    // effects
    .delay(1.0)
    .delaytime(0.111)
    .delayfeedback(0.03)
    .coarse(11)
    .compressor("-10:20:10:.002:.02"),
  note("c3 e3 g3 b3")
    .s("memory_leak_osc3")
    .begin(0.473)
    .gain(0.01)
    // envelope
    .attack(0.601)
    .release(0.714)
    // effects
    .delay(1.0)
    .delaytime(0.111)
    .delayfeedback(0.03)
    .coarse(11)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_3 → osc_1_spectral_morph_amount (amount: -0.387)
// random_1 → osc_1_wave_frame (amount: -0.35)
// lfo_3 → osc_1_distortion_amount (amount: -0.32)
// macro_control_2 → modulation_3_amount (amount: 0.18)
// macro_control_3 → delay_aux_frequency (amount: -0.07)
// macro_control_3 → delay_frequency (amount: -0.13)
// note_in_octave → osc_2_pan (amount: 0.255)
// note_in_octave → osc_3_pan (amount: -0.25)
`
  },
  "oolacile_evil_dubstep_bass": {
    name: "Oolacile Evil Dubstep Bass",
    pack: "Halcyon Future Riddim Vol 1",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("oolacile_evil_dubstep_bass_osc1")
    .gain(0.524)
    // envelope
    .attack(0.804)
    .decay(0.869)
    .sustain(0.365)
    .release(0.667)
    // pitch
    .penv(-8.1)
    .pattack(0.149)
    .pdecay(0.786)
    .prelease(0.548)
    // effects
    .shape(0.543)
    .phaser(3.0)
    .phaserdepth(0.0)
    .compressor("-10:20:10:.002:.02"),
  note("c3 e3 g3 b3")
    .s("oolacile_evil_dubstep_bass_osc2")
    .begin(0.843)
    .unison(4)
    .detune(4.472)
    .gain(0.489)
    // envelope
    .attack(0.804)
    .decay(0.869)
    .sustain(0.365)
    .release(0.667)
    // filter
    .lpf(74)
    .lpq(11.8)
    .lpenv(1.8)
    .lpdecay(1.0)
    .lpsustain(0)
    // effects
    .shape(0.543)
    .phaser(3.0)
    .phaserdepth(0.0)
    .compressor("-10:20:10:.002:.02"),
  note("db4 f4 ab4 c5")
    .s("oolacile_evil_dubstep_bass_osc3")
    .begin(0.69)
    .gain(0.01)
    // envelope
    .attack(0.804)
    .decay(0.869)
    .sustain(0.365)
    .release(0.667)
    // filter
    .lpf(74)
    .lpq(11.8)
    .lpenv(1.8)
    .lpdecay(1.0)
    .lpsustain(0)
    // pitch
    .penv(15.0)
    .pattack(0.149)
    .pdecay(0.845)
    .prelease(0.548)
    .pcurve(1)
    // effects
    .shape(0.543)
    .phaser(3.0)
    .phaserdepth(0.0)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// env_5 → flanger_center (amount: 0.2)
// env_3 → phaser_center (amount: 0.134)
// lfo_1 → eq_band_cutoff (amount: -0.2)
`
  },
  "satellites": {
    name: "Satellites",
    pack: "Halcyon Future Riddim Vol 1",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("satellites_osc1")
    .unison(4)
    .detune(4.472)
    .gain(0.156)
    // envelope
    .attack(0.673)
    .sustain(0.52)
    .release(0.845)
    // effects
    .room(0.13)
    .roomsize(0.335)
    .delay(0.173)
    .delaytime(0.375)
    .delayfeedback(0.62)
    .shape(0.363)
    .compressor("-10:20:10:.002:.02"),
  note("c3 e3 g3 b3")
    .s("satellites_osc2")
    .gain(0.01)
    // envelope
    .attack(0.673)
    .sustain(0.52)
    .release(0.845)
    // filter
    .lpf(2013)
    .lpq(0.8)
    .ftype("24db")
    // effects
    .room(0.13)
    .roomsize(0.335)
    .delay(0.173)
    .delaytime(0.375)
    .delayfeedback(0.62)
    .shape(0.363)
    .compressor("-10:20:10:.002:.02"),
  note("c3 e3 g3 b3")
    .s("satellites_osc3")
    .begin(0.226)
    .gain(0.01)
    // envelope
    .attack(0.673)
    .sustain(0.52)
    .release(0.845)
    // filter
    .lpf(2013)
    .lpq(0.8)
    .ftype("24db")
    // effects
    .room(0.13)
    .roomsize(0.335)
    .delay(0.173)
    .delaytime(0.375)
    .delayfeedback(0.62)
    .shape(0.363)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// random → osc_1_spectral_morph_amount (amount: 0.3)
// random → osc_1_tune (amount: -0.12)
// random → env_1_sustain (amount: 0.1)
// random → osc_2_level (amount: 0.173)
// random_1 → osc_1_tune (amount: 0.14)
// random_1 → osc_2_tune (amount: -0.2)
// macro_control_2 → reverb_decay_time (amount: 0.26)
// macro_control_1 → env_1_release (amount: 0.125)
// macro_control_1 → env_1_attack (amount: 0.057)
// macro_control_1 → eq_band_gain (amount: 0.38)
// macro_control_1 → eq_high_gain (amount: 0.187)
`
  },
  "space_station": {
    name: "Space Station",
    pack: "Halcyon Future Riddim Vol 1",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("space_station_osc1")
    .unison(3)
    .detune(4.472)
    .gain(0.422)
    // envelope
    .attack(0.59)
    .release(0.762)
    // filter
    .lpf(2573)
    .lpq(3.2)
    .vib(8.0)
    .vibmod(20.4)
    .tremolosync(5.33)
    .tremolodepth(0.08)
    // effects
    .delay(0.655)
    .delaytime(0.145)
    .delayfeedback(-0.62),
  note("c4 e4 g4 b4")
    .s("space_station_osc2")
    .gain(0.349)
    // envelope
    .attack(0.59)
    .release(0.762)
    // filter
    .lpf(2573)
    .lpq(3.2)
    .tremolosync(5.33)
    .tremolodepth(0.08)
    // effects
    .delay(0.655)
    .delaytime(0.145)
    .delayfeedback(-0.62),
  note("e6 ab6 b6 eb7")
    .s("space_station_osc3")
    .unison(7)
    .detune(4.472)
    .gain(0.185)
    // envelope
    .attack(0.59)
    .release(0.762)
    // filter
    .lpf(2573)
    .lpq(3.2)
    .vib(8.0)
    .vibmod(24.0)
    .tremolosync(5.33)
    .tremolodepth(0.58)
    // effects
    .delay(0.655)
    .delaytime(0.145)
    .delayfeedback(-0.62)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_2 → distortion_drive (amount: 0.536)
// lfo_3 → osc_2_distortion_amount (amount: 0.5)
// lfo_1 → filter_1_drive (amount: 0.85)
// lfo_4 → chorus_dry_wet (amount: 0.21)
// lfo_1 → stereo_routing (amount: 0.33)
// lfo_5 → delay_dry_wet (amount: 0.263)
// macro_control_2 → reverb_decay_time (amount: 0.282)
// macro_control_4 → modulation_17_amount (amount: 0.234)
// macro_control_3 → modulation_6_amount (amount: 0.185)
// macro_control_1 → delay_frequency (amount: 0.52)
// lfo_1 → filter_2_blend (amount: 0.42)
// macro_control_4 → filter_1_blend (amount: 0.2)
// lfo_4 → osc_2_spectral_morph_amount (amount: -0.52)
// macro_control_1 → delay_filter_spread (amount: 0.105)
`
  },
  "simple_weoum": {
    name: "Simple Weoum",
    pack: "Halcyon Future Riddim Vol 1",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("simple_weoum_osc1")
    .begin(0.217)
    .gain(0.673)
    // envelope
    .attack(0.149)
    .release(0.548)
    .tremolosync(1.0)
    // effects
    .delay(0.233)
    .delaytime(0.292)
    .delayfeedback(0.26)
    .shape(0.523)
    .phaser(3.0),
  note("c4 e4 g4 b4")
    .s("simple_weoum_osc2")
    .begin(0.617)
    .gain(0.673)
    // envelope
    .attack(0.149)
    .release(0.548)
    .tremolosync(1.0)
    // effects
    .delay(0.233)
    .delaytime(0.292)
    .delayfeedback(0.26)
    .shape(0.523)
    .phaser(3.0),
  note("c4 e4 g4 b4")
    .s("simple_weoum_osc3")
    .gain(0.673)
    // envelope
    .attack(0.149)
    .release(0.548)
    .tremolosync(1.0)
    // effects
    .delay(0.233)
    .delaytime(0.292)
    .delayfeedback(0.26)
    .shape(0.523)
    .phaser(3.0)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_wave_frame (amount: 0.19)
// lfo_2 → distortion_filter_cutoff (amount: 0.35)
// lfo_1 → flanger_center (amount: -0.188)
// lfo_2 → flanger_dry_wet (amount: 0.545)
// lfo_1 → phaser_center (amount: -0.092)
// macro_control_2 → phaser_center (amount: 0.352)
`
  },
  "vlt_future_gun": {
    name: "VLT Future Gun",
    pack: "Halcyon Future Riddim Vol 1",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("vlt_future_gun_osc1")
    .gain(0.202)
    // envelope
    .attack(0.149)
    .decay(0.96)
    .release(0.402)
    // filter
    .bpf(262)
    .bpq(7.5)
    .tremolosync(2.0)
    .tremolodepth(0.82)
    // effects
    .shape(0.71),
  note("c4 e4 g4 b4")
    .s("vlt_future_gun_osc2")
    .gain(0.242)
    // envelope
    .attack(0.149)
    .decay(0.96)
    .release(0.402)
    // filter
    .bpf(262)
    .bpq(7.5)
    .tremolosync(2.0)
    // effects
    .shape(0.71),
  note("c4 e4 g4 b4")
    .s("vlt_future_gun_osc3")
    .gain(0.517)
    // envelope
    .attack(0.149)
    .decay(0.96)
    .release(0.402)
    // filter
    .lpf(259)
    .vib(2.0)
    .vibmod(24.0)
    // effects
    .shape(0.71)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_spectral_morph_amount (amount: -0.672)
// lfo_1 → osc_2_spectral_morph_amount (amount: 0.324)
// macro_control_3 → modulation_9_amount (amount: 0.236)
// macro_control_3 → modulation_11_amount (amount: 0.5)
// lfo_1 → sample_level (amount: -0.199)
`
  },
  "analog_pad": {
    name: "Analog Pad",
    pack: "In The Mix",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("analog_pad_osc1")
    .unison(7)
    .detune(3.022)
    .gain(0.277)
    // envelope
    .attack(0.518)
    .sustain(0.611)
    .release(0.892)
    // filter
    .lpf(328)
    // effects
    .shape(0.163)
    .phaser(3.0),
  note("c4 e4 g4 b4")
    .s("analog_pad_osc2")
    .gain(0.095)
    // envelope
    .attack(0.518)
    .sustain(0.611)
    .release(0.892)
    // effects
    .shape(0.163)
    .phaser(3.0)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_wave_frame (amount: 1.0)
// random_1 → osc_2_distortion_amount (amount: 0.155)
`
  },
  "distant_majestic_lead": {
    name: "Distant Majestic Lead",
    pack: "In The Mix",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c5 e5 g5 b5")
  .s("distant_majestic_lead_osc1")
  .begin(0.485)
  .unison(8)
  .gain(0.01)
  // envelope
  .attack(0.274)
  .decay(0.89)
  .sustain(0.064)
  // filter
  .lpf(20000)
  .lpq(0.9)
  // effects
  .delay(0.043)
  .delaytime(0.125)

// === Unmapped modulations (Vital-specific) ===
// macro_control_4 → env_1_release (amount: 1.0)
`
  },
  "growl_bass_sidechain": {
    name: "Growl Bass Sidechain",
    pack: "In The Mix",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("growl_bass_sidechain_osc1")
    .gain(0.39)
    // envelope
    .attack(0.257)
    .decay(0.834)
    .release(0.488)
    // filter
    .lpf(10786)
    .lpq(1.4)
    .ftype("ladder")
    .tremolosync(1.33)
    .tremolodepth(0.29),
  note("c4 e4 g4 b4")
    .s("growl_bass_sidechain_osc2")
    .begin(0.413)
    .unison(12)
    .detune(2.9)
    .gain(0.406)
    // envelope
    .attack(0.257)
    .decay(0.834)
    .release(0.488)
    // filter
    .lpf(10786)
    .lpq(1.4)
    .ftype("ladder")
    .tremolosync(1.33)
    .tremolodepth(0.41)
)

// === Unmapped modulations (Vital-specific) ===
// macro_control_2 → filter_fx_cutoff (amount: 1.0)
// random_1 → osc_1_spectral_morph_amount (amount: 0.14)
`
  },
  "moog_pluck": {
    name: "Moog Pluck",
    pack: "In The Mix",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("moog_pluck_osc1")
    .begin(0.413)
    .gain(0.683)
    // envelope
    .attack(0.369)
    .sustain(0.558)
    .release(0.571)
    // filter
    .lpf(29)
    .ftype("24db")
    .lpenv(6.2)
    .lpsustain(0.232)
    .lprelease(0.548)
    // effects
    .room(0.025),
  note("c5 e5 g5 b5")
    .s("moog_pluck_osc2")
    .begin(0.405)
    .unison(5)
    .detune(3.1)
    .gain(0.239)
    // envelope
    .attack(0.369)
    .sustain(0.558)
    .release(0.571)
    // filter
    .lpf(29)
    .ftype("24db")
    .lpenv(6.2)
    .lpsustain(0.232)
    .lprelease(0.548)
    // effects
    .room(0.025)
)

// === Unmapped modulations (Vital-specific) ===
// macro_control_2 → env_1_attack (amount: 0.14)
// macro_control_3 → filter_fx_cutoff (amount: 1.0)
`
  },
  "strings_section": {
    name: "Strings Section",
    pack: "In The Mix",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("strings_section_osc1")
    .unison(7)
    .detune(2.622)
    .gain(0.01)
    // envelope
    .attack(0.899)
    .sustain(0.656)
    .release(1.19)
    // filter
    .lpf(469)
    .lpenv(1.1)
    .lpattack(0.911)
    .lpsustain(0.224)
    .lprelease(0.548)
    .vib(0.01)
    .vibmod(4.07)
    // effects
    .delay(0.113)
    .delaytime(0.188)
    .delayfeedback(0.33)
    .shape(0.383),
  note("c4 e4 g4 b4")
    .s("strings_section_osc2")
    .unison(7)
    .detune(3.15)
    .gain(0.01)
    // envelope
    .attack(0.899)
    .sustain(0.656)
    .release(1.19)
    // filter
    .lpf(469)
    .lpenv(1.1)
    .lpattack(0.911)
    .lpsustain(0.224)
    .lprelease(0.548)
    // effects
    .delay(0.113)
    .delaytime(0.188)
    .delayfeedback(0.33)
    .shape(0.383)
)

// === Unmapped modulations (Vital-specific) ===
// macro_control_2 → env_1_attack (amount: 0.237)
// lfo_1 → lfo_2_frequency (amount: 0.18)
// macro_control_3 → reverb_decay_time (amount: 0.395)
`
  },
  "complex_electro_1": {
    name: "Complex Electro 1",
    pack: "Level 8",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c2 e2 g2 b2")
    .s("complex_electro_1_osc1")
    .begin(0.176)
    .gain(0.683)
    // envelope
    .attack(0.149)
    .release(0.548)
    // filter
    .lpf(20000)
    .tremolosync(8.0)
    .tremolodepth(0.6)
    // effects
    .room(0.065)
    .roomsize(0.245)
    .compressor("-10:20:10:.002:.02"),
  note("c3 e3 g3 b3")
    .s("complex_electro_1_osc2")
    .unison(3)
    .spread(1.0)
    .gain(0.683)
    // envelope
    .attack(0.149)
    .release(0.548)
    // filter
    .lpf(179)
    .lpq(6.0)
    .tremolosync(8.0)
    .tremolodepth(0.41)
    // effects
    .room(0.065)
    .roomsize(0.245)
    .compressor("-10:20:10:.002:.02"),
  note("c2 e2 g2 b2")
    .s("complex_electro_1_osc3")
    .gain(0.683)
    // envelope
    .attack(0.149)
    .release(0.548)
    .tremolosync(8.0)
    .tremolodepth(0.6)
    // effects
    .room(0.065)
    .roomsize(0.245)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_2 → sample_level (amount: 0.6)
// lfo_4 → osc_3_wave_frame (amount: 1.0)
// lfo_7 → osc_1_distortion_amount (amount: 0.49)
// macro_control_2 → modulation_6_amount (amount: 0.199)
`
  },
  "crescendo_bells": {
    name: "Crescendo Bells",
    pack: "Level 8",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("crescendo_bells_osc1")
    .gain(0.617)
    // envelope
    .attack(0.149)
    .release(1.154)
    // filter
    .lpf(643)
    .lpq(6.2)
    .lpenv(3.8)
    .lpdecay(1.0)
    .lpsustain(0)
    // effects
    .room(0.465)
    .roomsize(0.605)
    .delay(0.258)
    .delaytime(0.125)
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("crescendo_bells_osc2")
    .begin(0.073)
    .gain(0.617)
    // envelope
    .attack(0.149)
    .release(1.154)
    // filter
    .bpf(261)
    .bpq(4.3)
    .lpenv(3.1)
    .lpdecay(1.0)
    .lpsustain(0)
    // effects
    .room(0.465)
    .roomsize(0.605)
    .delay(0.258)
    .delaytime(0.125)
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("crescendo_bells_osc3")
    .begin(0.161)
    .gain(0.617)
    // envelope
    .attack(0.149)
    .release(1.154)
    // effects
    .room(0.465)
    .roomsize(0.605)
    .delay(0.258)
    .delaytime(0.125)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_5 → lfo_3_delay_time (amount: -0.22)
// lfo_5 → lfo_2_delay_time (amount: -0.13)
`
  },
  "damped_horn": {
    name: "Damped Horn",
    pack: "Level 8",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c2 e2 g2 b2")
    .s("damped_horn_osc1")
    .unison(8)
    .detune(1.722)
    .gain(0.339)
    // envelope
    .attack(0.863)
    .release(0.548)
    // filter
    .lpf(45)
    .lpq(6.2)
    .lpenv(4.8)
    .lpdecay(1.0)
    .lpsustain(0)
    // pitch
    .penv(-16.6)
    .pdecay(0.472)
    .vib(2.36)
    .vibmod(16.57)
    .tremolosync(2.12)
    .tremolodepth(0.29)
    // effects
    .room(0.33)
    .delay(0.163)
    .delaytime(0.125)
    .delayfeedback(0.35)
    .shape(0.433)
    .compressor("-10:20:10:.002:.02"),
  note("c2 e2 g2 b2")
    .s("damped_horn_osc2")
    .unison(7)
    .detune(4.672)
    .spread(0.33)
    .gain(0.11)
    // envelope
    .attack(0.863)
    .release(0.548)
    // filter
    .lpf(20)
    .lpq(4.1)
    .ftype("ladder")
    // pitch
    .penv(5.6)
    .pattack(0.149)
    .prelease(0.548)
    .tremolosync(2.12)
    .tremolodepth(0.29)
    // effects
    .room(0.33)
    .delay(0.163)
    .delaytime(0.125)
    .delayfeedback(0.35)
    .shape(0.433)
    .compressor("-10:20:10:.002:.02"),
  note("c3 e3 g3 b3")
    .s("damped_horn_osc3")
    .unison(6)
    .detune(4.572)
    .spread(0.305)
    .gain(0.01)
    // envelope
    .attack(0.863)
    .release(0.548)
    // filter
    .lpf(20)
    .lpq(4.1)
    .ftype("ladder")
    // effects
    .room(0.33)
    .delay(0.163)
    .delaytime(0.125)
    .delayfeedback(0.35)
    .shape(0.433)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_wave_frame (amount: 1.0)
// macro_control_1 → lfo_4_smooth_time (amount: -0.99)
// macro_control_2 → lfo_5_smooth_time (amount: -0.93)
// lfo_6 → distortion_filter_cutoff (amount: -0.158)
// random_1 → lfo_6_smooth_time (amount: -0.79)
`
  },
  "fm_mode": {
    name: "FM Mode",
    pack: "Level 8",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
stack(
  note("c2 e2 g2 b2")
    .s("fm_mode_osc1")
    .gain(0.658)
    // envelope
    .attack(0.149)
    .release(0.999)
    // filter
    .lpf(81)
    .lpq(2.4)
    .vib(4.0)
    .vibmod(21.6)
    // effects
    .room(0.57)
    .shape(0.313)
    .compressor("-10:20:10:.002:.02"),
  note("g4 b4 d5 gb5")
    .s("fm_mode_osc2")
    .gain(0.01)
    // envelope
    .attack(0.149)
    .release(0.999)
    // filter
    .lpf(127)
    .lpq(3.4)
    .ftype("ladder")
    // effects
    .room(0.57)
    .shape(0.313)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_2_wave_frame (amount: 0.08)
// lfo_1 → compressor_release (amount: -0.74)
// lfo_1 → reverb_dry_wet (amount: -0.375)
// lfo_1 → distortion_mix (amount: 0.58)
// lfo_1 → distortion_drive (amount: 0.05)
// lfo_1 → distortion_filter_cutoff (amount: 0.338)
// lfo_1 → filter_1_resonance (amount: 0.221)
// lfo_1 → filter_2_resonance (amount: 0.229)
// macro_control_1 → modulation_2_amount (amount: 0.178)
// lfo_2 → reverb_dry_wet (amount: -0.535)
`
  },
  "horror_of_melbourne_1": {
    name: "Horror of Melbourne 1",
    pack: "Level 8",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c2 e2 g2 b2")
    .s("horror_of_melbourne_1_osc1")
    .gain(0.469)
    // envelope
    .attack(0.34)
    .release(0.512)
    // filter
    .lpf(1350)
    .lpq(20.0)
    // effects
    .room(0.445)
    .phaser(3.0)
    .phaserdepth(0.0)
    .compressor("-10:20:10:.002:.02"),
  note("c3 e3 g3 b3")
    .s("horror_of_melbourne_1_osc2")
    .gain(0.01)
    // envelope
    .attack(0.34)
    .release(0.512)
    // filter
    .lpf(1350)
    .lpq(20.0)
    // effects
    .room(0.445)
    .phaser(3.0)
    .phaserdepth(0.0)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// macro_control_4 → modulation_10_amount (amount: 0.5)
// macro_control_4 → modulation_7_amount (amount: 0.051)
`
  },
  "smokers_lounge": {
    name: "Smoker's Lounge",
    pack: "Level 8",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("eb3 g3 bb3 d4")
    .s("smokers_lounge_osc1")
    .begin(0.396)
    .unison(7)
    .detune(3.622)
    .gain(0.532)
    // envelope
    .attack(0.149)
    .release(0.976)
    // filter
    .lpf(46)
    .lpq(2.9)
    .lpenv(4.8)
    .lpdecay(1.0)
    .lpsustain(0)
    // pitch
    .penv(32.5)
    .pattack(0.149)
    .pdecay(0.358)
    .prelease(0.548)
    .pcurve(1)
    // effects
    .room(0.345)
    .compressor("-10:20:10:.002:.02"),
  note("g3 b3 d4 gb4")
    .s("smokers_lounge_osc2")
    .begin(0.506)
    .unison(7)
    .detune(3.122)
    .gain(0.483)
    // envelope
    .attack(0.149)
    .release(0.976)
    // filter
    .lpf(46)
    .lpq(2.9)
    .lpenv(4.8)
    .lpdecay(1.0)
    .lpsustain(0)
    // effects
    .room(0.345)
    .compressor("-10:20:10:.002:.02"),
  note("bb3 d4 f4 a4")
    .s("smokers_lounge_osc3")
    .begin(0.227)
    .unison(8)
    .detune(2.372)
    .gain(0.508)
    // envelope
    .attack(0.149)
    .release(0.976)
    // filter
    .lpf(46)
    .lpq(2.9)
    .lpenv(4.8)
    .lpdecay(1.0)
    .lpsustain(0)
    // effects
    .room(0.345)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_wave_frame (amount: 0.106)
// lfo_1 → filter_fx_cutoff (amount: 0.914)
// lfo_2 → distortion_filter_cutoff (amount: 0.435)
`
  },
  "cursed_steps": {
    name: "Cursed Steps",
    pack: "Mr Bill",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("cursed_steps_osc1")
    .unison(3)
    .detune(4.222)
    .gain(0.45)
    // envelope
    .attack(0.149)
    .vib(8.0)
    .vibmod(24.0)
    .tremolosync(4.0)
    .tremolodepth(0.89)
    // effects
    .room(0.515)
    .distort(1.12)
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("cursed_steps_osc2")
    .unison(3)
    .detune(5.75)
    .gain(0.738)
    // envelope
    .attack(0.149)
    .tremolosync(4.0)
    .tremolodepth(0.46)
    // effects
    .room(0.515)
    .distort(1.12)
    .compressor("-10:20:10:.002:.02"),
  note("c1 e1 g1 b1")
    .s("cursed_steps_osc3")
    .begin(0.468)
    .unison(3)
    .detune(3.372)
    .gain(0.31)
    // envelope
    .attack(0.149)
    // filter
    .lpf(394)
    .lpq(9.9)
    .ftype("24db")
    // effects
    .room(0.515)
    .distort(1.12)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_spectral_morph_amount (amount: 0.54)
// lfo_2 → filter_fx_cutoff (amount: 0.846)
// lfo_2 → eq_low_cutoff (amount: 0.699)
// macro_control_1 → filter_fx_cutoff (amount: 0.459)
// random_1 → macro_control_2 (amount: 0.93)
// random_2 → macro_control_3 (amount: 0.475)
// macro_control_4 → compressor_attack (amount: 1.0)
// macro_control_4 → compressor_release (amount: 0.99)
// lfo_2 → distortion_filter_cutoff (amount: 0.507)
`
  },
  "e4_one_note_metallophone": {
    name: "E4 One Note Metallophone",
    pack: "Mr Bill",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("e4_one_note_metallophone_osc1")
    .gain(0.444)
    // envelope
    .attack(0.149)
    .release(0.904)
    // filter
    .hpf(587),
  note("g4 b4 d5 gb5")
    .s("e4_one_note_metallophone_osc2")
    .gain(0.01)
    // envelope
    .attack(0.149)
    .release(0.904)
    // filter
    .hpf(587)
    .vib(2.67)
    .vibmod(24.0),
  note("g4 b4 d5 gb5")
    .s("e4_one_note_metallophone_osc3")
    .gain(0.377)
    // envelope
    .attack(0.149)
    .release(0.904)
    // filter
    .hpf(587)
)
`
  },
  "float_chords": {
    name: "Float Chords",
    pack: "Mr Bill",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("g4 b4 d5 gb5")
    .s("float_chords_osc1")
    .unison(5)
    .detune(3.522)
    .gain(0.203)
    // envelope
    .attack(0.708)
    .release(1.285)
    // filter
    .lpf(224)
    .tremolosync(8.0)
    // effects
    .room(0.385)
    .roomsize(0.73)
    .compressor("-10:20:10:.002:.02"),
  note("c2 e2 g2 b2")
    .s("float_chords_osc2")
    .begin(0.166)
    .unison(5)
    .detune(2.622)
    .gain(0.685)
    // envelope
    .attack(0.708)
    .release(1.285)
    // filter
    .lpf(224)
    .tremolosync(8.0)
    // effects
    .room(0.385)
    .roomsize(0.73)
    .compressor("-10:20:10:.002:.02"),
  note("c2 e2 g2 b2")
    .s("float_chords_osc3")
    .begin(0.484)
    .gain(0.107)
    // envelope
    .attack(0.708)
    .release(1.285)
    // filter
    .lpf(224)
    .tremolosync(8.0)
    .tremolodepth(0.98)
    // effects
    .room(0.385)
    .roomsize(0.73)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_2 → osc_2_wave_frame (amount: 0.627)
// lfo_1 → filter_fx_cutoff (amount: 0.594)
// macro_control_3 → lfo_2_stereo (amount: 0.5)
`
  },
  "honk_wub": {
    name: "Honk Wub",
    pack: "Mr Bill",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c2 e2 g2 b2")
    .s("honk_wub_osc1")
    .begin(0.135)
    .gain(0.67)
    // envelope
    .release(0.405)
    // filter
    .lpf(4658)
    .lpq(20.0)
    .ftype("ladder")
    .tremolosync(1.33)
    // effects
    .delay(0.18)
    .delaytime(0.75)
    .delayfeedback(0.26),
  note("c2 e2 g2 b2")
    .s("honk_wub_osc2")
    .gain(0.318)
    // envelope
    .release(0.405)
    .tremolosync(1.33)
    .tremolodepth(0.89)
    // effects
    .delay(0.18)
    .delaytime(0.75)
    .delayfeedback(0.26),
  note("e4 ab4 b4 eb5")
    .s("honk_wub_osc3")
    .begin(0.38)
    .gain(0.67)
    // envelope
    .release(0.405)
    // filter
    .lpf(1144)
    .lpq(0.5)
    .tremolosync(1.33)
    // effects
    .delay(0.18)
    .delaytime(0.75)
    .delayfeedback(0.26)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_wave_frame (amount: 0.378)
// lfo_2 → eq_low_cutoff (amount: 0.607)
// lfo_2 → eq_high_cutoff (amount: 0.441)
// lfo_3 → filter_1_blend_transpose (amount: 0.415)
// lfo_1 → osc_3_wave_frame (amount: 0.86)
// lfo_2 → filter_1_formant_y (amount: 0.99)
// lfo_5 → filter_1_formant_x (amount: 0.54)
// lfo_5 → filter_1_formant_spread (amount: -0.57)
// lfo_2 → filter_fx_cutoff (amount: 0.22)
// env_5 → filter_fx_cutoff (amount: 0.49)
// lfo_2 → distortion_drive (amount: 0.985)
// lfo_2 → compressor_band_gain (amount: 0.18)
// macro_control_2 → filter_fx_cutoff (amount: 0.563)
// macro_control_4 → filter_1_formant_y (amount: 0.72)
// macro_control_4 → filter_2_resonance (amount: 0.77)
// macro_control_4 → filter_fx_resonance (amount: 0.31)
// macro_control_4 → eq_low_resonance (amount: 0.289)
// macro_control_4 → eq_high_resonance (amount: 0.275)
`
  },
  "lorn_style_lead": {
    name: "LORN Style Lead",
    pack: "Mr Bill",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c1 e1 g1 b1")
  .s("lorn_style_lead_osc1")
  .begin(0.286)
  .gain(0.584)
  // envelope
  .attack(0.149)
  // filter
  .lpf(7912)
  .lpq(13.5)
  .ftype("ladder")
  .vib(2.67)
  .vibmod(24.0)
  .tremolosync(0.01)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → compressor_high_gain (amount: 0.25)
// lfo_2 → eq_high_cutoff (amount: 0.716)
// lfo_2 → compressor_mix (amount: 0.965)
// lfo_1 → filter_fx_formant_transpose (amount: 0.858)
// lfo_2 → eq_low_cutoff (amount: 0.116)
// lfo_3 → lfo_2_tempo (amount: 0.333)
// lfo_3 → lfo_2_frequency (amount: 0.9)
`
  },
  "real_squarepusher_hours": {
    name: "Real Squarepusher Hours",
    pack: "Mr Bill",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("real_squarepusher_hours_osc1")
    .unison(3)
    .detune(1.022)
    .gain(0.362)
    // envelope
    .attack(0.149)
    .release(0.179)
    .vib(2.67)
    .vibmod(24.0)
    // effects
    .room(0.59)
    .shape(0.523),
  note("c6 e6 g6 b6")
    .s("real_squarepusher_hours_osc2")
    .gain(0.728)
    // envelope
    .attack(0.149)
    .release(0.179)
    .vib(4.0)
    .vibmod(24.0)
    .tremolosync(5.33)
    .tremolodepth(0.4)
    // effects
    .room(0.59)
    .shape(0.523),
  note("c2 e2 g2 b2")
    .s("real_squarepusher_hours_osc3")
    .unison(3)
    .detune(1.822)
    .gain(0.551)
    // envelope
    .attack(0.149)
    .release(0.179)
    // filter
    .lpf(1069)
    .lpq(5.5)
    .vib(16.0)
    .vibmod(24.0)
    // effects
    .room(0.59)
    .shape(0.523)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_4 → osc_1_wave_frame (amount: 0.724)
// lfo_5 → osc_1_transpose (amount: 0.5)
`
  },
  "remedial_shikari": {
    name: "Remedial Shikari",
    pack: "Mr Bill",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("remedial_shikari_osc1")
    .begin(0.079)
    .gain(0.106)
    // envelope
    .attack(0.149)
    .release(0.548)
    .tremolosync(0.67)
    .tremolodepth(0.96)
    // effects
    .delay(0.373)
    .delaytime(0.125)
    .shape(0.583),
  note("c2 e2 g2 b2")
    .s("remedial_shikari_osc2")
    .begin(0.198)
    .gain(0.106)
    // envelope
    .attack(0.149)
    .release(0.548)
    .vib(5.33)
    .vibmod(24.0)
    .tremolosync(0.67)
    // effects
    .delay(0.373)
    .delaytime(0.125)
    .shape(0.583)
)

// === Unmapped modulations (Vital-specific) ===
// random_1 → osc_1_spectral_morph_amount (amount: -0.3)
// random_1 → osc_1_distortion_amount (amount: 0.505)
// lfo_1 → osc_1_unison_voices (amount: 1.0)
`
  },
  "super_nice_pluck": {
    name: "Super Nice Pluck",
    pack: "Mr Bill",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("a2 db3 e3 ab3")
  .s("super_nice_pluck_osc2")
  .begin(0.354)
  .unison(13)
  .detune(2.722)
  .gain(0.223)
  // envelope
  .decay(0.765)
  .sustain(0.005)
  .release(0.919)
  // effects
  .shape(0.713)

// === Unmapped modulations (Vital-specific) ===
// random_1 → osc_1_wave_frame (amount: 0.62)
// random_1 → osc_1_spectral_morph_amount (amount: 0.14)
// random_1 → osc_1_distortion_amount (amount: 0.5)
// macro_control_1 → env_1_decay (amount: 0.153)
// macro_control_1 → env_1_release (amount: 0.304)
// macro_control_1 → env_1_sustain (amount: 0.395)
`
  },
  "dispersed_grit": {
    name: "Dispersed Grit",
    pack: "Navi Retlav Studio",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c3 e3 g3 b3")
    .s("dispersed_grit_osc1")
    .gain(0.579)
    // envelope
    .attack(0.25)
    .decay(0.523)
    .sustain(0.765)
    .release(0.25)
    // effects
    .shape(0.663),
  note("c2 e2 g2 b2")
    .s("dispersed_grit_osc2")
    .gain(0.858)
    // envelope
    .attack(0.25)
    .decay(0.523)
    .sustain(0.765)
    .release(0.25)
    // effects
    .shape(0.663),
  note("c2 e2 g2 b2")
    .s("dispersed_grit_osc3")
    .gain(0.01)
    // envelope
    .attack(0.25)
    .decay(0.523)
    .sustain(0.765)
    .release(0.25)
    // effects
    .shape(0.663)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_spectral_morph_amount (amount: 0.585)
// lfo_1 → osc_2_spectral_morph_amount (amount: -0.77)
// macro_control_3 → lfo_1_stereo (amount: 0.5)
`
  },
  "drowning_machine": {
    name: "Drowning Machine",
    pack: "Navi Retlav Studio",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("drowning_machine_osc1")
    .unison(3)
    .detune(1.872)
    .gain(0.58)
    // envelope
    .decay(0.774)
    .sustain(0.9)
    .release(1.297)
    // filter
    .bpf(1243)
    .bpq(10.7)
    // effects
    .shape(0.413)
    .compressor("-10:20:10:.002:.02"),
  note("c3 e3 g3 b3")
    .s("drowning_machine_osc2")
    .begin(0.107)
    .unison(3)
    .detune(2.05)
    .gain(0.58)
    // envelope
    .decay(0.774)
    .sustain(0.9)
    .release(1.297)
    // filter
    .bpf(1243)
    .bpq(10.7)
    // effects
    .shape(0.413)
    .compressor("-10:20:10:.002:.02"),
  note("c2 e2 g2 b2")
    .s("drowning_machine_osc3")
    .gain(0.58)
    // envelope
    .decay(0.774)
    .sustain(0.9)
    .release(1.297)
    // filter
    .bpf(1243)
    .bpq(10.7)
    // effects
    .shape(0.413)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// env_1 → compressor_high_gain (amount: 0.283)
// macro_control_1 → env_1_attack (amount: 0.865)
// macro_control_2 → modulation_8_amount (amount: -0.1)
// macro_control_2 → modulation_9_amount (amount: 0.135)
// macro_control_2 → modulation_10_amount (amount: 0.095)
// macro_control_1 → env_2_attack (amount: 0.367)
// macro_control_2 → reverb_delay (amount: 0.08)
`
  },
  "phaser_man": {
    name: "Phaser Man",
    pack: "Navi Retlav Studio",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c2 e2 g2 b2")
  .s("phaser_man_osc1")
  .gain(0.929)
  // envelope
  .attack(0.071)
  .release(0.238)
  // filter
  .hpf(504)
  .tremolosync(2.67)
  // effects
  .shape(0.633)
  .compressor("-10:20:10:.002:.02")

// === Unmapped modulations (Vital-specific) ===
// lfo_2 → osc_1_distortion_phase (amount: 1.0)
// lfo_3 → osc_1_distortion_amount (amount: -0.58)
// lfo_5 → filter_fx_cutoff (amount: -0.49)
// lfo_5 → phaser_center (amount: -0.32)
// lfo_1 → osc_2_spectral_morph_amount (amount: -0.895)
// lfo_5 → osc_2_spectral_morph_amount (amount: 0.405)
// lfo_4 → osc_2_spectral_morph_amount (amount: 0.685)
// macro_control_2 → filter_1_blend (amount: -0.48)
// macro_control_2 → modulation_22_amount (amount: 0.313)
// macro_control_2 → modulation_24_amount (amount: 0.16)
`
  },
  "physical_tension": {
    name: "Physical Tension",
    pack: "Navi Retlav Studio",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c4 e4 g4 b4")
  .s("physical_tension_osc1")
  .gain(0.01)
  // envelope
  .decay(0.274)
  .sustain(0.0)
  // filter
  .lpf(54)
  .lpq(10.5)
  // effects
  .compressor("-10:20:10:.002:.02")

// === Unmapped modulations (Vital-specific) ===
// macro_control_1 → chorus_delay_2 (amount: -0.99)
// macro_control_1 → chorus_delay_1 (amount: -1.0)
// macro_control_2 → modulation_1_amount (amount: 0.25)
// env_2 → chorus_mod_depth (amount: 0.01)
`
  },
  "skew_resandal": {
    name: "Skew Resandal",
    pack: "Navi Retlav Studio",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c2 e2 g2 b2")
  .s("skew_resandal_osc1")
  .gain(0.618)
  // envelope
  .attack(0.149)
  // filter
  .lpf(20)
  .lpq(4.5)
  .lpenv(8.0)
  .lpsustain(0.0)
  .lprelease(0.655)
  // effects
  .shape(0.333)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_wave_frame (amount: 1.0)
// lfo_2 → osc_1_distortion_amount (amount: -1.0)
// macro_control_3 → modulation_6_amount (amount: 0.5)
`
  },
  "super_pluck": {
    name: "Super Pluck",
    pack: "Navi Retlav Studio",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c4 e4 g4 b4")
  .s("super_pluck_osc1")
  .unison(7)
  .detune(4.422)
  .gain(0.541)
  // envelope
  .sustain(0.005)
  .release(0.666)
  // pitch
  .penv(-33.4)
  .prelease(0.666)
  // effects
  .shape(0.743)
  .compressor("-10:20:10:.002:.02")

// === Unmapped modulations (Vital-specific) ===
// macro_control_1 → env_1_decay (amount: 0.53)
// macro_control_2 → modulation_2_amount (amount: 0.5)
// macro_control_2 → modulation_3_amount (amount: 0.5)
// macro_control_2 → modulation_9_amount (amount: 0.312)
// macro_control_2 → modulation_11_amount (amount: 0.312)
// env_3 → chorus_delay_1 (amount: -0.58)
// env_3 → chorus_delay_2 (amount: -0.86)
// env_4 → chorus_cutoff (amount: 0.555)
// macro_control_1 → env_1_release (amount: 0.365)
`
  },
  "a_happy_ending_of_the_world": {
    name: "A happy ending of the world",
    pack: "Unsystematic Fragmentation",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("a_happy_ending_of_the_world_osc1")
    .begin(0.627)
    .unison(3)
    .gain(0.914)
    // envelope
    .attack(0.958)
    .sustain(0.55)
    .release(1.13)
    // filter
    .bpf(261)
    .bpq(20.0)
    .tremolosync(1.0)
    // effects
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("a_happy_ending_of_the_world_osc2")
    .begin(0.858)
    .unison(4)
    .gain(0.914)
    // envelope
    .attack(0.958)
    .sustain(0.55)
    .release(1.13)
    // filter
    .bpf(261)
    .bpq(20.0)
    .tremolosync(1.0)
    .tremolodepth(0.88)
    // effects
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("a_happy_ending_of_the_world_osc3")
    .gain(0.759)
    // envelope
    .attack(0.958)
    .sustain(0.55)
    .release(1.13)
    // filter
    .bpf(261)
    .bpq(20.0)
    // effects
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_spectral_morph_amount (amount: 0.77)
// lfo_1 → osc_2_spectral_morph_amount (amount: 0.71)
// lfo_1 → chorus_mod_depth (amount: 0.645)
// lfo_2 → chorus_delay_1 (amount: 0.5)
// random_1 → lfo_3_frequency (amount: 0.33)
// lfo_2 → chorus_delay_2 (amount: -0.244)
// lfo_1 → eq_band_cutoff (amount: -0.069)
`
  },
  "chorusy_keys": {
    name: "Chorusy Keys",
    pack: "Unsystematic Fragmentation",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("chorusy_keys_osc1")
    .unison(16)
    .detune(2.1)
    .spread(1.0)
    .gain(0.683)
    // envelope
    .attack(0.149)
    .decay(0.643)
    .sustain(0.295)
    // filter
    .hpf(373)
    .hpq(2.1)
    .vib(0.67)
    .vibmod(24.0)
    // effects
    .shape(0.333)
    .compressor("-10:20:10:.002:.02"),
  note("c3 e3 g3 b3")
    .s("chorusy_keys_osc2")
    .begin(0.627)
    .unison(8)
    .detune(2.222)
    .spread(1.0)
    .gain(0.477)
    // envelope
    .attack(0.149)
    .decay(0.643)
    .sustain(0.295)
    // effects
    .shape(0.333)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_wave_frame (amount: 0.52)
// lfo_1 → osc_2_spectral_morph_amount (amount: 0.43)
// env_2 → chorus_feedback (amount: 0.36)
// macro_control_2 → filter_2_blend (amount: -0.6)
// macro_control_2 → filter_1_blend (amount: 0.5)
// env_3 → filter_fx_cutoff (amount: 0.59)
`
  },
  "fun_pulse": {
    name: "Fun Pulse",
    pack: "Unsystematic Fragmentation",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c4 e4 g4 b4")
  .s("fun_pulse_osc1")
  .unison(5)
  .gain(0.648)
  // envelope
  .attack(0.149)
  // filter
  .lpf(616)
  // effects
  .compressor("-10:20:10:.002:.02")

// === Unmapped modulations (Vital-specific) ===
// random_1 → osc_1_transpose (amount: 0.5)
// lfo_1 → osc_1_wave_frame (amount: 0.927)
// random_1 → filter_2_cutoff (amount: 0.334)
// random_1 → filter_fx_cutoff (amount: 0.094)
`
  },
  "moving_harmonics": {
    name: "Moving Harmonics",
    pack: "Unsystematic Fragmentation",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("moving_harmonics_osc1")
    .unison(3)
    .gain(0.593)
    // envelope
    .attack(0.149)
    .decay(0.929)
    .release(0.321),
  note("c4 e4 g4 b4")
    .s("moving_harmonics_osc2")
    .begin(0.01)
    .gain(0.839)
    // envelope
    .attack(0.149)
    .decay(0.929)
    .release(0.321)
    // filter
    .hpf(455)
    .ftype("ladder"),
  note("c5 e5 g5 b5")
    .s("moving_harmonics_osc3")
    .unison(6)
    .detune(3.2)
    .gain(0.411)
    // envelope
    .attack(0.149)
    .decay(0.929)
    .release(0.321)
    // filter
    .hpf(455)
    .ftype("ladder")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_spectral_morph_amount (amount: 1.0)
// env_2 → filter_fx_cutoff (amount: 0.62)
// env_1 → modulation_9_amount (amount: 0.235)
`
  },
  "phaser_entropy": {
    name: "Phaser Entropy ",
    pack: "Unsystematic Fragmentation",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c2 e2 g2 b2")
  .s("phaser_entropy_osc1")
  .unison(7)
  .spread(1.0)
  .gain(0.733)
  // envelope
  .attack(0.149)
  // filter
  .lpf(4030)
  .lpq(13.4)
  .tremolosync(2.67)
  .tremolodepth(0.84)
  // effects
  .compressor("-10:20:10:.002:.02")

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_wave_frame (amount: 0.71)
// macro_control_1 → filter_fx_cutoff (amount: 0.619)
// lfo_1 → eq_low_cutoff (amount: 0.49)
// lfo_1 → eq_band_cutoff (amount: -0.433)
// lfo_2 → filter_1_resonance (amount: -0.86)
// lfo_2 → filter_2_resonance (amount: -0.57)
// lfo_2 → osc_1_wave_frame (amount: 1.0)
// lfo_2 → filter_fx_cutoff (amount: 0.41)
// lfo_2 → filter_fx_resonance (amount: 0.551)
// lfo_2 → phaser_center (amount: -0.46)
// lfo_2 → phaser_mod_depth (amount: -0.66)
// lfo_2 → phaser_phase_offset (amount: -0.422)
// lfo_2 → phaser_blend (amount: -1.0)
// lfo_2 → phaser_feedback (amount: 0.28)
// lfo_2 → filter_fx_blend (amount: 1.0)
// macro_control_1 → filter_2_blend (amount: -0.51)
// lfo_4 → filter_fx_cutoff (amount: -0.231)
// lfo_4 → phaser_center (amount: -0.545)
// lfo_4 → osc_1_spectral_morph_amount (amount: 0.05)
// macro_control_1 → phaser_center (amount: 0.4)
// macro_control_1 → phaser_phase_offset (amount: 0.52)
`
  },
  "corrupted_boot": {
    name: "corrupted_...+=boot-_",
    pack: "Unsystematic Fragmentation",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
note("c2 e2 g2 b2")
  .s("corrupted_boot_osc1")
  .unison(16)
  .detune(3.2)
  .gain(0.6)
  // envelope
  .attack(1.267)
  .sustain(0.745)
  .release(0.856)
  // filter
  .bpf(261)
  .bpq(0.7)
  // effects
  .coarse(1)
  .compressor("-10:20:10:.002:.02")

// === Unmapped modulations (Vital-specific) ===
// lfo_3 → osc_1_wave_frame (amount: 1.0)
// lfo_3 → osc_3_wave_frame (amount: 1.0)
// lfo_3 → osc_2_wave_frame (amount: 1.0)
// random_1 → phaser_center (amount: 0.042)
// random_1 → lfo_1_phase (amount: 1.0)
// lfo_3 → phaser_mod_depth (amount: 0.26)
// env_1 → filter_fx_resonance (amount: 0.332)
`
  },
  "a_night_in_kalyan": {
    name: "A Night in Kalyan",
    pack: "Yuli Yolo",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("a_night_in_kalyan_osc1")
    .gain(0.334)
    // envelope
    .attack(1.089)
    .sustain(0.65)
    .release(1.178)
    // filter
    .lpf(20000)
    // effects
    .room(0.25)
    .compressor("-10:20:10:.002:.02"),
  note("c1 e1 g1 b1")
    .s("a_night_in_kalyan_osc2")
    .begin(0.829)
    .gain(0.77)
    // envelope
    .attack(1.089)
    .sustain(0.65)
    .release(1.178)
    // filter
    .bpf(1046)
    .bpq(20.0)
    // effects
    .room(0.25)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_wave_frame (amount: 0.72)
// lfo_2 → osc_1_spectral_morph_amount (amount: 0.056)
// lfo_3 → osc_1_spectral_morph_amount (amount: 0.197)
// lfo_4 → osc_2_wave_frame (amount: -0.875)
// random_1 → lfo_4_smooth_time (amount: -0.36)
// random_2 → lfo_4_frequency (amount: -0.348)
// random_1 → osc_1_level (amount: 0.166)
`
  },
  "abbysun": {
    name: "Abbysun",
    pack: "Yuli Yolo",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("abbysun_osc1")
    .unison(16)
    .detune(3.072)
    .gain(0.01)
    // envelope
    .attack(1.422)
    .sustain(0.975)
    .release(1.558)
    // filter
    .lpf(554)
    .lpq(16.1)
    .ftype("24db")
    .lpenv(3.1)
    .lpattack(1.648)
    .lpsustain(0.305)
    .lprelease(1.677)
    // effects
    .room(0.25)
    .delay(0.323)
    .delaytime(0.125)
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("abbysun_osc2")
    .unison(16)
    .detune(4.472)
    .gain(0.861)
    // envelope
    .attack(1.422)
    .sustain(0.975)
    .release(1.558)
    // filter
    .lpf(24)
    .lpq(0.8)
    .lpenv(3.3)
    .lpattack(1.648)
    .lpsustain(0.305)
    .lprelease(1.677)
    // effects
    .room(0.25)
    .delay(0.323)
    .delaytime(0.125)
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("abbysun_osc3")
    .begin(0.495)
    .unison(3)
    .detune(3.3)
    .spread(1.0)
    .gain(0.861)
    // envelope
    .attack(1.422)
    .sustain(0.975)
    .release(1.558)
    // effects
    .room(0.25)
    .delay(0.323)
    .delaytime(0.125)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// macro_control_4 → reverb_decay_time (amount: 0.164)
// lfo_2 → env_2_sustain (amount: 0.132)
// env_2 → lfo_2_frequency (amount: 0.383)
// macro_control_2 → filter_1_resonance (amount: -0.242)
// macro_control_3 → modulation_21_amount (amount: 0.074)
// macro_control_3 → modulation_23_amount (amount: 0.145)
// macro_control_3 → modulation_30_amount (amount: -0.09)
// macro_control_3 → modulation_31_amount (amount: -0.5)
// env_2 → modulation_34_amount (amount: 0.235)
// lfo_5 → lfo_4_tempo (amount: 0.135)
// lfo_5 → osc_3_spectral_morph_spread (amount: 0.078)
// lfo_5 → lfo_4_smooth_time (amount: -0.694)
// macro_control_3 → modulation_40_amount (amount: 0.357)
// lfo_5 → random_1_tempo (amount: 0.078)
`
  },
  "diy": {
    name: "DIY",
    pack: "Yuli Yolo",
    wavetables: 1,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("diy_osc1")
    .begin(0.868)
    .unison(8)
    .spread(0.0)
    .gain(0.309)
    // envelope
    .attack(0.084)
    .release(0.94)
    // filter
    .lpf(261)
    // effects
    .room(0.485)
    .roomsize(0.595)
    .shape(0.544),
  note("c6 e6 g6 b6")
    .s("diy_osc2")
    .gain(0.01)
    // envelope
    .attack(0.084)
    .release(0.94)
    // filter
    .lpf(261)
    // effects
    .room(0.485)
    .roomsize(0.595)
    .shape(0.544),
  note("c4 e4 g4 b4")
    .s("diy_osc3")
    .gain(0.01)
    // envelope
    .attack(0.084)
    .release(0.94)
    // filter
    .lpf(261)
    // pitch
    .penv(17.3)
    .pattack(0.149)
    .pdecay(0.392)
    .prelease(0.988)
    .pcurve(1)
    // effects
    .room(0.485)
    .roomsize(0.595)
    .shape(0.544)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_wave_frame (amount: -0.84)
// random → osc_1_pan (amount: 0.148)
// random → env_2_delay (amount: -0.064)
// random → env_2_attack (amount: 0.023)
`
  },
  "destruction": {
    name: "Destruction",
    pack: "Yuli Yolo",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c5 e5 g5 b5")
    .s("destruction_osc1")
    .unison(16)
    .detune(4.472)
    .gain(0.547)
    // envelope
    .attack(0.534)
    .release(0.441)
    // filter
    .lpf(636)
    .ftype("ladder")
    .lpenv(1.3)
    .lpattack(0.756)
    .lpdecay(0.905)
    .lpsustain(0.0)
    .lprelease(1.178)
    // pitch
    .penv(-30.0)
    .pattack(0.934)
    .prelease(1.154)
    .tremolosync(5.33)
    .tremolodepth(0.88)
    // effects
    .room(0.05)
    .roomsize(0.75)
    .shape(0.523)
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("destruction_osc2")
    .begin(0.005)
    .gain(0.263)
    // envelope
    .attack(0.534)
    .release(0.441)
    // filter
    .lpf(636)
    .ftype("ladder")
    .lpenv(1.3)
    .lpattack(0.756)
    .lpdecay(0.905)
    .lpsustain(0.0)
    .lprelease(1.178)
    // pitch
    .penv(-30.0)
    .pattack(0.934)
    .prelease(1.154)
    .tremolosync(8.0)
    // effects
    .room(0.05)
    .roomsize(0.75)
    .shape(0.523)
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("destruction_osc3")
    .gain(0.482)
    // envelope
    .attack(0.534)
    .release(0.441)
    // pitch
    .penv(-30.0)
    .pattack(0.934)
    .prelease(1.154)
    .tremolosync(5.33)
    .tremolodepth(0.39)
    // effects
    .room(0.05)
    .roomsize(0.75)
    .shape(0.523)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// env_4 → modulation_4_amount (amount: 0.171)
// lfo_1 → filter_1_blend (amount: 0.991)
// lfo_2 → filter_2_blend (amount: 1.0)
// lfo_2 → filter_1_cutoff (amount: 0.086)
// lfo_2 → distortion_filter_blend (amount: 1.0)
// lfo_2 → distortion_mix (amount: -0.49)
// lfo_2 → distortion_drive (amount: 0.08)
// lfo_3 → phaser_dry_wet (amount: 0.48)
// lfo_3 → phaser_center (amount: -0.04)
// lfo_3 → delay_feedback (amount: 0.389)
// lfo_3 → delay_dry_wet (amount: 0.79)
// macro_control_2 → lfo_6_frequency (amount: 0.194)
// lfo_3 → filter_2_drive (amount: 0.378)
// lfo_5 → osc_1_transpose (amount: 0.25)
// lfo_5 → osc_2_transpose (amount: 0.25)
// lfo_5 → osc_3_transpose (amount: 0.25)
// lfo_7 → osc_2_level (amount: -1.0)
// lfo_8 → filter_fx_cutoff (amount: -0.178)
// lfo_7 → modulation_43_amount (amount: 0.305)
// lfo_7 → modulation_44_amount (amount: 0.34)
// lfo_7 → modulation_45_amount (amount: 0.541)
// lfo_7 → modulation_49_amount (amount: 0.113)
// env_5 → compressor_band_gain (amount: 0.089)
// lfo_4 → filter_fx_blend (amount: 0.72)
// env_3 → filter_1_resonance (amount: 0.719)
// lfo_7 → env_3_sustain (amount: 1.0)
`
  },
  "easy_mallet": {
    name: "Easy Mallet",
    pack: "Yuli Yolo",
    wavetables: 0,
    code: `// Pattern — change the notes to taste!
stack(
  note("c5 e5 g5 b5")
    .s("easy_mallet_osc1")
    .unison(3)
    .spread(0.0)
    .gain(0.01)
    // envelope
    .attack(0.397)
    .sustain(0.755)
    .release(0.904)
    // effects
    .room(0.45)
    .roomsize(0.91)
    .shape(0.384),
  note("c4 e4 g4 b4")
    .s("easy_mallet_osc2")
    .gain(0.01)
    // envelope
    .attack(0.397)
    .sustain(0.755)
    .release(0.904)
    // effects
    .room(0.45)
    .roomsize(0.91)
    .shape(0.384)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_2 → modulation_9_amount (amount: 0.5)
// lfo_2 → modulation_13_amount (amount: 0.078)
`
  },
  "jupiter_bass": {
    name: "Jupiter Bass",
    pack: "Yuli Yolo",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c5 e5 g5 b5")
    .s("jupiter_bass_osc2")
    .gain(0.289)
    // envelope
    .attack(0.4)
    .release(0.643)
    // filter
    .bpf(858)
    .bpq(14.3)
    // effects
    .room(0.118)
    .shape(0.333),
  note("c4 e4 g4 b4")
    .s("jupiter_bass_osc3")
    .begin(0.84)
    .gain(0.435)
    // envelope
    .attack(0.4)
    .release(0.643)
    // filter
    .bpf(858)
    .bpq(14.3)
    // effects
    .room(0.118)
    .shape(0.333)
)

// === Unmapped modulations (Vital-specific) ===
// env_2 → filter_1_resonance (amount: 0.112)
// macro_control_1 → modulation_3_amount (amount: 0.125)
// macro_control_1 → modulation_18_amount (amount: 0.125)
`
  },
  "keystation": {
    name: "Keystation",
    pack: "Yuli Yolo",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("keystation_osc1")
    .unison(3)
    .detune(2.363)
    .spread(0.0)
    .gain(0.163)
    // envelope
    .attack(0.347)
    .release(1.379)
    // filter
    .lpf(261)
    .lpq(1.2)
    .ftype("24db")
    // effects
    .room(0.25),
  note("c3 e3 g3 b3")
    .s("keystation_osc2")
    .gain(0.112)
    // envelope
    .attack(0.347)
    .release(1.379)
    // filter
    .lpf(261)
    .lpq(0.8)
    // effects
    .room(0.25),
  note("c4 e4 g4 b4")
    .s("keystation_osc3")
    .unison(12)
    .detune(3.422)
    .gain(0.01)
    // envelope
    .attack(0.347)
    .release(1.379)
    // filter
    .lpf(261)
    .lpq(0.8)
    // effects
    .room(0.25)
)

// === Unmapped modulations (Vital-specific) ===
// random → osc_3_detune_range (amount: 0.002)
// lfo_1 → osc_3_distortion_amount (amount: 0.47)
// lfo_5 → modulation_34_amount (amount: 0.184)
// random_1 → osc_1_pan (amount: 0.078)
`
  },
  "metal_head": {
    name: "Metal Head",
    pack: "Yuli Yolo",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("metal_head_osc1")
    .unison(12)
    .detune(5.822)
    .spread(0.98)
    .gain(0.01)
    // envelope
    .attack(0.345)
    .release(1.321)
    // filter
    .lpf(261)
    // effects
    .room(0.42)
    .roomsize(0.0)
    .delay(0.161)
    .delaytime(0.25)
    .delayfeedback(0.57)
    .shape(0.562)
    .compressor("-10:20:10:.002:.02"),
  note("c5 e5 g5 b5")
    .s("metal_head_osc2")
    .unison(16)
    .detune(10.0)
    .gain(0.012)
    // envelope
    .attack(0.345)
    .release(1.321)
    // filter
    .lpf(261)
    // effects
    .room(0.42)
    .roomsize(0.0)
    .delay(0.161)
    .delaytime(0.25)
    .delayfeedback(0.57)
    .shape(0.562)
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("metal_head_osc3")
    .unison(8)
    .detune(10.0)
    .spread(0.675)
    .gain(0.015)
    // envelope
    .attack(0.345)
    .release(1.321)
    // effects
    .room(0.42)
    .roomsize(0.0)
    .delay(0.161)
    .delaytime(0.25)
    .delayfeedback(0.57)
    .shape(0.562)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_wave_frame (amount: 0.438)
`
  },
  "salomon": {
    name: "Salomon",
    pack: "Yuli Yolo",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c5 e5 g5 b5")
    .s("salomon_osc1")
    .begin(0.244)
    .unison(16)
    .detune(2.25)
    .spread(0.0)
    // envelope
    .attack(0.934)
    .sustain(0.735)
    .release(1.166)
    // filter
    .lpf(1569)
    .lpq(17.1)
    .vib(0.01)
    .vibmod(24.0)
    .tremolosync(6.0)
    .tremolodepth(0.02)
    // effects
    .room(0.38)
    .delay(0.093)
    .delaytime(0.125)
    .shape(0.393),
  note("c4 e4 g4 b4")
    .s("salomon_osc2")
    .unison(8)
    .detune(3.122)
    .spread(0.31)
    .gain(0.4)
    // envelope
    .attack(0.934)
    .sustain(0.735)
    .release(1.166)
    // filter
    .lpf(1569)
    .lpq(17.1)
    // pitch
    .penv(6.6)
    .pdecay(0.203)
    .prelease(1.059)
    // effects
    .room(0.38)
    .delay(0.093)
    .delaytime(0.125)
    .shape(0.393),
  note("c2 e2 g2 b2")
    .s("salomon_osc3")
    .gain(0.34)
    // envelope
    .attack(0.934)
    .sustain(0.735)
    .release(1.166)
    // filter
    .lpf(1569)
    .lpq(17.1)
    // pitch
    .penv(60.0)
    .pdecay(0.203)
    .prelease(1.059)
    .pcurve(1)
    .vib(4.0)
    .vibmod(24.0)
    .tremolosync(0.01)
    .tremolodepth(0.31)
    // effects
    .room(0.38)
    .delay(0.093)
    .delaytime(0.125)
    .shape(0.393)
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_wave_frame (amount: 0.348)
// random_1 → osc_1_spectral_morph_amount (amount: 0.49)
// random_1 → modulation_4_amount (amount: 0.242)
// random_1 → modulation_2_amount (amount: 0.252)
// random → osc_1_pan (amount: 0.29)
// random_1 → osc_1_pan (amount: 0.21)
// lfo_4 → osc_2_distortion_amount (amount: 0.14)
// lfo_5 → osc_2_spectral_morph_amount (amount: 0.035)
// lfo_6 → sample_level (amount: 0.15)
// lfo_5 → osc_2_stereo_spread (amount: 0.53)
// lfo_2 → osc_2_pan (amount: 0.29)
// lfo_4 → osc_2_wave_frame (amount: 1.0)
// lfo_6 → osc_2_wave_frame (amount: 0.23)
`
  },
  "synthetic_quartet": {
    name: "Synthetic Quartet",
    pack: "Yuli Yolo",
    wavetables: 3,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("synthetic_quartet_osc1")
    .begin(0.017)
    .gain(0.774)
    // envelope
    .attack(1.006)
    .sustain(0.61)
    .release(0.678)
    // filter
    .hpf(479)
    .hpq(0.5)
    .ftype("ladder")
    // effects
    .room(0.5)
    .roomsize(1.0)
    .delay(0.198)
    .delaytime(0.125)
    .distort(1.12)
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("synthetic_quartet_osc2")
    .begin(0.498)
    .gain(0.495)
    // envelope
    .attack(1.006)
    .sustain(0.61)
    .release(0.678)
    // filter
    .hpf(479)
    .hpq(0.5)
    .ftype("ladder")
    // effects
    .room(0.5)
    .roomsize(1.0)
    .delay(0.198)
    .delaytime(0.125)
    .distort(1.12)
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("synthetic_quartet_osc3")
    .gain(0.631)
    // envelope
    .attack(1.006)
    .sustain(0.61)
    .release(0.678)
    // filter
    .lpf(1909)
    .lpq(1.0)
    // effects
    .room(0.5)
    .roomsize(1.0)
    .delay(0.198)
    .delaytime(0.125)
    .distort(1.12)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// env_3 → modulation_1_amount (amount: 0.18)
// env_3 → modulation_3_amount (amount: 0.18)
// macro_control_4 → reverb_decay_time (amount: 0.144)
// env_3 → lfo_2_frequency (amount: 0.038)
// env_3 → modulation_8_amount (amount: 0.164)
// lfo_2 → modulation_14_amount (amount: 0.377)
// lfo_2 → modulation_17_amount (amount: 0.195)
`
  },
  "big_stomp": {
    name: "Big Stomp",
    pack: "inktome",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("big_stomp_osc1")
    .unison(3)
    .spread(0.64)
    .gain(0.581)
    // envelope
    .attack(0.149)
    .release(0.548)
    // filter
    .bpf(679)
    .lpenv(-1.3)
    .lpsustain(0.0)
    .lprelease(0.548)
    // pitch
    .penv(30.0)
    .pdecay(0.845)
    .prelease(0.548)
    .pcurve(1)
    .tremolosync(4.0)
    .tremolodepth(0.3)
    // effects
    .shape(0.513)
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("big_stomp_osc2")
    .gain(0.547)
    // envelope
    .attack(0.149)
    .release(0.548)
    // pitch
    .penv(30.0)
    .pdecay(0.845)
    .prelease(0.548)
    .pcurve(1)
    // effects
    .shape(0.513)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// env_3 → filter_1_blend_transpose (amount: 0.6)
// env_4 → osc_1_unison_detune (amount: 0.99)
// macro_control_1 → env_2_decay (amount: 0.135)
// macro_control_3 → filter_1_resonance (amount: 0.68)
`
  },
  "digital_roller": {
    name: "Digital roller",
    pack: "inktome",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("c4 e4 g4 b4")
    .s("digital_roller_osc1")
    .gain(0.471)
    // envelope
    .attack(0.149)
    .release(0.548)
    .vib(2.0)
    .vibmod(6.0)
    // effects
    .shape(0.813)
    .compressor("-10:20:10:.002:.02"),
  note("c4 e4 g4 b4")
    .s("digital_roller_osc2")
    .gain(0.533)
    // envelope
    .attack(0.149)
    .release(0.548)
    .vib(2.0)
    .vibmod(24.0)
    // effects
    .shape(0.813)
    .compressor("-10:20:10:.002:.02"),
  note("c6 e6 g6 b6")
    .s("digital_roller_osc3")
    .gain(0.01)
    // envelope
    .attack(0.149)
    .release(0.548)
    // effects
    .shape(0.813)
    .compressor("-10:20:10:.002:.02")
)

// === Unmapped modulations (Vital-specific) ===
// lfo_1 → osc_1_wave_frame (amount: 1.0)
// lfo_2 → filter_fx_blend_transpose (amount: 0.75)
// lfo_1 → distortion_filter_cutoff (amount: 0.668)
// lfo_1 → osc_3_spectral_morph_amount (amount: 0.49)
`
  },
  "piano_from_the_yard_sale": {
    name: "Piano from the yard sale",
    pack: "inktome",
    wavetables: 2,
    code: `// Pattern — change the notes to taste!
stack(
  note("d4 gb4 a4 db5")
    .s("piano_from_the_yard_sale_osc1")
    .unison(2)
    .detune(10.0)
    .spread(1.0)
    .gain(0.593)
    // envelope
    .sustain(0.0)
    .release(1.011)
    // filter
    .lpf(263)
    .lpq(4.6)
    .ftype("ladder")
    // pitch
    .penv(-48.6)
    .pdecay(0.881)
    .prelease(0.548),
  note("c4 e4 g4 b4")
    .s("piano_from_the_yard_sale_osc2")
    .unison(16)
    .detune(10.0)
    .spread(0.865)
    .gain(0.01)
    // envelope
    .sustain(0.0)
    .release(1.011),
  note("c4 e4 g4 b4")
    .s("piano_from_the_yard_sale_osc3")
    .gain(0.593)
    // envelope
    .sustain(0.0)
    .release(1.011)
)

// === Unmapped modulations (Vital-specific) ===
// env_2 → osc_1_frame_spread (amount: 0.26)
// env_2 → osc_1_transpose (amount: 0.5)
// env_3 → filter_2_blend_transpose (amount: 0.065)
// env_3 → filter_2_blend (amount: 0.118)
// random → env_4_delay (amount: 0.245)
// macro_control_3 → eq_low_gain (amount: 0.175)
// macro_control_3 → modulation_14_amount (amount: 0.376)
// macro_control_3 → filter_1_resonance (amount: 0.363)
`
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
  "Level 8": ["complex_electro_1", "crescendo_bells", "damped_horn", "fm_mode", "horror_of_melbourne_1", "smokers_lounge"],
  "Mr Bill": ["cursed_steps", "e4_one_note_metallophone", "float_chords", "honk_wub", "lorn_style_lead", "real_squarepusher_hours", "remedial_shikari", "super_nice_pluck"],
  "Navi Retlav Studio": ["dispersed_grit", "drowning_machine", "phaser_man", "physical_tension", "skew_resandal", "super_pluck"],
  "Unsystematic Fragmentation": ["a_happy_ending_of_the_world", "chorusy_keys", "fun_pulse", "moving_harmonics", "phaser_entropy", "corrupted_boot"],
  "Yuli Yolo": ["a_night_in_kalyan", "abbysun", "diy", "destruction", "easy_mallet", "jupiter_bass", "keystation", "metal_head", "salomon", "synthetic_quartet"],
  "inktome": ["big_stomp", "digital_roller", "piano_from_the_yard_sale"],
};