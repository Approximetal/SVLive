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
  // CATEGORY: Dub & Ambient
  // ============================================================
  {
    id: "melting_submarine",
    name: "Melting Submarine",
    category: "Dub & Ambient",
    bpm: 100,
    key: "A minor",
    description: "Underwater dub: detuned saws with perlin pitch wobble, slow-attack chords, echoWith triangles, degradeBy randomness",
    code: `// "Melting submarine"
// @by Felix Roos

samples('github:tidalcycles/dirt-samples')
stack(
  s("bd:5,[~ <sd:1!3 sd:1(3,4,3)>],hh27(3,4,1)")
  .speed(perlin.range(.7,.9))
  ,"<a1 b1*2 a1(3,8) e2>"
  .off(1/8,x=>x.add(12).degradeBy(.5))
  .add(perlin.range(0,.5))
  .superimpose(add(.05))
  .note()
  .decay(.15).sustain(0)
  .s('sawtooth')
  .gain(.4)
  .cutoff(sine.slow(7).range(300,5000))
  .lpa(.1).lpenv(-2)
  ,chord("<Am7!3 <Em7 E7b13 Em7 Ebm7b5>>")
  .dict('lefthand').voicing()
  .add(note("0,.04"))
  .add(note(perlin.range(0,.5)))
  .s('sawtooth')
  .gain(.16)
  .cutoff(500)
  .attack(1)
  ,"a4 c5 <e6 a6>".struct("x(5,8,-1)")
  .superimpose(x=>x.add(.04))
  .add(perlin.range(0,.5))
  .note()
  .decay(.1).sustain(0)
  .s('triangle')
  .degradeBy(perlin.range(0,.5))
  .echoWith(4,.125,(x,n)=>x.gain(.15*1/(n+1)))
)
  .slow(3/2)`,
  },
  {
    id: "belldub",
    name: "Belldub",
    category: "Dub & Ambient",
    bpm: 80,
    key: "G dorian",
    description: "Deep dub: shaped bass with resonance, room-drenched toms, delay-soaked chords, degraded blips, random bell melodies",
    code: `// "Belldub"
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
    id: "jux_und_tollerei",
    name: "Jux und Tollerei",
    category: "Dub & Ambient",
    bpm: 120,
    key: "C minor",
    description: "Stereo palindrome synth: jux reversal, layered triangle harmonics, sweeping LPF, dub delay with feedback",
    code: `// "Jux und tollerei"
// @by Felix Roos

note("c3 eb3 g3 bb3").palindrome()
.s('sawtooth')
.jux(x=>x.rev().color('green').s('sawtooth'))
.off(1/4, x=>x.add(note("<7 12>/2")).slow(2).late(.005).s('triangle'))
.lpf(sine.range(200,2000).slow(8))
.lpa(.2).lpenv(-2)
.decay(.05).sustain(0)
.room(.6)
.delay(.5).delaytime(.1).delayfeedback(.4)`,
  },
  {
    id: "waa2",
    name: "Waa2",
    category: "Dub & Ambient",
    bpm: 100,
    key: "A minor",
    description: "Evolving synth washes: layered note offsets, sine-modulated clip length, cosine cutoff sweep, filter envelope wobble",
    code: `// "Waa2"
// @by Felix Roos

note(
  "a4 [a3 c3] a3 c3"
  .sub("<7 12 5 12>".slow(2))
  .off(1/4,x=>x.add(7))
  .off(1/8,x=>x.add(12))
)
  .slow(2)
  .clip(sine.range(0.3, 2).slow(28))
  .s("sawtooth square".fast(2))
  .cutoff(cosine.range(500,4000).slow(16))
  .gain(.5)
  .room(.5)
  .lpa(.125).lpenv(-2)`,
  },

  // ============================================================
  // CATEGORY: Rave & Techno
  // ============================================================
  {
    id: "caverave",
    name: "Caverave",
    category: "Rave & Techno",
    bpm: 130,
    key: "C minor",
    description: "Dark rave: layered synth arpeggios with delay, acid bass with cutoff, jazz voicings with delaytime automation",
    code: `// "Caverave"
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
).slow(2)`,
  },
  {
    id: "flatrave",
    name: "Flatrave",
    category: "Rave & Techno",
    bpm: 138,
    key: "G minor",
    description: "TR909 rave: acid bass with 4-pole filter, resonant square lead with sine cutoff sweep, room reverb, degraded bleeps",
    code: `// "Flatrave"
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
    id: "acidic_tooth",
    name: "Acidic Tooth",
    category: "Rave & Techno",
    bpm: 120,
    key: "G minor",
    description: "Acid techno: 24dB resonant filter with sine/cosine modulation, shape distortion, bandpass superimpose, sidechain gain",
    code: `// "Acidic Tooth" @by eddyflux
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
  .gain("[.2 1@3]*2")
  ,
  stack(
    s("bd*2").mask("<0@4 1@16>"),
    s("hh*8").gain(saw.mul(saw.fast(2))).clip(sine)
    .mask("<0@8 1@16>")
  ).bank('RolandTR909')
)`,
  },

  // ============================================================
  // CATEGORY: Breakbeat & Jungle
  // ============================================================
  {
    id: "amensister",
    name: "Amensister",
    category: "Breakbeat & Jungle",
    bpm: 140,
    key: "G minor",
    description: "Chopped amen with ply/speed glitch, generative saw bass with perlin cutoff, detuned delay chords, shaped breath textures",
    code: `// "Amensister"
// @by Felix Roos

samples('github:tidalcycles/dirt-samples')

stack(
  n("0 1 2 3 4 5 6 7")
  .sometimes(x=>x.ply(2))
  .rarely(x=>x.speed("2 | -2"))
  .sometimesBy(.4, x=>x.delay(".5"))
  .s("amencutup")
  .slow(2)
  .room(.5)
  ,
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
  note("Bb3,D4".superimpose(x=>x.add(.2)))
  .s('sawtooth').lpf(1000).struct("<~@3 [~ x]>")
  .decay(.05).sustain(.0).delay(.8).delaytime(.125).room(.8)
  ,
  s("breath").room(1).shape(.6).chop(16).rev().mask("<x ~@7>")
  ,
  n("0 1").s("east").delay(.5).degradeBy(.8).speed(rand.range(.5,1.5))
).reset("<x@7 x(5,8,-1)>")`,
  },
  {
    id: "dinofunk",
    name: "Dinofunk",
    category: "Breakbeat & Jungle",
    bpm: 120,
    key: "Ab minor",
    description: "Funky breakbeat: looped bass sample, pentatonic saw lead with perlin decay and sine delay, room-soaked dino hits",
    code: `// "Dinofunk"
// @by Felix Roos

setcps(1)

samples({bass:'https://cdn.freesound.org/previews/614/614637_2434927-hq.mp3',
dino:{b4:'https://cdn.freesound.org/previews/316/316403_5123851-hq.mp3'}})
setVoicingRange('lefthand', ['c3','a4'])

stack(
s('bass').loopAt(8).clip(1),
s("bd*2, ~ sd,hh*4"),
chord("Abm7")
  .mode("below:G4")
  .dict('lefthand')
  .voicing()
  .struct("x(3,8,1)".slow(2)),
"0 1 2 3".scale('ab4 minor pentatonic')
.superimpose(x=>x.add(.1))
.sometimes(x=>x.add(12))
.note().s('sawtooth')
.cutoff(sine.range(400,2000).slow(16)).gain(.8)
.decay(perlin.range(.05,.2)).sustain(0)
.delay(sine.range(0,.5).slow(32))
.degradeBy(.4).room(1),
note("<b4 eb4>").s('dino').delay(.8).slow(8).room(.5)
)`,
  },

  // ============================================================
  // CATEGORY: Funk & Groove
  // ============================================================
  {
    id: "underground_plumber",
    name: "Underground Plumber",
    category: "Funk & Groove",
    bpm: 110,
    key: "C minor",
    description: "Funky bass: echo with transposition layers, iter chord inversions, echoWith octave cascades — inspired by Friendship (1979)",
    code: `// "Underground plumber"
// @by Felix Roos
// inspired by Friendship - Let's not talk about it (1979) :)

samples({ bd: 'bd/BT0A0D0.wav', sn: 'sn/ST0T0S3.wav', hh: 'hh/000_hh3closedhh.wav', cp: 'cp/HANDCLP0.wav',
}, 'https://loophole-letters.vercel.app/samples/tidal/')

const h = x=>x.transpose("<0@2 5 0 7 5 0 -5>/2")

stack(
  s("<<bd*2 bd> sn> hh").fast(2).gain(.7),
  "[c2 a1 bb1 ~] ~"
  .echo(2, 1/16, 1)
  .slow(2)
  .note().s('square')
  .layer(h)
  .clip(.4)
  .cutoff(400).decay(.12).sustain(0)
  ,
  "[g2,[c3 eb3]]".iter(4)
  .echoWith(4, 1/8, (x,n)=>x.transpose(n*12).gain(Math.pow(.4,n)))
  .note().layer(h)
  .clip(.1)
)
  .fast(2/3)`,
  },
  {
    id: "blippy_rhodes",
    name: "Blippy Rhodes",
    category: "Funk & Groove",
    bpm: 120,
    key: "C major",
    description: "Rhodes keys with room reverb and dotted delay, filtered sawtooth bass with envelope, modal scale changes",
    code: `// "Blippy Rhodes"
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
).fast(3/2)`,
  },
  {
    id: "sample_demo",
    name: "Sample Demo (Hirajoshi)",
    category: "Funk & Groove",
    bpm: 110,
    key: "D hirajoshi",
    description: "World groove: clavisynth melody with delay + jux(rev) stereo, degradeBy sine modulation, reverbed plucked bass",
    code: `// "Sample demo"
// @by Felix Roos

stack(
  s("[woodblock:1 woodblock:2*2] snare_rim:0,gong/8,brakedrum:1(3,8),~@3 cowbell:3")
  .sometimes(x=>x.speed(2)),
  note("<0 4 1 3 2>".off(".25 | .125",add(2)).scale('D3 hirajoshi'))
  .s("clavisynth").gain(.2).delay(.25).jux(rev)
  .degradeBy(sine.range(0,.5).slow(32)),
  note("<0@3 <2(3,8) 3(3,8)>>".scale('D1 hirajoshi'))
  .s('psaltery_pluck').gain(.6).clip(1)
  .release(.1).room(.5)
)`,
  },
  {
    id: "bass_fuge",
    name: "Bass Fuge",
    category: "Funk & Groove",
    bpm: 120,
    key: "A minor",
    description: "Layered bass guitar: echo cascades with octave offsets, sine-automated cutoff with resonance, stacked drums",
    code: `// "Bass fuge"
// @by Felix Roos

samples({ flbass: ['00_c2_finger_long_neck.wav','01_c2_finger_short_neck.wav','02_c2_finger_long_bridge.wav','03_c2_finger_short_bridge.wav','04_c2_pick_long.wav','05_c2_pick_short.wav','06_c2_palm_mute.wav'] },
  'github:cleary/samples-flbass/main/')
samples({
bd: ['bd/BT0AADA.wav','bd/BT0AAD0.wav','bd/BT0A0DA.wav','bd/BT0A0D3.wav','bd/BT0A0D0.wav','bd/BT0A0A7.wav'],
sd: ['sd/rytm-01-classic.wav','sd/rytm-00-hard.wav'],
hh: ['hh27/000_hh27closedhh.wav','hh/000_hh3closedhh.wav'],
}, 'github:tidalcycles/dirt-samples');

setcps(1)

"<8(3,8) <7 7*2> [4 5@3] 8>".sub(1)
.layer(
x=>x,
x=>x.add(7)
.off(1/8,x=>x.add("2,4").off(1/8,x=>x.add(5).echo(4,.125,.5)))
.slow(2),
).n().scale('A1 minor')
.s("flbass").n(0)
.mul(gain(.3))
.cutoff(sine.slow(7).range(200,4000))
.resonance(10)
.clip(1)
.stack(s("bd:1*2,~ sd:0,[~ hh:0]*2"))`,
  },

  // ============================================================
  // CATEGORY: Full Tracks (Neo-Soul / House)
  // ============================================================
  {
    id: "coastline",
    name: "Coastline",
    category: "Full Tracks",
    bpm: 90,
    key: "Bb minor",
    description: "Neo-soul: phaser epiano, FM synth lead with sine-modulated frequency, shape distortion, perlin gain, delay",
    code: `// "coastline" @by eddyflux
samples('github:eddyflux/crate')
setcps(.75)
let chords = chord("<Bbm9 Fm9>/4").dict('ireal')
stack(
  stack(
    s("bd").struct("<[x*<1 2> [~@3 x]] x>"),
    s("~ [rim, sd:<2 3>]").room("<0 .2>"),
    n("[0 <1 3>]*<2!3 4>").s("hh"),
    s("rd:<1!3 2>*2").mask("<0 0 1 1>/16").gain(.5)
  ).bank('crate')
  .mask("<[0 1] 1 1 1>/16".early(.5))
  ,
  chords.offset(-1).voicing().s("gm_epiano1:1")
  .phaser(4).room(.5)
  ,
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
).late("[0 .01]*4").late("[0 .01]*2").size(4)`,
  },
  {
    id: "arpoon",
    name: "Arpoon",
    category: "Full Tracks",
    bpm: 90,
    key: "A minor",
    description: "Jazz-house: arpeggiated piano with perlin detuning + cutoff, resonance, panning sine, delay, filtered saw bass, TR909",
    code: `// "Arpoon"
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

  // ============================================================
  // CATEGORY: Delay & Space
  // ============================================================
  {
    id: "random_bells",
    name: "Random Bells",
    category: "Delay & Space",
    bpm: 70,
    key: "D minor pentatonic",
    description: "Generative bells: random pentatonic notes with echo + long delay feedback, euclidean bass, spacious reverb",
    code: `// "Random bells"
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
  .slow(6)`,
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
];
