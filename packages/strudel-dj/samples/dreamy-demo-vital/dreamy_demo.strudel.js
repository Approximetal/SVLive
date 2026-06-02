// Dreamy Demo — GitHub sample-pack version
// BPM: 112 | 42 cycles | grid: 16/bar
let cpm = 28.0;

// Load pre-rendered Vital samples from GitHub.
// Direct raw URL matches the common strudel.cc sample-pack pattern and avoids cached github: resolution.
await samples('https://raw.githubusercontent.com/Approximetal/SVLive/09dcd89c3db46dd08aa067bc1425316574f532ef/packages/strudel-dj/samples/dreamy-demo-vital/strudel.json')

let KEY = 'vital_keystation';
let PAD = 'vital_flute_1';
let HORN = 'vital_damped_horn';
let PLUCK = 'vital_pluck_sad';
let MARIMBA = 'vital_lead_3';

// ═══ Accompaniment: 26 + 16 = 42 cycles ═══

let track_arp_accompaniment_a = note(`<
  [g2 a3 b3 fs4 ~ a3 b3 fs4]*2
  [a2 g3 c4 g4 ~ g3 c4 g4]*2
>`).s(KEY)
  .release(0.8)
  .slow(2)
  .gain(perlin.range(0.38, 0.84).slow(12))
  .lpf(sine.range(1600, 4200).slow(12))
  .room(sine.range(0.35, 0.75).slow(8))
  .delay(".35:.1:.55")
  .lpenv(0.5);

let track_arp_accompaniment_b = note(`<
[[a2,g2,c3,e3] [g3,b3] ~@14] [[c3,g3] [b3,e4] ~@14]
[[b2,e3,a3,d4] ~@15] [[a2,d3,g3,c4] ~@15]
[[b2,d3,a3,g2] ~@15] [[g2,d3,g3,c4] ~@15]
[g2 ~ d3 ~ a3 ~ [fs4,b3] ~@3 b3 ~ d4 ~@3] [g2 ~ d3 ~ a3 ~ [b3,fs4] ~@3 a3 ~ d4 ~@3]
[[g2,c3,e3,g3] b3 ~@14] [[c3,g3,b3,e4] ~@15]
[[b2,e3,a3] d4 ~@14] [a2 [d3,g3] c4 ~@13]
~ ~ [[g2,b2,d3,a3] ~@15] [a2 [g3,d3,c4] ~@14]
>`)
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

let track_melody1 = note(`<~ ~ [[fs6,a5] ~@15] ~ [[g6,b5] ~@15] ~ [[a4,a5] ~@15] ~ [[d4,d5] ~@15] ~>`)
  .s(HORN)
  .release(4)
  .gain(0.95);

// ═══ Melody 2: 16 cycles ═══

let track_melody2_chords = note(`<
[[d5,fs5,b4] ~@5 [e5,g5,b4] ~@5 [b4,d5,fs5] ~@3] [[g4,a4,d5,b4] ~@5 [a4,e4,c5] ~@5 [b3,d4,g4] ~@3]
[[e5,c5] ~ [d5,a4] ~@3 [a4,fs4] ~ [g4,e4] ~@7] [~@12 [e5,b4] ~ [a4,d5] ~]
[~@4 [b4,g4] ~ [d5,a4] ~@5 [c5,a4] ~ [d4,g4,b4] ~] [~@4 [a4,e4] ~ [d4,b4,g4] ~@5 [g4,c5] ~ [a4,d5] ~]
~ ~
[[g5,b5] ~@5 [g5,a5,e5] ~@5 [g5,d5,b5] ~@3] [[e5,b5] ~@5 [d5,a5] ~@5 [b4,g5,e5] ~@3]
[[a4,b5,e5] ~ [b4,d5,a5] ~@3 [b4,g4] ~ [d5,a4] ~@7] [~@12 [b4,e5] ~ [a4,d5] ~]
[~@4 [g4,b4] ~ [a4,d5] ~@5 [a4,c5] ~ [g4,b4,d4] ~] [~@4 [a4,e4] ~ [g4,b4] ~@5 [e4,a4] ~ [d5,b3] ~]
~ ~
>`)
  .s(MARIMBA)
  .release(1.6)
  .gain(1.2)
  .room(0.18);

let track_melody2_lead = note(`<
d5 ~@5 e5 ~@5 fs5 ~@3 b4 ~@5 c5 ~@5 g4 ~@3
e5 ~ d5 ~@3 a4 ~ g4 ~@7 ~@12 e5 ~ d5 ~
~@4 b4 ~ d5 ~@5 c5 ~ b4 ~ ~@4 a4 ~ b4 ~@5 c5 ~ d5 ~
~ ~
b5 ~@5 a5 ~@5 b5 ~@3 b5 ~@5 a5 ~@5 g5 ~@3
e5 ~ a5 ~@3 g4 ~ a4 ~@7 ~@12 e5 ~ d5 ~
~@4 b4 ~ d5 ~@5 c5 ~ b4 ~ ~@4 a4 ~ b4 ~@5 a4 ~ d5 ~
~ ~
>`)
  .s(HORN)
  .release(3.2)
  .gain(0.52)
  .delay(0.08)
  .room(0.22);

let track_melody2_echo = note(`<
~ ~ ~ ~ ~ ~ ~ ~
[~@2 b5 ~@3 a5 ~@3 g5 ~@5] [~@2 e5 ~@3 d5 ~@3 b4 ~@5]
[~@2 a5 ~ b5 ~@3 a5 ~ g5 ~@5] [~@2 e5 ~ fs5 ~@3 d5 ~ b4 ~@5]
[~@4 g5 ~ e5 ~@5 c5 ~ b4 ~] [~@4 a4 ~ b4 ~@5 e5 ~ d5 ~]
~ ~
>`)
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

let track_melody3_lead = note(`<
[[b4,g4] ~@5 c5 ~@5 d5 ~@3] [~ [c5,e5] ~@5 b5 ~@5 a5 ~@3]
[d4 [b4,d5] ~@4 fs5 ~@5 a5 ~@3] [[e4,g4,g5] ~@5 c5 ~@5 b4 ~@3]
[[d4,a3,a4] ~@6 b4 ~@4 c5 ~@3] [[c4,g4] d5 ~@4 e5 ~@5 fs5 ~@3]
[[b4,d4] ~@15] ~
[[g4,d4,b4] ~@5 c5 ~@5 d5 ~@3] [[e5,b4,e4] ~@5 b5 ~@5 a5 ~@3]
[[a4,fs4] [d5,d4] ~@4 a5 ~@5 fs5 ~@3] [~@2 c4 g4 [c5,g5] ~@11]
[[a4,e4,c4] ~@5 [b4,fs4] [d4,b3] ~@5 [c5,c4,g4,a4] ~@2] [fs3 [fs4,b3] ~@5 e4 ~@6 d4 ~]
[~@2 [d3,g3,b3] g4 ~@12] ~
>`).s(HORN).transpose(12)
  .release(3.6)
  .gain("<1.72 1.78 1.84 1.9>/8")
  .room(0.24)
  .early(0.03);

let track_melody3_pad = note(`<
[[g4,b4,d5] ~@15] [[c5,e5,g5] ~@15] [[d4,fs4,a4,d5] ~@15] [[e4,g4,b4,e5] ~@15]
[[a3,c4,e4,a4] ~@15] [[c4,e4,g4,c5] ~@15] [[g3,b3,d4,g4] ~@15] ~
[[g4,b4,d5,g5] ~@15] [[e4,g4,b4,e5] ~@15] [[d4,fs4,a4,d5] ~@15] [[c4,e4,g4,c5] ~@15]
[[a3,c4,e4,a4] ~@15] [[d4,fs4,a4,d5] ~@15] [[g3,b3,d4,g4] ~@15] ~
>`)
  .transpose(-12)
  .s(PAD)
  .release(4.5)
  .gain("<0.18 0.22 0.28 0.36>/8")
  .room(0.48)
  .delay(0.12)
  .lpf("<1800 2200 2800 3600>/8");

let track_melody3_sparkle = note(`<
~ ~ ~ ~ [~@8 e6 ~ g6 ~] [~@8 d6 ~ fs6 ~] ~ ~
[~@6 g6 ~ b6 ~@6] [~@6 e6 ~ a6 ~@6]
[~@4 fs6 ~ a6 ~@5 d7 ~] [~@4 e6 ~ g6 ~@5 c7 ~]
[~@4 e6 ~ fs6 ~@5 a6 ~] [~@4 d6 ~ e6 ~@5 fs6 ~]
[~@2 g6 ~ b6 ~ d7 ~@8] ~
>`)
  .s(PLUCK)
  .release(1.1)
  .gain("<0.18 0.22 0.28 0.34>/8")
  .room(0.42)
  .delay(0.28);

let track_melody3_low = note(`<
[g2 ~@15] [a2 ~@15] [d2 ~@15] [e2 ~@15]
[a2 ~@15] [c2 ~@15] [g2 ~@15] ~
[g2 ~@15] [e2 ~@15] [d2 ~@15] [c2 ~@15]
[a2 ~@15] [d2 ~@15] [g2 ~@15] ~
>`)
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
  [2, note(`<[g2 d3 a3 [b3,fs4] ~ b3 d4 ~] [g2 d3 a3 [fs4,b3] ~ a3 d4 ~]>`)
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
  .cpm(cpm);
