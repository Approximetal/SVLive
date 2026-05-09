# Introduction to Strudel

**Strudel** is an open-source live-coding music environment that runs entirely in your web browser. It brings the powerful **TidalCycles** pattern language (normally used with Haskell/SuperCollider) into a JavaScript/Browser context[[1]](https://strudel.cc/learn/strudel-vs-tidal/#:~:text=Strudel%20is%20written%20in%20JavaScript%2C,Tidal%20is%20written%20in%20Haskell)[[2]](https://strudel.cc/learn/strudel-vs-tidal/#:~:text=Tidal%20is%20commonly%20paired%20with,runs%20entirely%20in%20the%20browser). This means you can write Tidal-style patterns in a browser REPL (no installation needed) and hear music instantly. Strudel’s syntax is essentially JavaScript, but it closely mirrors Tidal’s concepts of **mini-notation**, **cycles**, and pattern transformations. You write code like note("c a f e").s("piano") and Strudel immediately turns it into sound in the browser.

**How to get started:** Visit the official **Strudel REPL** (e.g. at **strudel.cc**) and click “Start” or “Play” to activate audio. (Web Audio often needs a user gesture to start.) You’ll see a code editor where you can type patterns. For example, try:

s("bd sd bd sd, hh*8").bank("RolandTR909")

This will play a simple beat (bass drum and snare, with hi-hats) using a TR-909 drum kit. The REPL highlights the currently playing step in your code and offers tabs for **“sounds”** (listing available samples/synths) and **“visuals”** (like oscilloscopes, if you use functions like ._scope() on a pattern).

**Sound output:** By default Strudel uses the Web Audio API with built-in synths and a library of drum samples, so you get sound out-of-the-box[[2]](https://strudel.cc/learn/strudel-vs-tidal/#:~:text=Tidal%20is%20commonly%20paired%20with,runs%20entirely%20in%20the%20browser). (It can also send patterns to external sound engines like SuperDirt, but we’ll focus on the browser audio.) When you first press play, the browser may ask permission to use audio; once granted, you’re ready to live-code music with Strudel.

**Relation to TidalCycles:** If you’ve seen Tidal code, Strudel will feel familiar – but with **JavaScript syntax**. For example, Tidal uses the # and $ operators and Haskell function chaining; in Strudel you’ll use dot-chaining and explicit function calls. A Tidal pattern like:

d1 $ n "0 1 3" # s "triangle" # crush 4  
    |+| n "10 20"

would be written in Strudel as:

n("0 1 3")  
  .every(3, add.squeeze("10 20"))   // apply the add after every 3 cycles  
  .iter(4)                          // repeat pattern 4 times in one cycle  
  .s("triangle").crush(4)

Strudel can do *almost* everything Tidal can, and even some extra things (like visualizations and browser-based interactions). But it’s important to remember it’s JavaScript: no custom infix operators (#, |+|, etc.) – instead you have equivalent functions (e.g. add, mul, fast, etc.) or chainable methods[[3]](https://strudel.cc/learn/strudel-vs-tidal/#:~:text=This%20difference%20is%20most%20obvious,when%20looking%20at%20the%20syntax)[[4]](https://strudel.cc/learn/strudel-vs-tidal/#:~:text=The%20custom%20operators%20of%20tidal,are%20normal%20functions%20in%20strudel). Once you get used to chaining, you can write very concise pattern code in Strudel, just like Tidal (we’ll see many examples below).

---

# Core Concepts & Building Blocks

Strudel’s power comes from combining **patterns** with functions that transform them in time and value. Let’s go through the core building blocks:

## Patterns and Sounds (s, n, note, etc.)

In Strudel, **patterns** are the basic unit of musical structure. A pattern is an abstract timeline of events (notes, drum hits, parameter changes, etc.). There are a few ways to create patterns:

* **Sound pattern (s( ) or sound( )):** Triggers samples or synths. For example, s("bd hh sd hh") plays a sequence: bass drum, hi-hat, snare, hi-hat[[5]](https://strudel.cc/learn/sounds/#:~:text=We%20can%20play%20sounds%20with,in%20two%20different%20ways). By default s will look up a sample by name (like "bd" for bass drum). If you use a waveform name ("sine", "square", etc.), it will play a synth tone instead[[6]](https://strudel.cc/learn/sounds/#:~:text=s%28). (Under the hood, s("...") is equivalent to sound("...") – s is just a convenient alias.)

* **Note pattern (note( ) / n( )):** Specifies pitches (or sample indices) without immediately triggering a specific instrument. For example, note("c4 e4 g4") defines a pattern of three pitched notes (C, E, G). By itself this makes no sound until you pair it with a synth via .s("instrument")[[7]](https://strudel.cc/learn/sounds/#:~:text=Combining%20notes%20and%20sounds). On the other hand, n("0 1 2 3") typically is used for *sample selection* or scale degrees. For sample patterns, you can do s("bd:0 bd:1 bd:2") or equivalently n("0 1 2").s("bd") – the n() supplies indices, and the s() picks the sample name to apply those indices[[8]](https://strudel.cc/workshop/first-sounds/#:~:text=selecting%20sample%20numbers%20separately). For pitched patterns with scales, n() can specify scale degrees (see **Tonal Functions** later).

* **Stacked patterns (stack( )):** If you want multiple layers to play simultaneously, you can use stack(pattern1, pattern2, ...). This is akin to Tidal’s stack or using commas at top level. For example,

stack(  
  s("bd*2 sd*2"),    // layer 1: kick and snare  
  s("hh*8")          // layer 2: hi-hat eight-notes  
)

will play the two patterns in parallel (kicks+snares and hi-hats). You can stack as many layers as needed – it’s common to define each instrument as a constant and then stack them.

* **Mini-notation strings:** The "..." strings inside s() or n() use Tidal’s **mini-notation** for rhythmic patterns. This allows complex sequences in a compact form. Key mini-notation elements include:

* **Spaces** separate events in sequence. E.g. "bd hh sd hh" is a four-step sequence (bass, hat, snare, hat)[[9]](https://strudel.cc/workshop/first-sounds/#:~:text=sound%28%22bd%20hh%20,bd%20hh%20rim).

* **~ or -** represents a rest (no sound)[[9]](https://strudel.cc/workshop/first-sounds/#:~:text=sound%28%22bd%20hh%20,bd%20hh%20rim). E.g. "bd ~ bd ~" would play a kick on first and third beats, resting on second and fourth.

* **Brackets [ ]** create a **subsequence** that fits in the time of one step. For example, "bd [hh hh] sd [hh bd]" – here [hh hh] means two hi-hat hits in the span of one beat (doubling the speed for that step)[[10]](https://strudel.cc/workshop/first-sounds/#:~:text=Sub). You can nest brackets for sub-subsequences, etc., to create intricate rhythms[[11]](https://strudel.cc/workshop/first-sounds/#:~:text=Pitch%20%3D%20really%20fast%20rhythm).

* **Angle brackets < >** create **cycles of alternatives** (or “choices per cycle”). If you put a sequence in < >, each item in it will take up one cycle in turn[[12]](https://strudel.cc/workshop/first-sounds/#:~:text=sound%28,bd%20hh%20bd). For instance, s("<bd sd>") means play bd this cycle, sd next cycle, alternating. You can also use < ... >*N to speed it back up. A common trick: use < ... > to list variants of a pattern so you can extend a phrase without altering tempo. For example, s("<bd sd bd sd [bd sd]>/2") would cycle through two bar variations at constant tempo (the /2 makes the sequence span 2 cycles). In short, < > decouples pattern length from cycle length (it “doesn’t change tempo when you add/remove elements” by design[[13]](https://strudel.cc/workshop/first-sounds/#:~:text=Here%2C%20the%20%60,whole%20thing%208%20times%20faster)).

* **Multiplication * and Division /** after a pattern (or subpattern) speed it up or slow it down. E.g. "hh*8" means play the pattern "hh" 8 times as fast (8 events per cycle instead of 1)[[14]](https://strudel.cc/workshop/first-sounds/#:~:text=Because%20this%20is%20now%20very,it%20up%20again%20like%20this). If you apply * to a bracketed group, it affects just that subpattern. Division like /2 stretches a pattern to twice the length (half speed). You can even use fractional multipliers (e.g. *1.5).

* **Bang !** repeats an event a certain number of times *within one cycle*. For example "bd!4" is equivalent to "bd bd bd bd" (4 bass drums in the cycle). "hh:4!8" as seen in some code means take sample hh:4 and repeat it 8 times per cycle (8th-note hi-hats).

* **Question mark ?** after an event makes it *probabilistic*. For example "bd?" means the bass drum may or may not play (randomly each cycle). If you see something like "7?" inside a beat pattern, that typically means an event at index 7 is optional (50% chance). We’ll see this in use for ghost hits in drum patterns.

**Discrete vs continuous patterns:** Most patterns we’ve described are sequences of discrete events (drum hits or notes). Strudel also has *continuous* patterns, which are essentially signals that have a value at every moment in time (useful for modulation). We’ll cover those (like rand, sine, etc.) in the **Modulation** section.

**Time and Tempo:** Strudel does not have a fixed “beats per bar” or time signature; instead everything is measured in **cycles**. By default, **1 cycle = 2 seconds** (0.5 Hz), which often corresponds to one measure of 4/4 at 120 BPM[[15]](https://strudel.cc/understand/cycles/#:~:text=In%20most%20music%20software%2C%20the,5%20CPS). The tempo is set in terms of cycles per second (CPS) or equivalently cycles per minute (CPM). By default Strudel is 30 CPM (which indeed equals 120 BPM if you treat 1 cycle as a 4-beat bar)[[16]](https://strudel.cc/workshop/first-sounds/#:~:text=cpm%20%3D%20cycles%20per%20minute).

* To set a tempo in BPM, you can use setCpm(bpm / bpc), where **bpm** is the beats-per-minute and **bpc** is how many beats you consider one cycle to have[[17]](https://strudel.cc/understand/cycles/#:~:text=,x%20%2F%2060). For example, for 4/4 time one cycle usually has 4 beats, so setCpm(128/4) would give 128 BPM. *Example:* setCpm(150/4) makes the tempo 150 BPM (if 4 beats per cycle). If you prefer, setCps(x) sets cycles-per-second; e.g. setCps(0.5) is 0.5 Hz = 30 CPM.

* You can choose different interpretations of a “beat”. If you set setCpm(90) with no division, you’re saying “treat 1 cycle as one beat at 90 BPM” – which is unusual (that would be a **very slow** cycle). Typically, you’ll divide by 4 for 4/4 music. But for a 3/4 waltz, you might use setCpm(120/3) to have 3 beats per cycle at 120 BPM, etc.[[17]](https://strudel.cc/understand/cycles/#:~:text=,x%20%2F%2060). Essentially, Strudel leaves it to you to decide how many beats fit in a cycle. (Unlike traditional DAWs, Strudel doesn’t enforce a time signature – a cycle is just a unit of time you define.)

* **Cycle length and pattern speed:** If you put more events in a cycle, they play faster; if you put fewer, they play slower. For example, s("bd*4") (4 kicks in the quote) will play those 4 hits spaced evenly in one cycle (which at default 0.5 CPS is 2 seconds long) – effectively 120 BPM for quarter notes[[18]](https://strudel.cc/understand/cycles/#:~:text=Here%20we%20can%20hear%20the,Let%E2%80%99s%20make%20it%204%20kicks). If you only have s("bd") (one kick per cycle), that’s one kick every 2 seconds (60 BPM if you consider that a quarter-note). The relationship is proportional – doubling the pattern density doubles the speed (unless you adjust tempo). You can always explicitly speed up or slow down patterns with functions: e.g. .fast(2) will double a pattern’s speed (two cycles worth of events in one cycle), and .slow(2) will halve it.

* **Bars and time signatures:** Because you control beats-per-cycle, you can represent different time signatures by grouping events. E.g., a 7-beat rhythm can be just 7 events in a cycle: s("bd ~ rim bd bd rim ~") (7 steps)[[19]](https://strudel.cc/understand/cycles/#:~:text=To%20get%20a%20time%20signature%2C,a%20rhythm%20with%207%20beats). If you want to be explicit, you can span patterns across multiple cycles. But often you don’t need to – the mini-notation, with its ability to nest and alternate, makes it easy to express polymetric patterns within the cycle abstraction.

## Orbits, Mixing, and Routing

**Orbits** in Strudel are like separate audio output buses or channels for your patterns[[20]](https://strudel.cc/learn/effects/#:~:text=Orbits). By default, everything plays on orbit 1 (which corresponds to stereo output channels 1&2). You can send a pattern to a different orbit with .orbit(n). This is very handy for mixing: you might put drums on orbit 2, bass on 3, vocals on 4, etc., so you can control their levels and effects sends independently.

* Orbits have their own **delay** and **reverb** sends. If two patterns share an orbit, they also share the same delay/reverb settings (and other orbit-level effects). So if you want two sounds to have different reverb, put them on different orbits. Conversely, if you *want* them to glue together under the same reverb, use the same orbit. By default orbit 1 is used for everything, which is why if you do nothing, all sounds go through the same master reverb/delay.

* You can use multiple orbits creatively. For example, .orbit("2,3,4") on a pattern would duplicate that sound onto orbits 2, 3, and 4 (each being a copy). This can increase volume (since you’re summing multiple outputs), so be cautious – usually if you send one sound to multiple orbits, you’d lower its gain to compensate[[21]](https://strudel.cc/learn/effects/#:~:text=The%20default%20orbit%20is%20,to%20multiple%20orbits%20via%20mininotation).

* The **global mixer** sums all orbits to stereo out by default. In Strudel’s settings, there is an option **“Multi Channel Orbits”** which will route each orbit to its own stereo pair (so orbit 2 -> channels 3&4, orbit 3 -> 5&6, etc.), but that requires using a virtual audio cable or DAW to capture those outputs. For live coding in-browser, most people keep the default stereo mix.

* **Gain and volume:** Each event can have a gain parameter (volume 0 to 1). By default, Strudel’s internal mixing might be quieter than maximum to allow headroom when layering patterns. If you find the output too low or want a different volume curve, you can adjust it. There is a function setDefault('gain', x) to set the default gain for new patterns (the snippet examples set it to 1.0, meaning no default attenuation). There’s also setGainCurve(fn) which defines how the numeric gain is scaled – for example, one example sets setGainCurve(x => Math.pow(x, 2)). Squaring the gain means the mix uses a *quadratic curve*, which makes lower volumes finer-grained (useful to avoid the impression of jumps in loudness when adjusting sliders). If you’re not sure, you can leave these alone, but know they exist if you need to tune the mix. The default curve is typically linear or slightly tweaked for the Web Audio context.

* **Avoiding clipping:** Strudel does not automatically hard-limit the master output, so if you layer many loud sounds, you can clip (distort). To prevent this:

* Keep individual pattern gains moderate (e.g. 0.8 or 0.5).

* Use the duck effect (ducking) for sidechain compression (see below).

* Use a master compressor effect if needed (Strudel has .compressor()).

* Use setGainCurve to make the volume less linear (as mentioned).

* In practice, a combination of sane gain staging and ducking yields a clear mix.

* **Sidechain ducking (duck)**: The duck effect in Strudel is a built-in way to mimic sidechain compression – it lowers the volume of one orbit when a sound plays on another. In code, duckorbit(x) (or just .duck(x)) on a pattern means “whenever this pattern’s events hit, duck orbit X”[[22]](https://strudel.cc/learn/effects/#:~:text=Synonyms%3A%20). For example, if your kick is on orbit 2 and bass on orbit 3, you could do s("bd*4").orbit(2).duck("3") – this will duck orbit 3 (the bass) on each kick hit, creating that pumping effect. You can duck multiple orbits: .duck("3:4:5") would duck orbits 3, 4, and 5 whenever the pattern plays[[23]](https://strudel.cc/learn/effects/#:~:text=%60duckorbit%28). There are parameters .duckattack and .duckdepth to control how fast and how deep the volume ducking is[[24]](https://strudel.cc/learn/effects/#:~:text=duckattack)[[25]](https://strudel.cc/learn/effects/#:~:text=duckdepth). By default the duck effect is pretty fast. In one of our DnB examples, the code s("bd:1*2").duck("3:4:5") on the kick means the bass (orbit 3), vocals (4), and effects (5) all get attenuated on kick hits, which really cleans up the mix and adds groove.

* **Scope and visuals:** If you want to see what a pattern is doing, Strudel offers ._scope() (with an underscore) to attach an oscilloscope to that pattern’s output[[26]](https://strudel.cc/learn/visual-feedback/#:~:text=Renders%20an%20oscilloscope%20for%20the,domain%20of%20the%20audio%20signal). There are also _pianoroll(), _spectrum(), etc., for visual feedback. These are great for understanding complex patterns or for streaming visuals. (The underscore variant draws inline under your code; the non-underscore variant draws in the page background[[27]](https://strudel.cc/learn/visual-feedback/#:~:text=Global%20vs%20Inline%20Visuals).)

## Samples and Synths

Strudel comes with a rich library of sounds. There are two main categories: **sample-based sounds** and **synthesized sounds**.

**Default drum & instrument samples:** Strudel includes a built-in sample map covering common drum machine kits and some instrumental sounds. For drums, it uses the Tidal “tidal-drum-machines” library by default[[28]](https://strudel.cc/learn/samples/#:~:text=For%20drum%20sounds%2C%20strudel%20uses,with%20the%20following%20naming%20convention). You can trigger these by their abbreviations: - bd = bass drum (kick)[[29]](https://strudel.cc/learn/samples/#:~:text=Drum%20Abbreviation%20Bass%20drum%2C%20Kick,oh%20Crash%20cr%20Ride%20rd) - sd = snare drum[[29]](https://strudel.cc/learn/samples/#:~:text=Drum%20Abbreviation%20Bass%20drum%2C%20Kick,oh%20Crash%20cr%20Ride%20rd) - hh = closed hi-hat[[30]](https://strudel.cc/learn/samples/#:~:text=Clap%20cp%20Closed%20hi,tom%20mt%20Low%20tom%20lt) (oh = open hat) - cp = clap - rim = rimshot - lt/mt/ht = low/mid/high tom - cr = crash cymbal, rd = ride cymbal - sh = shaker, cb = cowbell, tb = tambourine, etc. (There’s also perc for generic percussion and misc for miscellaneous sounds)[[31]](https://strudel.cc/learn/samples/#:~:text=Source%20Abbreviation%20Shakers%20,Miscellaneous%20samples%20misc%20Effects%20fx).

For melodic instruments, Strudel integrates a subset of the VCSL sample library[[32]](https://strudel.cc/learn/samples/#:~:text=Miscellaneous%20samples%20misc%20Effects%20fx). This means you have samples for instruments like piano, guitar, etc., accessible by name. For example, s("piano:0") might play a piano sample (the :0 selects the first sample). To see all available sounds, open the **“sounds” tab in the REPL** – it lists categories and sample counts. If you see something like RolandTR909_hh(4), the (4) means 4 variants of that sample. By default s("hh") uses the first one (index 0), but s("hh:3") would use the fourth sample (zero-indexed). You can also pattern the sample indices via the n() function: e.g. s("hh*4").n("0 1 2 3") would cycle through 4 hi-hat samples on each hit[[33]](https://strudel.cc/learn/samples/#:~:text=If%20we%20open%20the%20,starting%20from%200).

**Synths (oscillators):** Instead of playing back samples, Strudel can synthesize tones on the fly. The simplest are basic waveforms: "sine", "triangle", "square", "sawtooth". If you do s("sine") you’ll get a continuous sine wave tone (at whatever pitch the note is set to, or A4 by default)[[6]](https://strudel.cc/learn/sounds/#:~:text=s%28). For example, note("c5 e5 g5").s("square") would play a sequence of square-wave notes. Strudel’s synth engine includes: - Basic waveforms: sine, triangle, square, sawtooth[[34]](https://strudel.cc/learn/synths/#:~:text=Basic%20Waveforms). - Noise: white, pink, brown noise generators for static/noisy sounds[[35]](https://strudel.cc/learn/synths/#:~:text=Noise) (good for hi-hats or effects). You can treat these like samples in s(). - **Supersaw**: Strudel has a special "supersaw" sound, which is that classic detuned multi-saw oscillator (great for big bass or trance leads). It’s essentially 7 detuned saw oscillators under the hood. - **Pulse**: The "pulse" waveform is a pulse wave (similar to square, but often used for PWM sounds). - **Crackle**: A noise-based oscillator for glitchy crackle (with a density param to control how crackly).

In addition, Strudel integrates the **ZZFX** tiny synth (with many tweakable parameters) and also allows loading **wavetables** from samples (prefix a sample name with wt_ to use it as a wavetable). These are advanced techniques – for now, just know Strudel’s synths can cover from basic analog-style sounds to complex textures.

**Selecting sample banks:** Many drum sounds are organized into **banks** (drum machine kits). For instance, the default kit might be 808. To switch, use the .bank() function. Example:

s("bd sd, hh*8").bank("RolandTR909")

This will play the same pattern but using a TR-909 kit for the bd, sd, hh sounds[[36]](https://strudel.cc/learn/samples/#:~:text=s%28). You can pattern the bank name too: .bank("<RolandTR808 RolandTR909>") to alternate kits each cycle[[37]](https://strudel.cc/learn/samples/#:~:text=You%20could%20even%20pattern%20the,switch%20between%20different%20drum%20machines). Behind the scenes, .bank("X") just prefixes the sample name with X_ – so "RolandTR909_bd" is the actual sample. That means the sample must exist in that bank (not every kit has every sound; if a kit is missing a sound, Strudel will failover silently or not play it).

**Bringing your own samples:** One of Strudel’s strengths is you can load samples from any URL or even your local disk. To load custom samples, use the samples() function. There are a few ways: - **Direct mapping:** Provide an object of names to file URLs, plus a base URL. E.g.:

samples({  
  clap: 'samples/clap.wav',  
  vox: ['vox1.mp3', 'vox2.mp3']  
}, 'https://my-server.com/mystuff/');

After running that, you could do s("clap vox:1") and it will fetch those files from the given base URL. (You can map multiple variations by providing an array for a name, as shown with vox above for two variations)[[38]](https://strudel.cc/learn/samples/#:~:text=In%20this%20example%20we%20assign,audio%20files%20on%20a%20server)[[39]](https://strudel.cc/learn/samples/#:~:text=Note%20that%20we%20can%20either,%60user). - **Using a strudel.json:** If you have a lot of samples, you can host a JSON mapping (called strudel.json) on GitHub or elsewhere, then just do samples('https://url/to/strudel.json')[[40]](https://strudel.cc/learn/samples/#:~:text=Loading%20Samples%20from%20a%20strudel,file). For convenience, there’s a **GitHub shortcut**: samples('github:user/repo[/branch]') which will automatically fetch https://raw.githubusercontent.com/user/repo/branch/strudel.json[[41]](https://strudel.cc/learn/samples/#:~:text=Github%20Shortcut). For example, to load the extensive Dirt Samples pack (the one Tidal uses), you can simply:

samples('github:tidalcycles/Dirt-Samples')

This fetches the mapping of all the classic Dirt samples (including amen breaks, etc.). Similarly, the user-provided links in the prompt – algorave-dave/samples and switchangel/pad – likely contain a strudel.json, so you could load them with:

samples('github:algorave-dave/samples');  
samples('github:switchangel/pad');

After loading, any new sounds defined in those packs become available via s("name") just like built-ins. - **Local import:** The REPL has an “Import Sounds Folder” button (under the sounds tab) where you can select a folder from your computer. This is a quick way to use your own samples without a server – it will list them under a user category in the sounds tab[[42]](https://strudel.cc/learn/samples/#:~:text=From%20Disk%20via%20%E2%80%9CImport%20Sounds,Folder%E2%80%9D)[[43]](https://strudel.cc/learn/samples/#:~:text=In%20the%20above%20example%20the,based%20indexing%20in%20alphabetical%20order). (This uses browser APIs to load files; they won’t persist after you close the page, whereas the samples('github:...') approach can be saved in your code.)

One **important tip**: Samples are loaded lazily – i.e. they don’t download until you trigger them the first time[[44]](https://strudel.cc/learn/samples/#:~:text=Note%20that%20only%20the%20sample,be%20fixed%20in%20the%20future). This means the *first* time you play a sample, you might get a delay or even silence for a moment while it fetches. A strategy to mitigate this is to trigger all needed samples briefly (even at volume 0) before a performance to preload them. The Strudel team is aware of this and may improve it, but for now just remember that if a new sample doesn’t sound the first time, it’s likely still downloading. Once cached, it’ll play smoothly thereafter.

## Modulation and Randomness

One reason live coding is so dynamic is the use of **continuous modulation** and randomness to keep patterns evolving. Strudel provides many built-in signals and random functions:

* **Continuous signals**: These are patterns that output a continuous stream of values (rather than discrete steps). Some useful ones:

* sine, tri, square, saw: oscillating signals from 0 to 1 (or use sine2, tri2, etc., for -1 to 1 range)[[45]](https://strudel.cc/learn/signals/#:~:text=saw)[[46]](https://strudel.cc/learn/signals/#:~:text=Ranges%20from%20). You might use these to modulate parameters – e.g. a low-frequency oscillator (LFO) effect. Example: .cutoff(sine.range(500, 5000).slow(8)) would slowly wobble a low-pass filter cutoff between 500 and 5000 over 8 cycles.

* perlin: continuous Perlin noise (smooth random) from 0 to 1[[47]](https://strudel.cc/learn/signals/#:~:text=perlin). Good for organic, slowly changing random modulations (e.g. gradually shifting timbre).

* rand: a pure random signal 0–1 (white noise in control domain)[[48]](https://strudel.cc/learn/signals/#:~:text=rand). This will jump to a new random value at each sample point it’s queried. Often you’ll sample rand at a slower rate using .segment(n) to get a stepped random pattern.

* irand(n): random integers 0 to n-1[[49]](https://strudel.cc/learn/signals/#:~:text=irand). Useful for random note choices or sample picks.

* brand / brandBy(p): random booleans (0 or 1) – essentially coin flips – where brandBy(0.3) gives 1 with 30% probability[[50]](https://strudel.cc/learn/signals/#:~:text=brand).

* time: a special signal that linearly increases with time (essentially, current time in cycles). If you use time as a pattern, it will give you continuously increasing values. Modulating something with time can create ever-rising or falling effects (like a ramp). For example, a synth’s frequency modulated by time will keep rising – useful for “riser” effects.

* **Signals in patterns:** You can combine signals with pattern functions. E.g., you can treat rand as a pattern and apply .seg(8) to get a random step each 1/8 of cycle, or .fast(2) to update twice per cycle, etc. By default, signals like sine run one cycle per cycle of music; you can slow them down or speed them up with .slow/.fast.

* **Random pattern modifiers:** Instead of raw signals, Strudel also has pattern-level random functions similar to Tidal:

* sometimes(func), sometimesBy(prob, func): apply a function randomly sometimes.

* shuffle, scramble to reorder sequences randomly.

* choose to pick from a list randomly.

* These higher-level random tools are beyond our scope here, but be aware you can stochasticize patterns beyond just value noise.

Two very handy random techniques used in the example snippets are: - **segment(n)**: This chops a continuous signal into *n* discrete segments per cycle[[51]](https://strudel.cc/learn/time-modifiers/#:~:text=segment). For example, rand.segment(16) yields a random step-sequence of 16 values each cycle (like 16th-note random values). - **ribbon(seed, length) (synonym rib)**: This one is subtle but powerful – it **loops a pattern inside a given time window**[[52]](https://strudel.cc/learn/time-modifiers/#:~:text=ribbon). Essentially it takes a “slice” of the infinite pattern starting at offset = seed (in cycles) and of duration length (in cycles), and then repeats that slice. Why use this? For random patterns, it allows you to *freeze* the randomness into a repeating motif. If you just use rand, it will be different every cycle. But if you do rand.seg(8).rib(13, 2), you get a 2-cycle chunk of random values (with seed 13) that will repeat every 2 cycles – giving structure to the randomness. In one snippet, we see rand.seg(16).rib(46, 2) used for a vocal scrub pattern – this means a random scrub sequence 2 cycles long, repeating, so the vocal cut-ups loop in a consistent 2-bar phrase instead of random every time. **Use ribbon (rib) to introduce periodicity in randomness** – it’s great for generating “happy accident” riffs that then recur.

* **Parameter modulation:** You can pass these signals into any parameter function. For example, .pan(rand) will pan a sound randomly left/right each event. .gain(brandBy(0.3)) would randomly mute 70% of the events (since gain is 0 for 70% of cases and 1 for 30%). Combining continuous signals with patterns yields endless variety.

## Time & Tempo Revisited: fast, slow, seg, struct

Before moving on, let’s clarify a few key time-modifying functions (since they appear in examples):

* **fast(n) / slow(n):** Globally speed up or slow down a pattern by factor *n*. E.g. if you have a 1-cycle bassline but want it twice as fast (two repetitions per cycle), use .fast(2). If you want a pattern to take 2 cycles instead of 1, use .slow(2). You can use fractional values too (e.g. fast(1.5)).

* **seg (segment):** As mentioned, segment(n) takes a continuous pattern and outputs *n* evenly spaced samples of it per cycle[[51]](https://strudel.cc/learn/time-modifiers/#:~:text=segment). For discrete patterns, it can also *impose* a higher resolution. For instance, if you have a pattern with one event per cycle, .segment(4) will sample it in 4 slots – effectively repeating it 4 times (because the pattern value holds constant between events). This is often used in conjunction with signals or irand to quantize them into steps.

* **struct(pattern)**: This one is analogous to Tidal’s when or using one pattern to gate another. x.struct(y) will use the *temporal structure* of pattern y to play pattern x. For example, if y is a rhythmic mask of 1s and 0s, only when y has an event will x output something. In our custom helper later (trancegate), you’ll see x.struct(randPattern) used to rhythmically gate a continuous sound with a random on/off pattern.

* **every(n, func)**: (Not used heavily in our snippets, but worth noting) This applies a function to a pattern every *n* cycles. E.g. .every(4, rev) would reverse the pattern every 4th cycle. It’s a way to add periodic variations.

* **iter(n)**: Slices a pattern into *n* parts and rotates through them each cycle[[53]](https://strudel.cc/learn/time-modifiers/#:~:text=iter). This is a bit advanced, but an example: note("0 1 2 3").iter(4) will play 0 1 2 3 over 4 cycles, each cycle starting from the next number (cycle1: 0 1 2 3, cycle2: 1 2 3 0, etc.). It’s another way to get evolving patterns.

These and more are found under *Time Modifiers* in the docs. But you don’t need to memorize all – you’ll pick them up as needed. The main takeaway: Strudel gives you granular control over pattern timing, letting you compress, expand, loop, or reorder time as you wish. Now, let’s look at the **pattern language** for pitches and scales, as that’s crucial for making musical sense out of these rhythms.

---

# Pattern DSL and Musical Pattern Language

Strudel’s pattern DSL (domain-specific language) extends beyond drum hits. It can handle notes, chords, scales, and more, using many of the same concepts as TidalCycles’ mini-notation and functions. Let’s break down some of the funky-looking patterns from the examples and learn how to create our own musical patterns:

## Notes, Pitch, and Scales

**MIDI numbers vs Note names:** In Strudel, note() expects either MIDI note numbers or note names (like "c4", "g#3"). MIDI numbers are integers where 60 = middle C (C4). You can directly use them (e.g. note("60 62 64") for a C major arpeggio). But more conveniently, you can use note names with octaves: "c4 d4 e4" (case-insensitive, # for sharp, b for flat). If no octave is given, Strudel assumes a default (I believe C4 = 0 in that case, but generally include octaves to be clear).

However, in some example code you might see something like note("<c# f d# [d# a#2]>/2").sub(12). Let’s decode that: - <c# f d# [d# a#2]> – inside angle brackets, so it’s an *alternate* pattern, meaning each cycle it will choose the next element cyclically. The elements are: c# (probably C# in default octave), f, d#, and [d# a#2]. - [d# a#2] in square brackets means play d# and a#2 in sequence within one step. Since there’s a space, it’s sequential (if it were d#,a#2 with a comma, that would layer them simultaneously as a chord). So [d# a#2] is a fast two-note phrase (d# then a#2) that occupies one slot in the sequence. - The whole angle-bracket sequence is followed by /2, meaning it spans 2 cycles. So this pattern will actually take 2 cycles to return to the beginning. Effectively, you have a 4-step sequence that is stretched over 2 cycles (so each item lasts half a cycle). Cycle1 might do C#, cycle2 does F, cycle3 D#, cycle4 the little two-note run, then back. - Finally, .sub(12) outside means subtract 12 (semitones) from all those notes – in other words, drop them by an octave[[54]](https://strudel.cc/functions/value-modifiers/#:~:text=sub). This is a common trick: define a melodic pattern and then do .add(n) or .sub(n) to transpose it.

It’s okay if that still looks complex – the key idea is you can nest mini-notation to create riffs and phrases. We could have written that pattern in a more verbose but perhaps clearer way using cycle notation or separate patterns, but it’s compact to do it inline.

**Scales:** Strudel has a scale() function to map numeric pattern values to pitches of a given scale. For example, n("0 2 4 5 7").scale("a minor") will take the numbers 0,2,4,... as scale degrees in A minor. Scale names follow the format "root:mode" or "root:scaleName" (with some aliases). e.g. "c:major", "c:minor", "g:pentatonic", etc. You can also use degree notation like "C4:minor" to indicate root and octave.

The example n("<3@3 4 5 @3 6>*2".add("-14,-21")).scale("g:minor") is doing something clever: - 3@3 and such appears to be **pattern arithmetic** with cycle offsets (@). This is a bit beyond basic usage, but likely it means “3 for 3 cycles” or a repeated pattern. It then adds “-14, -21” which presumably transposes parts of the pattern by -14 and -21 semitones (those might correspond to chord inversions or something). - After that, .scale("g:minor") means treat those numbers as scale degrees in G minor. The result is fed to .s("supersaw"), so this is producing a melodic pattern (some bass or chord line) in G minor for the supersaw synth.

While you don’t need to fully grok that one-liner, it demonstrates that you can generate complex melodies by using numeric patterns + scale, instead of hardcoding note names. A simpler illustration:

n("0 3 5 7").scale("c:minor").s("sawtooth")

This would play scale degrees 0,3,5,7 of C minor (which are C, Eb, F, G) on a sawtooth synth – a simple minor arpeggio. If you want chords, you can provide lists for n or note:

note("[c4 e4 g4] [d4 f4 a4]").s("piano")

This would play a C major chord then a D minor chord (each chord in square brackets so the three notes are played simultaneously as one event). Alternatively, Strudel has a chord function and voicing helpers (e.g. note("c4").chord("m7") to get a C minor7 chord), but exploring that could be a whole tutorial itself! For now, using bracketed notes or stacking multiple note(...).s() patterns are straightforward ways to get chords.

**Polyrhythms and polymeters:** Because patterns can nest and because cycles are flexible, Strudel excels at polyrhythms. If you stack patterns with different internal lengths, they’ll naturally phase. For example:

stack(  
  s("bd*5"),        // 5 kicks per cycle  
  s("hh*4")         // 4 hats per cycle  
)

This will produce a 5 against 4 polymeter (the pattern won’t line up until 5 cycles later, when 5 kick cycles = 4 hat cycles = 20 beats have passed). You could also explicitly use functions like .euclid(k,n) for Euclidean rhythms (Strudel implements Tidal’s euclidean rhythms). But often, just writing patterns with different lengths or using prime numbers for repeats can create interesting cross-rhythms.

**Conditionals and variations:** The mini-notation <> is great for providing cycle-to-cycle variations (like alternating two bar patterns). You can also use sometimes as mentioned, or |> operators (Strudel supports many Tidal pattern combinators as methods, e.g. .append, .rev, etc.). For example, .sometimes(n => n.rev()) would randomly reverse the pattern occasionally. Or .when(conditionPattern, transformation) can apply a change based on another pattern of booleans. These allow creating evolving patterns that still have structure.

In summary, the pattern DSL lets you concisely represent both repetitive structures (for groove) and variations (for musical interest). By leveraging scale mapping and transposition, you can reuse patterns across different keys/modes, and by using mini-notation features you can avoid writing out long explicit sequences.

**Tip:** If a pattern is hard to understand, try breaking it down. You can use .log() at the end of a pattern to print out the actual events (with timestamps and values) to the console. This is useful for debugging complex pattern syntax.

---

# Custom Helpers and Advanced Functions

One of the joys of live coding is making your own little functions to simplify performance. Strudel allows you to create custom chainable functions using register(name, function)[[55]](https://strudel.cc/learn/code/#:~:text=You%20can%20write%20your%20own,as%20a%20reusable%2C%20chained%20function). All the helper functions in the prompt’s code (like rlpf, trancegate, etc.) are created this way. Let’s go through each custom helper mentioned, explain what it does, and see how to use it with examples.

*(Note: When you register('foo', (args..., pat) => {...}), Strudel adds a new method .foo() to all patterns. Inside your function, you typically take the input pattern pat and transform it. The last argument to the callback is always the pattern (pat) when you use the chainable form.)*

## 1. Low-pass filter helpers: rlpf and rhpf

**What they do:** These are likely **“resonant low-pass filter”** and **“resonant high-pass filter”** helpers. They wrap Strudel’s built-in lpf (low-pass filter) and hpf effects with a curve that makes a slider more musically useful. The code given is:

register('rlpf', (x, pat) => pat.lpf(pure(x).mul(12).pow(4)));  
register('rhpf', (x, pat) => pat.hpf(pure(x).mul(12).pow(4)));

This takes an input x (probably in range 0–1) and transforms it as pure(x) * 12 ^ 4 before feeding it to .lpf()[[56]](https://www.instagram.com/reel/DOfbpOpjRRK/#:~:text=Switch%20Angel%20,3%204%2F%2F%20LETS%20MAKE). Why? Because filter cutoff in lpf expects a frequency in Hz, and we want the slider (0–1) to map exponentially to a frequency range. By multiplying by 12 and raising to the 4th power, we map 0–1 -> 0–(12^4). 12^4 = 20736, so 1.0 becomes 20736 (approx the top of human hearing). 0 becomes 0 (very low). The curve is exponential, so mid slider values give moderate frequencies (e.g. 0.5 -> ~1300 Hz), and the high end of the slider quickly ramps to 20k. This gives finer control in the lower range where filters have big effect, and avoids spending too much slider travel on >20kHz (inaudible). In short, rlpf(x) means “apply a lowpass filter where x (0–1) controls the cutoff from low to high in a musically exponential way.” Similarly rhpf(x) for high-pass.

* **Basic usage:** Suppose you have a bright synth pattern and you want to be able to filter it live. You can do:

* const cutoff = slider(0.5);  // create a slider UI, initial value 0.5  
  s("supersaw*4").note("g4*4").rlpf(cutoff)

* Now in the editor, you’ll see an inline slider you can drag. At 0 it will heavily low-pass (muffled), at 1 it will be fully open (bright). This slider() function is really handy – it inlines a GUI slider into your code[[57]](https://strudel.cc/blog/#:~:text=Slider%20Controls). We’ll discuss it more in the performance tips, but as shown, you can tie it to our rlpf easily.

* **Example 1 – simple filter sweep:**

* // Play a sustained chord and sweep its filter  
  const knob = slider(0, 0, 1, 0.01); // slider from 0-1 in 0.01 steps  
  note("[c4 e4 g4]").s("sawtooth").gain(0.3)  
    .rlpf(knob);

* This plays a C major chord on a sawtooth with a lowpass. Initially knob is 0 (so heavily filtered). As you turn it up to 1, you’ll hear the bright harmonics come in. Because of the pow(4) shaping inside rlpf, most of the audible change happens in lower half of the slider (which is good for control).

* **Example 2 – high-pass use:**

* const hp = slider(0);  
  s("amen:0").loop(1).rhpf(hp);

* (Here I assume you loaded an amen break sample and want to high-pass filter it.) loop(1) would make the sample loop continuously. rhpf(hp) means with hp=0, it’s unfiltered; as you raise it, the bass frequencies get cut out (good for, say, filtering out lows of a breakbeat so it doesn’t clash with your kick).

* **Advanced performance example:** Combine rlpf and rhpf with Strudel’s built-in filter envelope controls to sculpt a classic **synth sweep**. For instance:

* // A evolving pad chord with a filter envelope  
  note("<c3 g3 c4 e4>").scale("C:minor").slow(4)  
    .s("triangle").gain(0.4)  
    .rlpf(0.2)        // base cutoff (low)  
    .lpenv(3)         // filter env depth  
    .lpattack(0.5).lpdecay(1.5).lpsustain(0)  // filter envelope ADSR  
    .room(0.8).size(0.9).orbit(4);

* Here we set a low base cutoff (0.2) so the sound is dark, but then lpenv(3) with attack/decay causes the filter to open up when a note triggers and then close. This gives a gentle “wah” each chord. The chord itself is a C minor chord that changes inversions each cycle due to the angle bracket. We added reverb (room/size) and put it on its own orbit. The result is a lush pad that doesn’t get too bright. By adjusting rlpf() or the lpenv depth live (you could tie them to sliders), you can perform filter sweeps easily.

*(In the above, lpenv(3) means filter envelope depth of 3 (pretty high) – essentially how much the filter opens. lpattack 0.5s and lpdecay 1.5s shape the envelope. Sustain 0 means the filter closes fully after decay. This is a bit of guess based on Strudel’s filter envelope docs[[58]](https://strudel.cc/learn/effects/#:~:text=,bpe)[[59]](https://strudel.cc/learn/effects/#:~:text=lpenv). You can experiment with these to get an “acid” or “synth” style movement.)*

## 2. Acid envelope: acidenv

**What it does:** This is a custom helper for creating an **acidic 303-style filter effect**. The code provided is:

register('acidenv', (x, pat) =>   
  pat.rlpf(.25).lpenv(x * 9).lps(.2).lpd(.15)  
);

When you call .acidenv(val) on a pattern, it does four things to that pattern: - rlpf(0.25): sets a low-pass filter cutoff base at 0.25 (using our resonant low-pass). 0.25 (with the pow mapping) corresponds to about 80 Hz cutoff – very low, meaning the filter is mostly closed. - lpenv(x * 9): sets the filter envelope depth[[59]](https://strudel.cc/learn/effects/#:~:text=lpenv). The parameter x we pass in is likely 0–1, multiplied by 9 here. So if you do .acidenv(1), that’s lpenv(9) – a very high envelope depth. If .acidenv(0.5), then lpenv(4.5). This “depth” means how far the filter cutoff will swing open due to the envelope. - lps(0.2): sets the filter envelope sustain level to 0.2 (very low)[[60]](https://strudel.cc/learn/effects/#:~:text=Synonyms%3A%20). Essentially, after the initial envelope decay, the filter stays almost closed (20% of full open). - lpd(0.15): sets the filter envelope decay time to 0.15 seconds[[61]](https://strudel.cc/learn/effects/#:~:text=lpdecay) (very short). This means the filter opens and then closes quickly.

All together, acidenv(x) turns a synth note into that short, squelchy 303 sound: the filter is normally shut (hiding the harmonics), but each note triggers a quick envelope that *opens the filter up then slams it shut* with a tiny sustain.

* **Basic usage example:**

* n("0 0 0 0 7 7 7 7").scale("c:minor").s("square")  
    .decay(0.1).release(0)    // short amp envelope  
    .acidenv(1)              // full acid envelope on filter  
    .room(0.1).orbit(3);

* This will play a pattern of alternating root and fifth notes (0 and 7 in the scale) on a square wave. The amplitude decay is short (0.1s) and release(0) (no tail). The acidenv(1) makes each note go “WOW” with the filter. Because x=1 we used, it’s the maximum envelope depth (9), so you’ll get the most squelch. If it’s too much, use a smaller value. You can treat the x in acidenv as an **“acid intensity” knob**.

* **Tweak live with sliders:** It’s common to expose acidenv’s parameter via a slider so you can go from mellow to full acid. For example:

* const acidAmt = slider(0.5);  
  n("0 3 5 7").scale("e:phrygian").s("sawtooth")  
    .decay(0.2).release(0)  
    .acidenv(acidAmt);

* Start with acidAmt around 0.3 for a subtle effect. When you want to freak out the dancefloor, crank it to 1 – the synth will scream as the envelope depth increases (like turning up resonance/env mod on a 303).

* **Adding resonance:** The above acidenv doesn’t explicitly set filter resonance (Q). By default Strudel’s lpf might have a mild resonance. If you want a sharper acid sound, you can add something like .lpq(0.9) (lowpass filter Q factor – closer to 1 is high resonance) or use the ladder filter type. For example:

* .ftype('ladder').lpq(0.8)

* appended to the chain, to use the ladder filter model with high Q. This can further accentuate the acid effect (careful with volume, high resonance can be piercing).

* **Performance example:** Suppose you want an acid bassline in your techno set. You might do:

* setCpm(135/4);  
  const acid = n("<0 0 0 7 5 0 3 0>*2").scale("a:minor")  
               .s("square")  
               .decay(0.125).release(0)  
               .acidenv( slider(0.8) )   // slider to control acid intensity  
               .gain(0.8).orbit(3);

* This creates a repeating acid pattern in A minor. The .acidenv() is hooked to a slider (starting at 0.8 intensity). You can live-modulate that slider to go from a muted pluck (low env depth) to a squelchy roar. Also consider using sometimes to transpose or mutate the pattern for variation. For instance: .sometimes(add(12)) to occasionally pitch it up an octave.

*With acidenv, it’s all about tweaking the filter envelope depth and base cutoff to taste. The provided defaults (.25 cutoff, etc.) are a good starting point for a classic TB-303 vibe.* 🎛️

## 3. Filler function: fill()

**What it does:** The fill function is designed to **extend pattern events to fill the space until the next event**. In other words, it removes the gaps between events by lengthening each note to touch the next note’s start. This is useful for turning staccato patterns into legato or continuous ones.

The code given:

register('fill', function(pat) {  
  return new Pattern(function(state) {  
    // ... it finds events (haps), then for each event, extends its 'whole' duration to the next event's start.  
    // (Hap here is an internal event object with .whole (global timespan) and .part (cycle-local timespan))  
  });  
});

The specifics aren’t vital to us; conceptually, pattern.fill() says: *“take pattern’s sequence and make each note sustain until the following note begins (or until cycle end).”* If there’s no next note (like the last note in a cycle), it probably just leaves it or caps at cycle boundary.

**Musical use:** One place this is handy is after using struct or chopping up a pattern. For example, if you create a rhythmic gate (like turning a continuous tone on/off), you might end up with short blips. Applying fill will make those into sustained segments.

* **Example – gating a drone:**

* // Without fill: chopped sound  
  s("square").note("c2")   
    .struct("1 0 1 0  1 1 0 0")  // using a pattern of 1s and 0s to gate on/off  
    .gain(0.3);

* Here .struct("1 0 1 0 ...") would output the square wave only on steps where the struct pattern has 1, but each event is just a moment (like a tick). The sound will be very clicky (brief pulses). Now add fill():

* s("square").note("c2")  
    .struct("1 0 1 0  1 1 0 0")  
    .fill().gain(0.3);

* Now each ‘1’ section will sustain until the pattern hits a ‘0’. So you get longer tones that fill all of the allowed time. The result is a rhythmic gating effect where the note holds during the “on” moments. Essentially, fill turned the pulses into solid blocks.

* **Example – legato notes:** If you have a melody but want it legato (notes tied together), you could use fill as long as the melody is represented in one pattern. E.g.:

* note("c4 e4 g4 f4").s("triangle").fill()

* Without fill, each note might have default decay and you’d likely hear gaps (especially if using .release etc.). With fill, each note event lasts right until the next one, so it’s seamlessly connected. (To really hear this, use a synth with sustain, or add .sustain(1) to remove the amplitude decay.)

* **Interaction with envelopes:** Note that fill extends the *event duration* at the pattern level. If your amplitude envelope (adsr) is shorter than that duration, you’ll still get silence after the envelope finishes. For true legato on synths, you’d ensure the amplitude sustain is full or infinite. But for samples, fill can actually retrigger or overlap them as needed (with loop or in slicing contexts).

In the **trancegate** function (coming next), they use fill() after applying a binary mask to ensure the gated segments sustain fully until the gate closes[[62]](https://strudel.cc/learn/effects/#:~:text=Can%20vary%20across%20orbits%20with,2%3A3). This avoids clicks and gives a constant volume during the “gate open”.

**Performance use-case:** You likely won’t type .fill() on the fly often, but you might incorporate it into custom patterns. For example, a custom ambient drone pattern might create on/offs via randomness and then fill them to create evolving textures.

One thing to be mindful of: fill will cause notes to overlap if the next note starts before the previous ends (since it extends up to the next onset). In Strudel’s architecture this is fine (it will either overlap voices or cut previous ones based on polyphony settings). It’s mostly beneficial when you’re dealing with gate patterns or want to smooth sequences.

## 4. Trance gate: trancegate(density, seed, length)

**What it does:** Trancegate is a classic effect from trance music – rapidly gating a sustained sound on and off in a rhythmic fashion (like a tremolo on steroids). This custom function automates that: it will take an input pattern and apply a rhythmic on/off pattern to it, with some randomness controlled by a seed.

The code (cleaned up) is:

register('trancegate', (density, seed, length, pat) => {  
  return pat  
    .struct( rand.mul(density).round().seg(16).rib(seed, length) )  
    .fill()  
    .clip(.7);  
});

Let’s break that down: - It generates a random pattern: rand.mul(density).round().seg(16). - rand yields 0–1 continuously; multiplying by density (a number) and then rounding will produce a bunch of 0s and 1s (like a coin flip where probability of 1 is density). - E.g. if density = 1.5, rand*1.5 gives values 0–1.5, rounding results in mostly 0s and some 1s (specifically, 1 whenever rand >~0.5). If density=1, 50% chance of 1. If density=2, then rand*2 range 0–2, rounding yields a lot of 1s and some 2s (which will probably wrap to 0 or be treated as 1s? A bit unclear, but likely density above 1 means mostly on). - .seg(16) makes it 16 steps per cycle (so 16 possible on/off per cycle). This likely corresponds to a 16th-note gate pattern. - .rib(seed, length): as discussed, this* *freezes* *the random pattern into a loop of given length. So if length = 1, you get a repeating 1-cycle random pattern (effectively not changing every cycle, locked by seed). If length = 2, then it produces a 2-cycle long pattern that repeats. seed just picks which random slice (so different seeds give different gate patterns). - Now we have a fixed binary pattern of 16th notes. - pat.struct(thatPattern): This will apply the pattern as a structure mask on pat. Essentially it will only play pat when the random pattern has 1, and silence when 0. In other words, it gates pat on and off at 16th-note resolution with a certain density. - .fill(): After struct, the sound will be short blips. fill extends those blips to last until the gate closes, i.e. turns them into full segments as we explained. This makes the gated segments solid blocks of sound. - .clip(0.7): This likely* shortens each segment to 70% of its length*. The name clip is a bit confusing; think of it like applying a duty cycle. If each gate on lasts from beat start to beat end, .clip(0.7) might cut it to 70% of that, leaving a 30% gap before the next beat. This prevents clicks or just gives a bit of rhythmic silence so it’s not 100% duty cycle. (In trance gate, often you want a little gap to emphasize the rhythm).

The end result is: **a rhythmic gate effect** on the input pattern, with density controlling how many on-beats vs off-beats (e.g. 1.0 = 50% on, 2.0 = maybe 75% on, etc.), seed controlling the random pattern (so it’s reproducible), and length controlling over how many cycles that pattern repeats.

* **Basic usage:** If you have a lush pad or a long note and want to trance-gate it:

* s("supersaw").note("a4").slow(4)  // a long 4-cycle note  
    .room(0.5).size(0.8)  
    .trancegate(1.5, 45, 1);

* This will create a 16th-note pattern where about 50-60% of the 16ths are on (density 1.5), using seed 45 to pick the particular pattern, repeating every 1 cycle. The pad will chop into a rhythmic stutter. Try different densities: 1 for a sparse gate (roughly half on), 2 for a very dense gate (mostly on with occasional breaks), or even fractional like 0.5 for a sparse effect. Change seed to get a pattern you like the groove of.

* **On beats vs offbeats:** If you want a strictly regular gate (like 16th on-off alternating), you might not use a random approach. You could just do something like .struct("10101010 10101010") manually. But trancegate gives a bit of randomness which can be nice (and you still control repetition via length).

* **Example – pumping chords:**

* note("<[c4 g4] [c4 a#4]>@2").s("triangle").gain(0.5)  
    .decay(0.3).sustain(0)  // shortish plucky envelope  
    .trancegate(2, 99, 4)   // dense gate pattern repeating every 4 cycles  
    .room(0.4).orbit(4);

* Here we have a two-chord progression (C5 power chord to C7 chord, @2 means each lasts 2 cycles). The trancegate with density=2 will chop them into a quickly pulsing chord rhythm. length=4 means the gate pattern itself evolves over 4 cycles before repeating, adding interest over the chord progression.

* **Live manipulation:** The beauty of trancegate is you can change its parameters live. You might register it globally in your init script, then in performance, do:

* myPad.trancegate( slider(1), 42, 2 )

* hooking density to a slider. Slide it down to 0 – the pad opens up fully (no gating). Slide to ~1 – you get a balanced gate. Slide >2 – it’s almost constantly on (just a few cuts). This is an expressive control, almost like controlling a tremolo depth.

* **Alternate approach:** The prompt code noted they “fixed argument order” so that pattern is last. That’s needed for register to make it chainable. So usage is as we’ve done: .trancegate(density, seed, length). If you wanted a perfectly periodic gate (no randomness), you could implement another function (or just manually structure it). But the random gate gives that driving, slightly syncopated feel which often sounds more organic.

One thing to note: trancegate as defined uses a fixed 16 subdivisions per cycle. If your cycle is not 4/4 or you want triplet feel gates, you’d have to modify it (e.g. use seg(12) for 12 pulses per cycle, etc.). The current form suits typical 4/4 trance 16th gating.

## 5. Scale grabber: grab(scale, pattern)

**What it does:** The grab function **snaps incoming notes to the nearest note in a given scale**. It’s like pitch quantization. You provide a scale (as an array of intervals or a scale pattern) and it will adjust any note that the pattern plays to the closest pitch in that scale.

From code:

register('grab', function(scale, pat) {  
  scale = (Array.isArray(scale) ? scale.flat() : [scale]).flatMap(val =>  
    typeof val === 'number' ? val : noteToMidi(val) - 48  
  );  
  return pat.withHap(hap => {  
    // hap.value might be object or note; extract numeric note  
    // find nearest in scale (taking into account octave by mod 12)  
    // set hap's note to that nearest scale note  
  });  
});

The technical bits: it takes scale which can be array of numbers or note strings. It converts them to numeric pitch classes (the code noteToMidi(val) - 48 suggests it subtracts 48, maybe using C3 as 0 reference). Then for each event (hap), it finds the note (in MIDI or number form), normalizes it to within one octave (removing octave offset), finds which of the provided scale degrees is closest, and then re-applies the original octave. This effectively moves the note to the nearest allowed pitch class.

In plainer terms, **grab([scaleDegrees], pattern) ensures the pattern’s notes are tuned to that scale.** It “grabs” them to the nearest pitch in the specified collection.

* **Use case:** Suppose you have a pattern that generates semi-random notes (maybe from rand or some procedural logic) and you want them to sound harmonic in, say, a minor scale. You can pipe it through grab("minor") or grab(scaleArray) to constrain the output.

* **Example – quantize random melody:**

* n( irand(12).segment(8) )   // random 8-note sequence of 0-11  
    .grab("c:minor")          // snap each to nearest note in C minor scale  
    .s("sine");

* irand(12) alone would produce a totally random chromatic melody. .grab("c:minor") will ensure it sticks to C minor scale notes. Notes not in the scale get shifted to a nearby consonant pitch. This way, no matter what random comes out, it will sound in key.

* **Scale specification:** The code suggests you can pass in either an array of numbers (like [0,2,3,5,7,8,10] for a natural minor scale relative to C=0) or a scale name string that noteToMidi can parse. It subtracts 48 (which is likely making C3 = 0 in its internal calc), but that detail aside, if you pass "g:minor", I suspect it deduces the G minor scale degrees.

If you want a custom set, you can also give an explicit array of MIDI notes. E.g., grab([60, 62, 63, 65, 67, 68, 70]) which corresponds to C major scale MIDI in one octave. But more musically, just giving "C:majpentatonic" or something should work since it uses noteToMidi on strings.

* **Example – enforce chord tones:** You can use grab to make a melody follow chord changes. Say you have a chord progression and an improvising melody pattern. If you update grab’s scale array when the chord changes, the melody will jump to chord tones. A manual example:

* // Chord progression in C (I - IV - V - I)  
  const chordScale = slider(0, [ [0,4,7], [5,9,0], [7,11,2], [0,4,7] ]);  
  // slider with an array might not directly work like that, but conceptually:  
  // We want chordScale to output [0,4,7] for chord I, [5,9,0] for chord IV, etc, cycling.

  n("0 2 4 7 9 11 12 14").grab( chordScale )  
    .s("square").octave(4);

* This is pseudocode-ish; the idea is chordScale slider holds different sets of allowed degrees per phase of progression. As it changes, grab snaps notes to those. A simpler approach in current Strudel would be to sequence the allowed notes: for e.g. 2 cycles of C chord tones, 2 of F chord, etc., using angle brackets or something, but that might be complex to set up.

The bottom line: grab is a powerful constraint tool. In an improvisational setting, you might even toggle it – let the pattern roam free chromatically for a while, then apply grab to pull it back into tonal center.

* **Minimal example with direct array:** If you just want to allow say a C minor pentatonic, that scale (intervals from C: 0,3,5,7,10). So:

* n("0 1 2 3 4 5 6 7 8").grab([0,3,5,7,10]).s("triangle")

* This will take that chromatic run 0-8 and “grab” each to nearest of {0,3,5,7,10}. So 1->0 (since 0 and 3 are the options, 0 is closer to 1 than 3 is), 2->3, 4->5, 6->5 or 7 (6 is closer to 5 than 7, distance1 vs 1 – if equal, not sure how ties break, maybe lower), 8->7. So the output melody would be something like 0,0,3,3,5,5,5,7,7 – a quantized version sticking to pentatonic notes.

* **Performance tip:** grab could be used live when you want to impose order on chaos. If you have a wild pattern going and suddenly you want it to resolve, wrapping it with .grab("scaleName") on the fly can musically rein it in.

One must ensure grab is registered in advance (or you quickly register it in the REPL before using it). Once it’s there, it’s as easy as adding .grab(...) to your pattern chain.

## 6. Multi-orbit panner: mpan(orbitsArray, amount)

**What it does:** mpan is a custom effect that **distributes a sound across multiple orbits and the stereo field** based on one control value. It seems to treat an array of orbits like destinations and an amount (0–1) as a crossfade index among them, *and* also pan within the chosen orbit.

From code:

register('mpan', (orbits, amount, pat) => {  
  const index = Math.round(amount * (orbits.length - 1));  
  const orbit = orbits[index];  
  const pamt = (amount * orbits.length) % 1;  
  return pat.orbit(orbit).pan(pamt);  
});

So if orbits = [2,4,5] and amount=0, index = 0, orbit = 2, pamt ~ 0. So it sends pat to orbit2, pan ~ 0 (which is left? In Strudel pan 0 is left, 1 is right I believe). If amount=0.5 with 3 orbits: - index = round(0.5 * 2) = round(1) = 1, orbit = orbits[1] (which is 4 in this example). - pamt = (0.5*3) % 1 = 1.5 % 1 = 0.5. So orbit4, pan 0.5 (center). If amount ~0.999: - index ~ round(0.999*2)= round(1.998)=2, orbit=5, - pamt = (0.999*3)%1 = 2.997 %1 = ~0.997 (almost fully right). So essentially: - From 0 to ~0.33, it’s on orbit2 panning from left to right. - From ~0.34 to ~0.66, it jumps to orbit4 (the next orbit) and pans left->right across that range. - From ~0.67 to 1, it’s on orbit5, panning.

It’s a bit unconventional but the idea is: one continuous knob (0–1) moves the sound from orbit to orbit in sequence, while also performing a fine pan within each orbit’s stereo field.

**Use cases:** This is a quite specific tool. Possibly used when you have multiple outputs (orbits) feeding different effects or speakers, and you want to “move” a sound through them. For example, maybe orbit2 is dry, orbit3 goes to a heavy delay, orbit4 to a looper – you could then use mpan([2,3,4], x) to send the sound progressively through these channels. Or if orbits correspond to different surround sound speakers, etc.

In a simpler performance context, one might use it for stereo autopanning: if you just use two orbits [1,1] (both 1? that makes no sense), orbits [1,1] wouldn’t change orbit but pan would go left to right. But [1,2] would swap between two orbits (not that useful unless orbit2 goes to a different physical output).

Perhaps the original intention: if using multi-channel orbit mode, orbits 2,3,4 might feed a mixer’s separate channels. mpan could then spatialize a sound across 3 channels.

* **Basic example:**

* const pos = slider(0);  
  s("amen:0").loop(4).mpan([2,3,4], pos);

* If you had multi-channel mode on and orbits 2,3,4 mapped to three stereo outs, then pos=0 would play the loop out orbit2 fully left, pos=0.5 sends it to orbit3 center, pos=1 sends to orbit4 right. As you drag pos, you’d hear the loop move spatially.

* **Stereo usage:** For simple left-right pan, we normally just use .pan() with 0–1. But mpan could effectively do a “hard cut” pan at certain points if you give two distinct orbits that end up mixing down to same stereo. Honestly, if you’re not using multiple audio interfaces, mpan might not be very audible except as a fancy panner. If orbits all mix to 1&2 output, switching orbit doesn’t change sound (except potentially different reverb sends or so). But you’d hear the pan effect though (because of .pan(pamt)).

* **Advanced use – creative effect routing:** Suppose orbit2 is normal, orbit3 has a high-pass filtered bus, orbit4 has a big reverb. You could use mpan([2,3,4], x) to morph a sound from dry (orbit2) to thin (orbit3) to washed-out (orbit4) by turning one knob. This is a creative multi-send crossfade. For example:

* const route = slider(0);  
  const hh = s("hh:3*16").gain(0.5);  
  hh.mpan([2,3,4], route);  
  // Meanwhile, maybe on orbit3 we have an effect:   
  $: _ => s().orbit(3).hpf(1000)  // pseudo-code: process orbit3 with HPF

* Actually, processing orbit outputs differently requires splitting into multiple REPL evaluations or using mixers – but you get the idea: you can treat orbit3 as a FX bus.

In general, mpan is a niche tool for complex routing. If you’re just starting, you might not need it. But it shows how you can combine orbit and pan in a single gesture.

## 7. Step-sequencing helper: beat(onsets, length)

**What it does:** This wasn’t explicitly defined (the snippet had a placeholder returning pat), but from its usage, beat("0,7?,10", 16) suggests: - It takes a list of step indices (with possible ? for random omit) and a cycle length in steps, and produces a rhythmic pattern.

Essentially, beat(patternString, n) means: interpret the patternString as positions in an n-step grid (likely 0-indexed). “0,7?,10” would mean steps at 0, 7, and 10 out of 0–15, with 7 being probabilistic (“7?” possibly meaning maybe include step 7 randomly). The function then returns a structure pattern (like a binary sequence of length n with 1s at those positions and 0s elsewhere).

If integrated, one would use it like:

s("bd:1").beat("0,7?,10", 16)

This likely produces a pattern that triggers that sample at those step positions each cycle. It’s akin to writing a mini-notation pattern explicitly, but some find numeric step sequencing intuitive.

* **Example interpretation:** In DnB example, bd:1 with .beat("0,7?,10",16):

* Step 0: BD

* Step 7: BD maybe (7? means sometimes skip, adding a nice break feel)

* Step 10: BD That matches a common drum & bass kick pattern in 16th note grid (Kick on 1, a ghost kick slightly before the “& of 3”, and another kick on the “& of 3” if 10 corresponds to halfway through beat 3 – DnB often has a kick there). Meanwhile, sd:2 .beat("4,12",16) put snares on 4 and 12 (beats 2 and 4). So yes, beat() is just a convenient way to specify those positions.

* **Using beat for any drum pattern:** For a house beat:

* s("bd").beat("0,4,8,12", 16)  // kick every quarter  
  s("sd").beat("8", 16)        // snare on 3  
  s("hh").beat("2,6,10,14",16) // off-hats

* And stack them (or use separate labeled patterns). This would produce the classic 4-on-the-floor.

* **Polymetric use:** If you give a length that doesn’t match the underlying cycle resolution, it will adapt. For instance, .beat("0,5", 8) on something would place events on step0 and step5 out of 8 (that’s a tresillo pattern if 8th notes). It is essentially generating something similar to mini-notation but via numeric positions.

One caution: Since we don’t have the official beat code, we assume it returns a Pattern of, say, “x” and “~” or uses .struct. If I were implementing, I might do:

register('beat', (steps, n, pat) => {  
  // steps is like "0,4,8,12" or "0 4 8 12"? likely comma or space separated  
  const arr = parseSteps(steps);  
  // create a mini-notation string of length n with events at those positions, rest elsewhere  
  let sequence = Array(n).fill("~");  
  arr.forEach(i => {  
    if(i < n) sequence[i] = sequence[i].includes("?")   
        ? `${sequence[i].replace("~","")}?`  // not exactly, but if input had "7?"  
        : pat.value || "x"; // or just "x"  
  });  
  const patternStr = sequence.join(" ");  
  return pat.struct(patternStr);  
});

This is pseudo-code. The idea: fill an array of length n with rests, put events at specified indices. Or simpler: Create a Pattern by querying state mod n to see if index matches.

But from usage, I suspect it’s more directly creating a structural mask. Regardless, beat is a QoL (quality-of-life) helper to avoid writing out lots of "~".

* **Alternate:** Without beat, you can achieve the same by writing a mini-notation pattern or using struct. E.g. pat.struct("t(3,8)") might if a function existed. Or writing <bd ~ ~ ~ bd ~ ~ ~> etc. beat just shortens that process.

**Conclusion on helpers:** We saw how each custom helper either simplifies complex chains (like trancegate encapsulating a random gating process), or provides a shorthand for common musical tasks (like grab for quantizing, or beat for step sequencing). Writing your own helpers is encouraged once you have repetitive patterns – for example, you could write an every4(func) that does .every(4, func) if you do that a lot, or a custom swing function, etc. The pattern given with register in the docs shows it’s straightforward to package any chain of operations into one function for readability[[55]](https://strudel.cc/learn/code/#:~:text=You%20can%20write%20your%20own,as%20a%20reusable%2C%20chained%20function).

Now that we understand Strudel’s toolbox and some advanced tricks, let’s get practical: how to create specific genres of music (house, DnB, acid, techno) with live-coded patterns in Strudel.

---

# Genre Studies: Patterns and Techniques for Four Genres

We’ll now dive into four electronic genres – **House, Drum & Bass, Acid House, and Techno** – and design Strudel patterns for each. For each genre, we’ll cover:

* **Rhythmic foundations:** typical drum patterns (kick, snare/clap, hats).

* **Basslines:** pattern structures, note choices, and examples of bass patterns.

* **Sound design & FX:** how to get the right timbre (using sample kits, synth parameters, effects like filter or distortion).

* **Arrangement ideas:** ways to live-code builds, drops, variations using pattern transformations.

Each genre will have two example Strudel pattern sets: think of them like two different “grooves” or sketches you can try. Each example will be accompanied by code with comments, and suggestions for live manipulation (like which slider to tweak, or which layer to mute/unmute for transitions).

Before we start, a quick note: **Feel free to mix and match** these ideas! The lines between genres can blur – e.g. a techno rumble kick technique might sound great in a house track, or an acid bassline might spice up your techno pattern. Live coding is about experimentation.

Also, ensure you’ve loaded necessary samples/banks: - For House/Techno, the built-in RolandTR909 and TR808 kits are perfect. - For Drum & Bass, you might want classic breakbeats; consider samples('github:yaxu/clean-breaks') to get the Amen, Funky Drummer, etc. Or use the default kit’s amen if available. - For Acid, a 303-ish sound can be made with the synth (we’ll use square or sawtooth with our acidenv). - But to keep it simple, I’ll rely mostly on built-in stuff and mention optional external sample usage.

Let’s groove!

## 5.1 House

House music typically sits around 120–130 BPM with a steady 4/4 kick drum, off-beat hats, and syncopated claps or snares. It emphasizes a groove that makes you want to move, often with a funky or soulful bassline and maybe some chord stabs.

**Time/Tempo:** We’ll use setCpm(125/4) (approximately 125 BPM). House is 4/4, so beats per cycle = 4.

**Drum patterns:** - **Kick:** Four-on-the-floor (kick every beat). That’s fundamental to house. - **Snare/Clap:** Usually on the 2 and 4 (the “backbeats”). Sometimes layered clap on 2/4 with a snare or just a clap. - **Hi-hats:** Often a closed hat on every 1/8 off-beat (the “tss-tss-tss” between kicks). Sometimes an open hat or shaker on off-beats, with a closed hat on all 8th or 16th for drive. - **Percussion:** House tracks might add a ride on every beat (esp. in later energy) or congas, etc., but let’s keep it simple.

**Basslines:** - House bass is frequently funky but simple. Common patterns: repeating 1-bar riff, often syncopated (hits not always on the kick, often a bit late to create swing). Bass notes often stick to the root and fifth, sometimes the octave. E.g. a typical deep house bass might be something like [0, 0, 7, 0] in scale degrees, with rests to create a groove. - The bass sound can be a short pluck or a sustained sub. We might use a simple sine wave (808-style sub) for one and a squarer wave for a more tech-house pluck.

**Sound design:** - Use the 909 kit for drums (.bank("RolandTR909")) for a classic house sound (909 kick, clap, open hat). - For a deeper/older vibe, the 808 kit or LinnDrum could be used. - Bass: a sine or triangle wave for subby bass, or a sampled bass (there are some in VCSL perhaps). But using s("square") with low notes and a short decay can yield a nice bass pluck. Also, a bit of .shape (wave distortion) can add harmonics to cut through. - Chords: House often has organ or piano stabs. If you want, Strudel’s s("piano") can be used, or load a specific sample pack. But we’ll illustrate at least one chord pattern using s("organ") or a saw chord.

**Arrangement and live tweaks:** - House builds via dropping out the kick, or filtering the bass/chords (that’s where our rlpf slider can be handy – filter down in a breakdown, then open filter as kick returns). - Use .gain() or orbit mutes to remove elements (e.g. drop hats for 8 bars). - Automating room (reverb) can create space in breakdowns (lots of reverb), then dry it up when beat hits. - **Swing**: House often swings a bit. Strudel has a swing function. You can do .swing(4) for subtle shuffle on 16ths or .swingBy(0.2, 8) etc. We might not cover it deeply, but feel free to experiment by adding .swing(8) on hi-hats for example (that’ll delay every second 8th-note by a bit, giving swing).

Now, let’s present two house grooves:

### Groove 1: Minimal House Groove (Deep minimal vibes)

We’ll make a simple deep house pattern: solid kick, a syncopated sub-bass, sparse percussion.

// --- House Groove 1: Minimal deep house ---  
setCpm(124/4)  // ~124 BPM, 4 beats per cycle

// Drum pattern  
const kick = s("bd*4").bank("RolandTR909").gain(0.9)           // Kick on 1,2,3,4  
  .orbit(2);                                                  // put drums on orbit2

const clap = s("cp*2").bank("RolandTR909")                     // Clap on 2 and 4   
  .shift(0.25)                                                // shift by 1/4 cycle (i.e., beat 2 & 4)   
  .gain(0.7).orbit(2);                                        // (Alternatively: s("~ cp ~ cp"))

const hat = s("oh*4").bank("RolandTR909")                      // Open hat on every beat  
  .offset(0.5)                                                // offset it half a beat (so it hits on off-beats between kicks)  
  .gain(0.5).orbit(2);

// Note: .offset(0.5) delays each event by 0.5 of its spacing (so here, each quarter-note hat is delayed to the midpoint between quarter notes)

// Bass pattern (deep sub)  
const bass = s("triangle").note("c2 c2 ~ c2")   // Play C2 on beats 1,2, skip 3, play on 4  
  .decay(0.2).sustain(0)                        // short plucky envelope  
  .gain(1.0).orbit(3);

// Add a gentle sidechain compression on bass ducking to kick  
bass.duck("2").duckdepth(0.5).duckattack(0.05);

// Combine layers (they are already playing since we defined consts, but stack for clarity)  
stack(kick, clap, hat, bass);

**About this pattern:** We used a **909 kick** and **clap** (clap shifted by 1/4 cycle to land on 2 and 4 – an alternate way to schedule it). The open hat is hitting on off-beats (we delayed each beat by 0.5 of a beat, which effectively places hats at the “ands”: 1& 2& 3& 4&). The bass is a simple *do-do-(rest)-do* pattern on C2 (a low note). We made it a triangle wave, which has some harmonics but is still deep. It’s plucky (decay 0.2s). We also applied bass.duck("2") meaning whenever orbit2 (the kick/clap orbit) hits, the bass ducks by default amount. We then set .duckdepth(0.5) for a moderate dip and a quick .duckattack(0.05) (fast recovery). This gives that subtle pump so the kick and bass don’t clash.

**How to perform with this groove:** - Try playing with the **bass pattern** by changing notes or using a scale. For example, note("c2 c2 ~ g2") to hit the fifth (G2) on the last note. Or add variation: note("c2 c2 ~ <c2 g2>") so every other bar goes to G. - Use a **filter on the hat** or clap to soften in breakdowns: e.g. hat.lpf(slider(0.8)) and clap.lpf(slider(0.5)) if you want to assign sliders to gradually muffled then open them. - You can add a **ride cymbal** or additional percussion by layering: e.g. s("rd*4").bank("RolandTR909").gain(0.2) to have a light ride every beat. - The groove as is is quite minimal; you could introduce a chord stab: e.g.

note("c4 e♭4 g4").s("organ").delay(0.75).decay(0.3).orbit(4);

This would hit an organ chord just before the next bar (delay 0.75 of a cycle, i.e., the “4&”). Adjust to taste.

### Groove 2: Funky House Groove (uplifting and busy)

Now a busier pattern with a groovy bassline and maybe a chord loop.

// --- House Groove 2: Funky upbeat house ---  
setCpm(128/4)  // a bit faster house at 128 BPM

// Drums  
d1 $: s("bd*4").bank("RolandTR909").gain(1).orbit(2)    // Kick 4x4  
d2 $: s("[~ cp] ~ [~ cp]").bank("RolandTR909")          // Clap on 2 & 4 (written as mini-notation alt)  
       .gain(0.8).orbit(2)  
d3 $: s("hh*8").bank("RolandTR909")                     // Closed hat on every 8th note  
       .gain(0.4).orbit(2)  
       .swing(8)                                        // add a bit of swing to hats (swing 8ths)  
d4 $: s("oh*4").bank("RolandTR909")                     // Open hat on off-beats  
       .offset(0.5).gain(0.5).orbit(2)

// Bassline – a bit funkier rhythm  
b1 $: s("sawtooth").note("a1 ~ a1 a1 ~ e2 ~ g2 ~")    
       .decay(0.125).sustain(0)   // short pluck  
       .gain(0.9).orbit(3)

// Explanation: note pattern "a1 ~ a1 a1 ~ e2 ~ g2 ~"  
// This is 8 steps (assuming ~ for rest):  
// 1: A1, 2: rest, 3: A1, 4: A1, 5: rest, 6: E2, 7: rest, 8: G2.  
// It creates a syncopated riff. E2 and G2 add a bit of melody (5th and b7 of A minor scale).

// Chords or stabs  
c1 $: note("[a3 c4 e4] ~ [a3 c4 g4] ~").s("piano")   
       .decay(0.4).release(0.1)  
       .room(0.3).size(0.8).orbit(4)  
// The above alternates two chords (A minor triad and A minor 7 (with G)) every other bar.  
// The "~" in between means the chord hits on the first beat of bar1, nothing on bar2 first beat, then second chord on bar3, nothing on bar4, etc., giving a spaced-out feel.

// Sidechain chords and bass to kick subtly  
c1.duck("2").duckdepth(0.3)  
b1.duck("2").duckdepth(0.3)

// If too many $: at once, you can also stack if all defined:  
stack(d1, d2, d3, d4, b1, c1)

**About this pattern:** We kept the 909 kit but added more percussion: closed hat on every 8th note (with slight swing) plus off-beat open hat. The clap is patterned as [~ cp] ~ [~ cp], which means: in a 2-cycle pattern, it will alternate placing a clap on beat 2 and 4. (Another way to do it; we also could have just done same as before – either works).

The **bassline** here is in A minor: A1 is the root, E2 the fifth, G2 the seventh. The rhythm is more syncopated – it hits on 1, (rest on 2), double-hit on 3&4 (giving that upbeat push), then E2 on beat 6 (which is actually just after the 4th kick, adding syncopation), and G2 on beat 8 (just before the next bar). This kind of pattern drives the groove forward with anticipation (the bass often hits just before or just after the kick, creating syncopation).

The **chords** use a piano sound. We alternating between an A minor chord (A-C-E) and an A minor 7 (A-C-G, leaving E out for a bit of variation). They are placed such that one hits at the start of bar1, another at start of bar3, etc., giving a call-response feel across 2-bar loop. They have a bit of reverb to sit back in the mix.

We sidechained both bass and chords lightly to the kick to keep the mix clean (depth 0.3 is mild). You can increase that if you want a more pumping vibe.

**Live suggestions:** - **Filter the chords** for effect: e.g. c1.rlpf(slider(0.5)) and raise that slider to open up in a build. - **Vary the bassline**: try adding .sometimes(add(12)) to occasionally jump an octave, or change pattern to "a1 ~ a1 a1 ~ a1 a1 g1 ~" for a different riff. - **Drops:** Mute the kick by setting d1 to an underscore (or using the UI mute if any). Let the hats and chords play, maybe increase reverb on chords (c1.room(1)) for a big space, then slam the kick back in and reduce room. - You can also play with **swing** amount: try .swingBy(0.25,8) for a heavy shuffle on hats, or none for a straighter feel.

House is also about subtle modulation – maybe put a tremolo on a pad or automate pan(rand) on hats to widen. The possibilities are many.

## 5.2 Drum & Bass

Drum & Bass (DnB) is fast (generally 165–175 BPM) with breakbeat-driven drums and heavy basslines. We’ll aim for ~170 BPM. A key characteristic is the **“amen break”** style rhythm or two-step pattern, and **deep Reese bass** or sub bass.

**Time/Tempo:** We use setCpm(170/4) (so one cycle = 4 beats at 170 BPM). DnB often uses 1 cycle = 1 bar of 4/4.

**Drum patterns:** - **Backbone:** Kick on beat 1, snare on beat 2 and 4 (i.e., 2 and 4 of the bar). That’s the skeleton two-step. - However, DnB breaks usually add **ghost snares** (lighter hits) and extra kicks. For example, an amen break pattern: kicks at 1 and “3&”, snares at 2 and 4, plus ghost snare around 3. - The provided snippet earlier had: Kick at 1, (optional ghost at 7/16), kick at 10/16, snares at 4 and 12. That’s a common pattern. - We can either *program these with one-shots* or *use actual break samples*. Strudel’s default includes some breaks (e.g. amen:0 from the Dirt-Samples if loaded, or samples('yaxu/clean-breaks')). Using break samples and chopping them via .scrub() or loop() is another approach. - For illustration, I’ll show one pattern using one-shots, and one using a break sample.

**Basslines:** - DnB bass (“bassline”) often is a **Reese**: a detuned saw wave or similar with heavy filtering, or a sub layered with distorted mid. - We can approximate a reese by using supersaw or sawtooth with .rlpf and maybe slight .detune or phase modulation. The example snippet’s bass used supersaw!8 at low notes with rlpf and lpenv. - Patterns: DnB bass patterns can be minimal (long held sub notes) or rapid alternating (stabs in syncopation). A common pattern is to hit on the first beat (along with kick), then have a syncopated hit later in bar (like “and of 3”). - We might do something like notes on 1 and 3&, or 1 and 4, depending on sub-style (rolling vs stepping). - The scale is often just minor or even just root-fifth; sometimes a chromatic approach for dark vibe.

**Sound design & FX:** - Use supersaw for a thick bass, low octave, filter it. Add distort or shape for grit. If you want it to wobble, modulate filter or use phasor/flanger. - Could also use pulse with FM for a more modern neuro bass. - Another element: **pads or atmosphere** (some DnB, especially liquid, has ambient pads). - Use delays and reverbs on select hits (like a dubby echo on a vocal sample or snare). - **Amen break slicing:** If using break samples, Strudel’s .scrub() with patterns can slice. E.g. s("amen:0").scrub("<0 0.25 0.5 0.75>") to pick break quarters, etc. Or use .loop() to play the loop fully.

**Arrangement:** - DnB often has an intro without full drums (just atmos and maybe filtered break), then “drop” where the main break and bass slam in. - Filter sweeps: often filtering the break high-pass up before drop (then removing HP to bring full drums). - Use hpf on drums in intro, then off at drop. - Build-ups: could use rise sample or noise risers (pulse with rising pitch). - Keep an eye on volume – DnB is loud and proud, but sidechain the bass heavily to kick/snare so they punch.

Now two patterns:

### Pattern 1: Dark Roller (moody, minimal)

We’ll program a simple two-step beat with ghost hits and a rolling reese bass.

// --- DnB Pattern 1: Dark Roller ---  
setCpm(170/4)  // ~170 BPM, 4/4 DnB tempo

// Drum kit (using one-shots from TR909 for simplicity, though real DnB might use break samples)  
const bd = s("bd:4 <bd:4*0.5 ~>").bank("RolandTR909").gain(0.9)  
  .orbit(2);  
// Kick pattern explanation: uses alternate < ... > such that first cycle it's bd, second cycle the bd is half-speed (maybe a quick double) then rest. This might emulate a double kick occasionally.

const sn = s("sd:4!2 ~ sd:4 ~").bank("RolandTR909").gain(0.8)  
  .orbit(2);  
// Snare on beats 2 and 4: "sd:4!2" means two snares per cycle, then I manually put rests to align them at 2 and 4.

const ghost = s("sd:4*4").bank("RolandTR909").gain(0.3).hpf(2000)  
  .offset(0.75).orbit(2);  
// A ghost snare: here I'm reusing sd:4 but high-pass filtered (so it's just a tick). .offset(0.75) puts it midway between beat 3 and 4 (i.e., 3.75, a common ghost spot).  
// gain low and hpf high, so it's subtle.

const hat = s("hh*16").bank("RolandTR909").gain(0.4)  
  .orbit(2);  
// Hi-hats on 16th constant just to fill rhythm. We could also do ride on 8ths etc. For darker vibe, keep hats light.

// Bass: Reese bass using supersaw  
const reese = s("supersaw").note("a1 ~ a1 a1 ~ g1 ~ f1 ~")  
  .rlpf( slider(0.7) )   // cutoff slider to tweak  
  .lpenv(2)              // some envelope to filter for attack  
  .decay(0.15).sustain(0.1).release(0.5)  // envelope shape for amplitude  
  .gain(1).orbit(3);  
// Pattern: a1 hits on beat1, then 3& (the "a1 a1" around beat 3), then g1 maybe on beat 7, f1 on beat 8?   
// Actually "g1 ~ f1 ~" means g1 on step 7, f1 on step 9? I need to be careful: I used 8-step notation here. Possibly easier: treat each item as 8th note:  
// a1 (beat1), ~ (beat1&), a1 (beat2), a1 (beat2&), ~ (3), g1(3&), ~ (4), f1(4&).  
// So bass hits: bar 1: A, bar1&: -, bar2: A A (two 8th in a row), bar3: -, bar3&: G, bar4: -, bar4&: F.   
// This gives a rolling but syncopated line. Adjust as needed for musical sense.

// Add some grit to bass  
reese.shape(0.3)  // waveshape distortion  
reese.duck("2").duckdepth(0.7)  // heavy ducking on kick+snare orbits

// Master sidechain: orbit2 (drums) duck orbit3 (bass) to emphasize drums  
// Actually we ducked in bass already. Could duck the pad if we had one.

// Putting it together:  
stack(bd, sn, ghost, hat, reese)

**Notes:** This uses a 909 kit which isn’t typical for DnB (normally you'd use break hits or more acoustic break samples), but the pattern logic is DnB-like. The ghost snare is implemented by reusing the snare sample but filtering it to sound lighter (because we don't have velocity here, filtering is a way to simulate ghost softness). It's placed at 3.75 beat via .offset(0.75) after beat 3.

The hi-hats are just running 16ths – in a real roller, might use a shuffled break or rides. We could add slight randomization to velocity by doing .gain(brandBy(0.1)) on some hats for variation, or using .degradeBy to drop some hits.

The bass uses supersaw for that phasing detuned sound. We apply rlpf with a slider (so you can open/close filter live – try turning it down to 0.3 for muffled and up to 0.9 for bright). lpenv(2) with default envelope times gives a bit of filter attack. We also used .shape(0.3) to distort it, making it growly. Amp envelope is a bit sustained with release, so notes overlap slightly for a continuous flow (release 0.5 means tails hang on a bit).

We ducked the bass heavily (duckdepth(0.7)) on drums (kick+snare orbit2) which is very common in DnB to allow drums to punch through the bass.

**Live suggestions:** - Adjust filter slider on bass to create movement (common to do filter modulations). - Mute the ghost and hats for a minimal break, or conversely, you could swap out the drum pattern to an amen loop: - For instance, replace all drum code with:

s("amen:0").loop(1).cut(2).gain(1.2).orbit(2)

And maybe .hpf(slider(0,0,2000)) to sweep the break. - That one-liner will just loop the amen break at full speed. - .cut(2) might cut it in half if it’s 2 bars originally (not sure if amen:0 is one bar or more). - Or use .seg(1) for one loop per cycle. - To slice manually: .scrub("<0 0.25 0.5 0.75>") might rearrange quarter segments for variation. - Add an **atmospheric pad** on orbit4 with reverb for background, e.g. note("a3 e4 g4").sawtooth().slow(4).gain(0.3).room(0.8) (just ensure to lowpass it to not conflict). - For transitions, try **high-pass filtering** the drums before drop:

bd.hpf( slider(0) ); sn.hpf( slider(0) ); ghost.hpf( slider(0) );

Then you have one slider controlling HPF (0 = no HPF, 1 = full cut). In a breakdown, raise it to thin out drums, then drop to 0 right on the drop. - Similarly, can modulate reese.lpf to create that classic filter wobble. Or even automate it: reese.lpf(sine.range(0.3,0.8).slow(8)) to have it slowly wobble cutoff.

### Pattern 2: Liquid DnB (lighter, melodic)

For a contrast, let’s do a liquid funk vibe: smoother drums, a rolling sub bass, and some melodic elements.

// --- DnB Pattern 2: Liquid Funk ---  
setCpm(174/4)

// Drums via sample break (for authenticity)  
d$:  
  s("amen:0").loop(2).cut(1)   // play amen break looped over 2 cycles  
    .hpf("<0 200>/8")         // subtle moving HPF to avoid mud (alternates between 0 and 200 Hz cut)  
    .gain(1).orbit(2)

// Alternate approach: Use individual hits for clarity (if amen not loaded):  
// const kik = s("bd:4!4 [bd:4]*<0 0.5>").bank("RolandTR909").gain(0.8).orbit(2)  
// const snr= s("sd:2!2").bank("RolandTR909").offset(0.25).gain(0.7).orbit(2)  // offset 0.25 -> place on 2 and 4  
// const hats= s("hh*8").bank("RolandTR909").gain(0.3).orbit(2)  
// stack(kik, snr, hats)

// Bassline (rolling sub)  
b$:  
  s("sine").note("d1 d1 d1 d1, a1 a1 a1 a1")  // two bars: D then A (a simple 2-note bassline)  
    .legato(1)          // make notes stretch to next (continuous sub)  
    .gain(1.2).orbit(3)  
    .hpf(30)            // cut inaudible subsonics  
    .rlpf(0.4).lpenv(1) // lowpass to remove high harmonics, slight env to give attack  
    .duotone(2)         // Strudel trick: duotone might add an octave layer, if exists (just an idea)

// To note: using .sine with a pure tone and legato on a bass like this yields a clean sub.   
// If need more harmonics for small speakers, add .overdrive or mix in a saw at -1 octave.

// Chord pad  
p$:  
  note("d3 <f3 a3>").superpwm()   // hypothetical super pulse width mod synth or just use supersaw  
    .cutoff(800).pan(rand*0.2+0.4)  // fixed filter and slight random pan per event  
    .attack(0.5).decay(4).sustain(0.8).release(2)  // long envelope  
    .room(0.7).size(0.9).gain(0.4).orbit(4)  
    .every(4, n => n.offadd(7))    // every 4 cycles, transpose +7 (dominant variation)

// Explanation: playing root D3 chord and alternating second note between F and A (minor -> relative major maybe).  
// It's a long pad with reverb. .offadd(7) means add 7 semitones to notes on alternate cycles (nice variation).

// High melodic riff (e.g. piano or sample)  
m$:  
  note("<a4 ~ b4 ~ g4 ~ e4 ~>%%4").s("electric_piano")   
    .cut(4)  // ensure notes are short  
    .delay(0.5).gain(0.3).orbit(5)  
// This patterns a little scale run in D minor across 4 cycles, delayed so it hits on off-beats.

// Sidechain pad and melody to drums a bit  
p$.duck("2").duckdepth(0.4)  
m$.duck("2").duckdepth(0.2)

// Put together  
stack(d, b, p, m)

This one is more advanced in using loops and such: - We loaded amen:0 loop over 2 cycles. So it will play the whole amen break pattern over 2 cycles (which might be one bar length? Actually amen is typically 4 bars, but we use cut(1) to cut to 1 cycle? If not sure, I provided an alternative to use one-shots). - The bass uses sine for a clean sub in D. It alternates D and A root notes every bar (two bars of D, two bars of A). legato(1) ensures it sustains full length to next note, making it continuous. This is a simple rolling sub. - The pad (p$) uses maybe a hypothetical synth (we might just use supersaw again or a sample). Let’s assume superpwm is some available synth that gives a nice pad (if not, use supersaw or even s("wt_pad") if you loaded waveforms). It plays D3 and alternates between F3 and A3 (giving a minor to major lift). It has long envelope and big reverb. We used an every(4, offadd(7)) which will, every 4 cycles, offset notes by +7 semitones, so one repetition it might play D-F, next time D-F an octave up basically for variation. - The melodic riff (m$) is an electric piano doing a little phrase. The pattern "<a4 ~ b4 ~ g4 ~ e4 ~>%%4" likely is using %%4 step rotation or sampling – I'm trying to indicate a repeating pattern of those notes with rests, but might be overkill. Simpler: just define a pattern manually: - Could do note("a4 ~ b4 ~ g4 ~ e4 ~").fast(2) to make it an 8-step pattern over 4 cycles (this will play an arpeggio slowly). - I put delay(0.5) to shift it half a cycle, so the notes don’t land exactly on the beats, making it more jazzy. - Then sidechain pad and melody a bit to drums to keep them from muddying the snare.

**Sound check:** If amen:0 isn't present, use the fallback one-shots (kick, snare, hat) as commented, or any break sample you have.

**Performance:** - Use d.hpf(slider(0,0,1000)) to filter break in intro, drop to 0 at drop. - Filter the sub bass: it’s pure sine, so not much to filter except maybe volume. If you want that classic LFO wobble, you could modulate .gain slightly or do pitch vibrato with .vibrato(8).vibdepth(0.03). - The pad’s .cutoff(800) is static – you could modulate a filter on pad if needed. Or even put .lpf(sine.range(400,1200).slow(16)) to evolve pad brightness. - Mute the pad and melody in a breakdown, let sub and drums solo, then bring them back. - If using break sample, maybe use .striate(16) to granular stretch it sometimes for effect, or .beatRepeat (if present) to chop.

Drum & Bass is a huge genre; these are just small examples. The key takeaways are: fast breaks, powerful sub bass, and use of filters/FX to manage energy.

## 5.3 Acid House

Acid House revolves around the sound of the Roland TB-303: a squelchy resonant bassline. It’s usually around 120–135 BPM (so similar tempo to house, but the basslines are more frenetic 16th-note patterns). Drums are often simple (4/4 kicks) to highlight the 303.

**Rhythms:** Drums like classic house (4-on-floor, with maybe an 808/909 kit). The difference is the bassline (the 303) is very busy rhythmically – usually a pattern of 16th or 8th notes with slides and accent (accents we can mimic by velocity or note jumps, slides we can mimic by overlapping notes or portamento).

**Bassline patterns:** Typically one or two bars repeated, often in a single key or moving between a couple of notes of a scale. E.g. an acid pattern might revolve around a scale like A minor pentatonic or just a few scale degrees (the 303 was often programmed with a few knobs moves, leading to repeating hooks).

We’ll craft two acid loops: - A classic one: repetitive, maybe just jumping octaves of one note and a second note, with a lot of resonance. - A modern acid-tech pattern: faster or with more distortion.

**Sound design (303 emulation):** - Use acidenv! The code earlier gave acidenv(x) which sets up filter envelope etc. We should use that to get that squelch. - Start with a square or saw wave at appropriate pitch (TB-303 was a saw or square oscillator). We can try s("square") or s("sawtooth"). - The 303 filter has high resonance – we might want .lpq(0.9) or use the ladder filter by .ftype('ladder'). - If we want glide (slides), that’s tricky: one approach is to overlap notes or use .legato plus maybe a portamento effect if Strudel had one. There's .slide() in ZZFX maybe, but not sure in WebAudio basics. If none, we can approximate slides by having no release (so notes overlap) plus maybe an LFO on pitch, but let’s skip actual slides.

* Distortion: a crucial part of acid is running the 303 through overdrive or distortion. So we can use .shape() or .distort() to taste.

**Examples:**

### Loop 1: Classic Acid Loop

Let’s say key is C (C minor perhaps). Pattern focusing on 16th note movement, with some rests to shape rhythm.

// --- Acid Loop 1: Classic TB-303 style ---  
setCpm(130/4)

// Drum: simple house beat  
s("bd*4, hh*8").bank("RolandTR808").gain(0.8)  // Kick and hat pattern (kick 4x4, hats on offbeats)  
  .orbit(2)

// 303 Bassline:  
s("square").note("c4 c4 g4 c5 c5 c5 c4 c4  c4 c4 g4 g4 c5 c4 ~ ~")  
  .acidenv(1)          // acid envelope full  
  .lpq(0.85).ftype("ladder")  // high resonance ladder filter  
  .decay(0.2).release(0.1)    // short amp (notes somewhat separate)  
  .gain(1).orbit(3)  
  .shape(0.2)          // slight distortion  
  .legato(0.5)         // maybe helps overlap notes slightly for pseudo slide  
// Explanation: Pattern is 16 steps (two cycles of 8 steps shown with space).  
// It's mostly C and a bit of G (the fifth), jumping an octave up to C5 occasionally.   
// ' ~ ~' at end gives a rest gap for phrasing.  
// Play with pattern to your taste; acid patterns often are trial & error! Use off beats and octave jumps.

// Add slide effect by overlapping notes slightly:  
s("square").note("c4_0.9 c4_0.9 g4_0.9 ...")   
// The _0.9 (if Strudel supports suffix for note length > step) could sustain into next step to simulate slide.

// We keep it simple here. The sound with acidenv, high resonance, and slight distortion should scream acid.

**This loop’s breakdown:** - Drums: just using an 808 kick and open hat on offbeats for a minimal foundation (you can add snare/clap on 2,4 if desired). - Bass: We chose square wave; could try sawtooth and see which sounds better. .acidenv(1) sets full filter env mod. Ladder filter type with Q ~0.85 yields a squelchy filter. The note pattern: it’s basically C and G with some Cs an octave higher (C5) to add excitement. You can vary it: - Maybe use irand or some pattern transformation to evolve it over time. - The rests at the end let the phrase breathe (if it’s all nonstop 16ths, sometimes leaving a couple of rests each bar accentuates the pattern). - Overlap: In code, I commented a trick using note length notation if Strudel allowed. Not sure if note("c4_0.9") works. If not, one could simulate slide by using .legato close to 1 (makes notes sustain into each other) plus maybe .portamento(time) if available. Perhaps skip this as Strudel doesn’t explicitly mention portamento, though maybe slide param in ZZFX.

**Play with:** - The acidenv(x) amount: try lower, like .acidenv(0.5), which will make filter env less deep, for a mellower acid line, or set to 1 for full squelch. - The pattern itself: experiment adding other notes like minor 3rd (Eb) or others to see how it sounds. - For performance: filter cutoff could be controlled manually too. Right now acidenv drives it per note. But you can do slow sweeps by adjusting base cutoff (which rlpf(.25) did in acidenv code). We hardcoded .rlpf(.25) inside acidenv. Could mod that by slider: - Perhaps define register('acidbase', x=> pat.rlpf(x)) if needed; or simpler, just add another filter after: .lpf(slider(0.2)) to overall pattern to move base cutoff.

### Loop 2: Modern Acid Techno Pattern

This will be a bit more aggressive: faster pattern or higher resonance and more distortion, maybe at 140 BPM and with a heavier kick.

// --- Acid Loop 2: Ravey Acid Techno ---  
setCpm(138/4)

// Drums: big 909 kick with clap every 2nd beat for techno vibe  
d1 $: s("bd:1!4").bank("RolandTR909").gain(1).orbit(2)  
d2 $: s("cp:1!2").bank("RolandTR909").offset(0.25).gain(0.6).orbit(2)  
// (Kick on every beat, clap on 2 and 4)

d3 $: s("hh:1*16").bank("RolandTR909").gain(0.2).orbit(2)  // 16th closed hats (low volume)

// Acid bassline (aggressive)  
a1 $: s("sawtooth").note("a3 <a3 e4 a3 g3> a3 a3 a3 g3")   
       .acidenv(0.8)      // slightly less env, so we can manually open filter  
       .ftype("ladder").lpq(0.9)  
       .decay(0.15).release(0)  
       .shape(0.5)        // heavy distortion  
       .gain(1).orbit(3)  
       .jux(rev)          // funky: every other cycle, reverse the pattern (for variation)

// Use a slider to sweep filter:  
a1.rlpf( slider(0.3) )   // add a global filter base control (start fairly closed at 0.3)

// Perhaps add an LFO on filter for movement:  
a1.lfo(8, "lpf")  // (not sure if strudel has lfo, but maybe use tremolo in creative way if not)

// The pattern: "a3 [a3 e4 a3 g3] a3 a3 a3 g3".   
// This implies a run where in second position it plays a3-e4-a3-g3 quickly as 1/4 sub-beats (like a flourish).  
// jux(rev) will reverse the sequence every other cycle, giving a call-response feel.

stack(d1,d2,d3,a1)

**Explanation:** - We up tempo slightly, used 909 kit (punchier for techno). - The acid pattern is in A minor maybe (A and G mostly, and E4 for a spice). - We added .jux(rev) which is a trick: it will play the reverse of pattern on alternating cycles (like Tidal's jux). So one loop goes as written, next loop reversed. This can create interesting variations automatically. - Provided a slider for rlpf to control how open the filter is. With acidenv(0.8) plus base filter, you can do the classic acid trick of closing filter completely and then slowly opening it to bring the acid line in (everyone loves that). - Distortion at 0.5 on shape is fairly high, making it rasp. Ladder filter at high resonance should scream, especially as you open cutoff.

**Performance moves:** - Start with filter slider low (0.1 or 0.2) so you just hear muffled thud of acid. - Bring drums slowly (maybe start without clap, then add clap). - Then raise filter slider over 8 or 16 bars to reveal the acid line – that’s your big moment. - Use .delay(0.75) on the acid line occasionally or stutter it with something like .stutter(4) if you have it, to create fills. - Could automate accent: maybe do a1.gain("<1 0.7 1 0.7>*") to alternate loud/quiet notes if desired.

Acid is basically about that filter play and pattern repetition.

## 5.4 Techno

Techno is broad, but we’ll focus on two substyles: a raw warehouse techno loop (heavy kick, minimal patterns, maybe 130–135 BPM) and a dub techno loop (slower, lots of delay chords).

**Rhythm:** - **Driving Techno:** Kick every beat (heavy, maybe distorted). Often a rumbling bass which might be just the kick reverb or a low tom on off-beats. Hi-hats on off-beats, clap or snare optional or only as effect. Simplicity is key; interest comes from modulation (filter sweeps, etc.). - **Dub Techno:** Often 120–125 BPM, still 4/4 kick, but emphasis on deep chord stabs with heavy delay and reverb to create a swirling texture. The drums might be softer (808 style) and patterns more sparse.

**Basslines:** - In raw techno, the “bassline” might be just the kick or a synth repeating a note (maybe off-beat bass hits). - In dub techno, bass is subby and minimal (maybe just root notes sustaining).

**Timbres:** - Raw: distorted 909 kicks, 909 rides (the open 909 hat or ride can provide that top loop), claps with reverb for atmosphere. - Synths: short synth stabs or sirens for hooks, but often not melodic. - Dub: use analog-style chords (like the famous dub techno chord – minor chord through a delay with filtering). - Effects: delay (ping-pong) on chords, lots of reverb for space. - Filter automations on everything (hi-pass sweeps, etc.) to build tension.

Let’s do:

### Loop 1: Raw Warehouse Techno

// --- Techno Loop 1: Raw Warehouse ---  
setCpm(132/4)

// Drums  
d1 $: s("bd:9!4").bank("RolandTR909").gain(1).orbit(2)  
      .shape(0.3)            // distort the kick a bit  
d2 $: s("cp:9!4").bank("RolandTR909").gain(0.2).orbit(2)  
      .reverb(0.5)           // clap every beat, but low in mix with reverb tail  
d3 $: s("oh:9*4").bank("RolandTR909").offset(0.5).gain(0.5).orbit(2)  
      .hpf(200)              // open hat on off-beats, high-passed to be ticky

// Bass rumble: using a low tom or sub tone on offbeats  
b1 $: s("lt:9*4").bank("RolandTR909").offset(0.5).gain(0.8).orbit(3)  
      .lpf(100).shape(0.4)   // low-pass and shape distortion to make it rumbly  
// This uses low tom sample on off-beats (offset 0.5 from beats), lowpassed to remove click, distorted to add rumble.

// Synth hook (some repetitive rave stab)  
s1 $: s("pulse").note("a4 ~ ~ a4 ~ ~ a4 a4").decay(0.2).release(0)  
      .gain(0.6).orbit(4)  
      .delay(0.25).feedback(0.5)   // give it a quarter-note delay echo  
      .lpf(800)                    // tame harshness  
      .shape(0.2)                  // slight drive  
      .every(8, n => n.detune(12)) // every 8 cycles, detune it an octave up for effect

// The synth here is a pulse wave hitting A4 in a pattern with some gaps and one double at end.   
// Delay gives it a tail that fills space.   
// .every(8, detune(12)) kicks it up 12 semitones (one octave) every 8th repetition as a riser.

// Arranging layers  
stack(d1,d2,d3,b1,s1)

**Interpretation:** - Kick (bd:9 is maybe a 909 with more oomph). - Clap on every beat (just to add room noise, quiet). - Off-beat open hat for the groove (HPFed to not clash with kick). - Rumble bass: a common trick in production is to send kick to reverb and lowpass to make a rumble. Here we simulate with a low tom on off-beats, lowpassed and distorted to sound like a continuous bass when combined with kick. (Orbit 3 so you could EQ it separate). - A synth hook: just a repetitive pulsing note with delay. Could be like a minor third above root to give a dark vibe. We added a periodic octave jump to create a climactic effect every so often. - All of this should yield a relentless groove.

**Things to modulate:** - Overall filter on synth (.lpf) to push it back/bring it out. - The detune I did manually; you could also slide the note: maybe .slide(0.1) to slide between A4 and A5 gradually if supported. - Could modulate shape on the bass rumble to adjust aggression. - Mute/unmute clap to change feel (clap on every beat is unusual; maybe put it on 2&4 instead to be normal: offset(0.25) as done actually placed on 2,4? Actually cp:9!4 with offset 0.25 = clap also on all quarters but shifted to align with snare positions? Actually offset 0.25 will put claps at 1.25, 2.25, etc. So that's on off quarter-beats, not exactly 2 and 4 – might not be intended. Perhaps better to do cp:9!2 and offset 0.25 to do just 2 and 4. Let’s correct that in code.) Actually, in code I have cp:9!4 which repeats clap 4 times in cycle, offset 0.25 means at 0.25, 1.25, 2.25, 3.25 – which is quarter-beat after each kick. That might create a flam effect after each kick – interesting, but if unwanted, do cp:9!2 and offset 0.25 (puts claps on beats 2 and 4). I'll leave as is for unique sound.

* The hat oh:9*4 offset 0.5 is correct for off-beats.

### Loop 2: Dub Techno Loop

// --- Techno Loop 2: Dub Techno vibes ---  
setCpm(120/4)

// Drums: softer, 808 style  
d1 $: s("bd:0!4").bank("RolandTR808").gain(0.8).orbit(2)  
d2 $: s("hh:1*8").bank("RolandTR808").gain(0.3).orbit(2)  
      .swing(8)  // give slight swing  
d3 $: s("cp:0!2").bank("RolandTR808").offset(0.25).gain(0.2).orbit(2)

// Bass: deep sub on root (just long drones)  
b1 $: s("sine").note("g1").gain(0.5).orbit(3)  
      .decay(2).sustain(1).release(1)  // long continuous note  
      .compressor(4)  // compress to even out  
      .hpf(30)        // cut sub-sub frequencies

// Chord stab: classic dub chord (like Gm9 perhaps)  
chord = note("<g3 bb3 d4 f4>").s("organ")   
      .decay(0.5).release(0.2).gain(0.4).orbit(4)  
      .delay(0.375).feedback(0.7).cutoff(1200)  // ping-pong delay at 3/8th (off-beat delay), heavy feedback  
      .room(0.5).size(0.8)  
      .every(4, offadd(2))  // every 4 cycles, transpose chord up a whole tone for variation

// The chord is Gmin7. Ping-pong delay (3/8 offset gives a syncopated echo).  
// It's set to repeat and swirl with reverb.

// Additional noise sweep or texture:  
noise = s("brown").pan(0.5).gain(0.1).orbit(5)  
      .hpf(sine.range(200,2000).slow(16))  // slowly sweep a high-pass on noise  
      .room(0.4)

// Put it all together:  
stack(d1,d2,d3,b1,chord,noise)

**What’s happening:** - 808 drums laidback, slight swing on hats. - Bass is just a continuous G1 sine (the key of G minor chosen arbitrarily). It’s basically a constant sub drone. - Chord: an organ (or any synth pad) hitting a G minor chord. Delay at 3/8 of a beat creates a classic dub techno bounce (the chords echo off-beat). We used quite high feedback so it creates a wash. Reverb also applied moderately. - We put every(4, offadd(2)) which will raise the chord by 2 semitones every 4 cycles, so you get a subtle progression: Gmin, then Amin, then back, etc., keeping interest. - Added a brown noise layer (brown noise is low-frequency noise) that has a high-pass that moves slowly with a sine LFO. This creates a wind or ocean-like background that changes over time, adding depth. It’s subtle (gain 0.1), just ear candy.

**Live controls:** - Filter on chord if needed to mellow further, or increase cutoff for brightness occasionally. - You can drop out the kick and just leave chords and noise for a dreamy breakdown, then bring kick back. - Maybe modulate delay feedback live – increasing it for a wash then lowering to normal. - The noise high-pass is automated but you could also manually do something similar with a slider for one-off sweeps (like wind noise rising). - Emphasize the 4-to-the-floor by adding a muted stab on the kick: sometimes dub techno producers have a percussive stab on each beat quietly. We have clap on 2 and 4 quietly, which is fine.

Each of these techno loops can be building blocks; the real performance in techno is about layering and modulating over time (for instance, gradually raising resonance on that dub chord’s delay or such).

---

That concludes the genre-specific patterns. We’ve covered House, DnB, Acid, and Techno with a couple examples each. Remember, you can always combine ideas (maybe you want an acid line over a house beat, or a techno rumble in a DnB track – why not!).

# Practical Workflow & Performance Tips

Finally, let’s discuss **how to actually use Strudel live** effectively:

**Starting Simple:** When live coding, a good strategy is to start with a basic loop and build complexity gradually. For instance, begin with just a kick and bass pattern. Once that’s steady, layer in hats, then chords, etc. In Strudel, you can do this by either typing new stack() components or by defining patterns with labels so you can toggle them:

* Use **labeled statements** ($: labelName = pattern) so you can evaluate them separately[[63]](https://strudel.cc/learn/strudel-vs-tidal/#:~:text=The%20Strudel%20REPL%20does%20not,to%20mute). For example:

* $: drums = s("bd*4").bank("TR909");  
  $: bassline = s("sawtooth").note("c2 c3 c2 c2")...

* Then you can comment/uncomment $: drums line to mute/unmute drums (or use the REPL UI’s mute _ feature by prefixing label with _:).

* Start with slower **cpm** and simple patterns if you’re not comfortable, then speed up or complicate after. You can change tempo on the fly with setCpm (just be cautious, big jumps might sound odd unless that’s the effect you want).

**Live Controls:** Strudel’s slider() function is your friend for performance. We’ve used it in examples to control filter cutoff (slider(x) we put inside rlpf) or other FX. Use sliders for: - Filter cutoffs (rlpf, rhpf). - FX sends like .room() (though no direct slider for those, you can pattern them with something like .room(slider(...))). - Dry/Wet of effects like .delay (or .delaytime etc.). - Pattern densities or probabilities (e.g. you could n("bd*<4 8>").slow(slider(1,4,8,1)) if slider could output integer; that might be tricky, instead use an if/then approach or prepared variations toggled by slider via pick).

Also consider the **MIDI or keyboard** input if any (Strudel can take input devices) to map slider or triggers, but that’s outside this text scope.

**Structuring a set:** - You might code in sections (intro, main drop, breakdown, etc.) and comment/uncomment or gradually evolve patterns. Use functions like iter, jux, hurry to alter patterns as performance goes on. - The every function is great for live variation. E.g. .every(16, rev) to flip a pattern every 16 cycles gives a nice fill. Or .sometimes to occasionally apply an effect (like .sometimes(n => n.cut(2)) to randomly cut pattern in half sometimes).

**Avoiding Clipping:** Keep an eye on combined volume. Some tips: - Use .gain( ) to lower layers if many play at once. E.g., stacking a loud break and a loud bass can clip – reduce each a bit (.gain(0.7) perhaps). - The setGainCurve(x=>x**2) we saw helps the master volume behave (so peaks aren’t too abrupt). - duck is practically sidechain compression – use it to carve space for kick and snare. We did this heavily in DnB. In house/techno, a mild duck on pads/bass can also glue the mix. - If still clipping, apply .compressor(threshold) on the master if available or reduce overall volumes.

**Debugging Patterns:** - If something isn’t sounding: use .log() to see events (as mentioned)[[64]](https://strudel.cc/learn/code/#:~:text=So%20far%2C%20we%E2%80%99ve%20seen%20the,following%20syntax). Or isolate pattern parts by muting others. - Common pitfall: forgetting to call .orbit on separate layers – then they all go to orbit1 and might override effect params. Always assign different orbits for elements that need separate effect sends (like we did for bass vs drums). - Another pitfall: sample not playing first time (due to lazy load). If a sample is silent first hit, just give it a moment or retrigger. You might pre-load crucial samples by playing them once inaudibly (like s("bd:0").gain(0) at start).

**Use Visual Feedback:** The REPL has ._scope() or ._pianoroll() etc. Attach ._scope() to your master stack or an orbit to see waveform – useful to tune ducking or see if you’re clipping (flat-topped wave = clipping likely).

**Save your patterns:** The Strudel REPL likely allows saving/sharing code (some have a share URL). Even if live coding, having some prepared patterns to switch to can be life-saving if you get stuck. You can copy-paste from a “cheatsheet” (like the one we’ll outline next) on the fly.

Finally, **be creative and have fun.** Live coding is improvisational – if an idea strikes (like applying .jux(hurry(2)) to double tempo one layer), try it! Strudel’s quick feedback lets you experiment. And if you get a wild, chaotic result, you can always back out or quickly mute that part and recover.

Now, to wrap up, let’s summarize key bits in a quick reference format.

# Strudel Quickstart Cheatsheet

**Basic Pattern Functions:** - s("x y z") – play samples or synths in sequence (space-separated events)[[5]](https://strudel.cc/learn/sounds/#:~:text=We%20can%20play%20sounds%20with,in%20two%20different%20ways). - n("0 4 7") – numeric pattern (use .scale() or pair with s()). - stack(pat1, pat2, ...) – layer patterns simultaneously. - Timing modifiers: - .fast(2) (speed 2x)[[65]](https://strudel.cc/learn/time-modifiers/#:~:text=speeds%20up%20a%20pattern%20like,twice%20as%20fast), .slow(2) (half-speed). - .segment(n) – sample pattern at n steps per cycle (good for signals)[[51]](https://strudel.cc/learn/time-modifiers/#:~:text=segment). - .offset(0.5) – delay pattern events by 0.5 of their interval. - .swing(n) – apply shuffle (delay second half of subdivided beat)[[66]](https://strudel.cc/learn/time-modifiers/#:~:text=swingBy). - Mini-notation: - Space = next step; comma = parallel (layer)[[67]](https://strudel.cc/workshop/first-sounds/#:~:text=Play%20sequences%20in%20parallel%20with,comma). - ~ or - = rest[[9]](https://strudel.cc/workshop/first-sounds/#:~:text=sound%28%22bd%20hh%20,bd%20hh%20rim). - [ ] – group subpattern in one step (play faster)[[10]](https://strudel.cc/workshop/first-sounds/#:~:text=Sub). - < > – cycle through options each cycle[[68]](https://strudel.cc/workshop/first-sounds/#:~:text=brackets). - !* and !n – repeat event n times in cycle (e.g. bd!4)[[69]](https://strudel.cc/workshop/first-sounds/#:~:text=sound%28,rim). - ? after event – randomly skip it[[70]](https://strudel.cc/learn/effects/#:~:text=match%20at%20L937%20%60duckorbit%28). - Tonal functions: - .scale("root:mode") – map n() values to scale[[71]](https://strudel.cc/functions/value-modifiers/#:~:text=This%20group%20of%20functions%20allows,modify%20the%20value%20of%20events). - .add(n) / .sub(n) – transpose by n semitones[[72]](https://strudel.cc/functions/value-modifiers/#:~:text=add). - Chord: use list in note: note("[c e g]") (plays chord). - Random & conditional: - rand, perlin – continuous noise signals[[48]](https://strudel.cc/learn/signals/#:~:text=rand)[[47]](https://strudel.cc/learn/signals/#:~:text=perlin). - .sometimes(func) – sometimes apply func. - .every(k, func) – every k cycles, apply func to pattern[[55]](https://strudel.cc/learn/code/#:~:text=You%20can%20write%20your%20own,as%20a%20reusable%2C%20chained%20function). - .when(condPattern, func) – apply func when cond pattern is 1. - Orbits & mixing: - .orbit(n) – send pattern to orbit n (route audio)[[20]](https://strudel.cc/learn/effects/#:~:text=Orbits). - .duckorbit("x") or .duck("x") – sidechain duck orbit x[[22]](https://strudel.cc/learn/effects/#:~:text=Synonyms%3A%20). - .gain(x) – volume adjust. - setCpm(bpm/beat_per_cycle) – set tempo in BPM[[17]](https://strudel.cc/understand/cycles/#:~:text=,x%20%2F%2060).

**Common control parameters (audio effects):** - Filter: .lpf(freq) low-pass, .hpf(freq) high-pass. Also .bp(freq) bandpass. - Filter envelope: .lpenv(depth) sets filter env mod depth[[73]](https://strudel.cc/learn/effects/#:~:text=Synonyms%3A%20); use with .lpattack, .lpdecay, etc. for shaping filter sweep[[74]](https://strudel.cc/learn/effects/#:~:text=lpattack)[[61]](https://strudel.cc/learn/effects/#:~:text=lpdecay). - Resonance: .lpq(q) – filter resonance Q factor[[75]](https://strudel.cc/learn/effects/#:~:text=match%20at%20L240%20s%28,0%2010%2020%2030). - Envelope (amp): .attack, .decay, .sustain, .release – ADSR times/levels[[76]](https://strudel.cc/learn/effects/#:~:text=attack)[[77]](https://strudel.cc/learn/effects/#:~:text=decay). - .adsr("a:d:s:r") – set ADSR in one go[[78]](https://strudel.cc/learn/effects/#:~:text=adsr). - Delay: .delay(mix) – send to delay, .delaytime(time) – set delay time (0–1). .feedback(x) – feedback amount. - Reverb: .room(mix), .roomsize(x) – amount and size of reverb. - Distortion: .shape(amount) (waveshaper), .distort(amount) (probably another kind). - Pan: .pan(pos) – stereo pan (0 left, 1 right). - Tremolo: .tremolo(speed) or .am(freq) – modulate amplitude. - Vibrato: .vib(freq) and .vibdepth(depth) – pitch LFO. - Others: .coarse(bitrate), .crush(bitdepth) for bitcrush; .phasor(rate) phaser; .compressor(threshold).

*(Not all might be in default; refer to Strudel docs for full list, but above are common ones)*

**Time/Tempo mapping:** - 1 cycle = default 2 seconds (0.5 Hz = 30 cpm). - To set specific BPM: setCpm(BPM/4) if one cycle = 1 bar of 4 beats[[17]](https://strudel.cc/understand/cycles/#:~:text=,x%20%2F%2060). - e.g. 120 BPM: setCpm(120/4) (since 4 beats/bar). - If using different beats per cycle, adjust accordingly. - setCps(x) – set cycles per second directly (e.g. 0.5 for 120 if 4 beat/cycle).

**Muting and layering in live code:** - Prefix a label with _ to mute it (e.g. _$: drums = ...)[[63]](https://strudel.cc/learn/strudel-vs-tidal/#:~:text=The%20Strudel%20REPL%20does%20not,to%20mute). - Use separate labeled patterns so you can evaluate on/off easily. - Use comments // to temporarily remove a part during performance (Strudel supports re-evaluating code live, likely each eval replaces pattern).

**On-the-fly pattern variations (cheat sheet style):** - Increase density: .ply(2) – double each event[[79]](https://strudel.cc/learn/time-modifiers/#:~:text=ply); or *2 in mini-notation. - Create fills: .iter(4) or .iter(8) – slice pattern into pieces and cycle through them each cycle (cool for break fills)[[53]](https://strudel.cc/learn/time-modifiers/#:~:text=iter). - Drop out: use .offadd(-inf) on a pattern to make it silent (or simply mute label). - Transpose: .add(12) to shift octave. - Humanize timing: .delaytime(rand*0.01) to jitter events a bit.

Now some **genre recipe cards** – very brief setups:

## Genre Recipe Cards

**House (Recipe):** *Four-on-floor groove with funk.* - *Kick:* 909 bd every beat[[36]](https://strudel.cc/learn/samples/#:~:text=s%28). - *Snare/Clap:* Clap on 2 & 4[[36]](https://strudel.cc/learn/samples/#:~:text=s%28). - *Hi-hat:* Closed hat off-beats (e.g. s("oh*4").offset(0.5))[[80]](https://strudel.cc/learn/samples/#:~:text=s%28). - *Bass:* Simple 1-bar riff, syncopated (often on “& of 1” or “& of 3”). Use subby sine or FM bass. - *Sound:* Use .duck on bass with kick for pump[[70]](https://strudel.cc/learn/effects/#:~:text=match%20at%20L937%20%60duckorbit%28). - *Example Snippet:*

setCpm(125/4)  
s("bd*4").bank("TR909") // kick  
s("cp*2").bank("TR909").offset(0.25) // clap on 2,4  
s("hh*8").bank("TR909").gain(0.5) // 8th hats  
s("juno").note("A2 . A2 F2 . . G2 .") // bass pattern with rests  
  .duck("1:2").gain(0.8)

*(House tends to accent the off-beat hat and use jazzy minor 7 chords or filtered samples for melody.)*

**Drum & Bass (Recipe):** *Fast breaks and Reese bass.* - *Drums:* Use an amen break or one-shot pattern. Kick at 1 and 3&, snares at 2 and 4[[23]](https://strudel.cc/learn/effects/#:~:text=%60duckorbit%28) plus ghost notes. - *Bass:* Detuned saw (supersaw), lowpass with envelope (acidenv works too) for the “wobble”. Pattern: hit on 1, then syncopated hits (e.g. “& of 2” or “3e&”). - *Tempo:* ~170 BPM (setCpm(170/4)). - *FX:* Heavy sidechain to snare/kick on bass[[70]](https://strudel.cc/learn/effects/#:~:text=match%20at%20L937%20%60duckorbit%28). Maybe chorus on bass for width. - *Example Snippet:*

setCpm(172/4)  
s("amen:0").loop(1) // loop amen break  
s("supersaw").note("d1 . . d1 . a#1 . .") // Reese hits  
  .rlpf(0.2).lpenv(3).lpq(0.7) // low cutoff, env & resonance  
  .gain(1).duck("1:2").shape(0.3)

*(This yields a classic rolling Reese pattern in Dm; the break provides the rest.)*

**Acid House (Recipe):** *303 bass & simple drums.* - *Drums:* 808/909 kick 4x4, open hat off-beats, occasional snare. - *Acid Bass:* s("sawtooth").note("pattern").acidenv(1)[[81]](https://www.instagram.com/reel/DO03Ga1DUjd/#:~:text=,bd). Pattern often 16th notes with a few rests/slides. Use .ftype("ladder").lpq(0.9) for squelch[[58]](https://strudel.cc/learn/effects/#:~:text=,bpe). - *FX:* Delay on acid can be nice (but short feedback to not muddy). Overdrive it (.shape(0.4)). - *Example Snippet:*

setCpm(128/4)  
s("bd*4").bank("TR808")   
s("oh*4").bank("TR808").offset(0.5)  
s("square").note("c4 c4 g4 c5  c4 . c4 g4")  
  .acidenv(1).ftype("ladder").lpq(0.88)  
  .shape(0.3)

*(Acid pattern in C: bounces between C and G, with an octave jump to C5. Tweak filter cutoff live for that acid magic.)*

**Techno (Recipe):** *Driving 4/4 with hypnotic loop.* - *Drums:* 909 kick (possibly distorted). Offbeat percussion (clap or ride). - *Bass:* Could just be part of kick (rumble technique) or a low tom on off-beats. - *Hook:* A repetitive synth stab or high-frequency loop (could be a simple minor third riff, or even just a tonal beep on offbeat). - *Sound:* Lots of reverb on percussion for space. Use HPF sweeps to create rises (e.g. slowly HPF kick then drop). - *Example Snippet:*

setCpm(130/4)  
s("bd:9*4").bank("TR909").shape(0.2)  
s("cp:9*2").bank("TR909").offset(0.25).room(0.5)  
s("sine").note("a2").decay(0.05).every(8, n=>n.add(7))  
  .pan(0.2).gain(0.5) // blip synth with slight pitch mod

*(This gives a steady kick, clap on 2&4, and a sine “blip” on every beat (with an octave jump every 8 cycles). Add a rumble by duplicating kick at 0.5 offset, lowpassed.)*

**Dub Techno (Recipe):** *Slow, deep, and echoed.* - *Drums:* 808 kick (soft), maybe every other bar drop one for swing. Soft hats with swing. - *Bass:* Deep sub long notes (just a root drone). - *Chords:* The hallmark – minor chords through heavy delay and reverb. Use delay(0.5) or 3/16 for syncopation. - *FX:* Tape delay (high feedback) on chords, filter chords (LPF or tape wow using jitter). - *Example Snippet:*

setCpm(115/4)  
s("bd:0!4").bank("TR808").gain(0.7)  
s("hh*8").bank("TR808").gain(0.2).swing(8)  
s("sine").note("d1").gain(0.3) // sub drone  
note("d3 fs3 a#3 d4").s("organ")  
  .delay(0.375).feedback(0.6).room(0.4)  
  .cutoff(1000).lpf(sine.range(800,1500).slow(32)) // gentle filter motion

*(Chords: D minor chord with some voicing, delayed 3/8 with feedback to get that classic dub repeat.)*

**Custom Helper Library (useful helpers from our report):** - **acidenv(x)** – Applies a TB-303 style filter envelope (depth x) to a pattern[[81]](https://www.instagram.com/reel/DO03Ga1DUjd/#:~:text=,bd). Usage: s("saw").note("...").acidenv(1). (Internally does rlpf(.25) + quick env). Example: s("square").note("c c c e").acidenv(0.8). - **fill()** – Makes pattern events fill the space until next event (legato)[[62]](https://strudel.cc/learn/effects/#:~:text=Can%20vary%20across%20orbits%20with,2%3A3). Use on sparse patterns to sustain notes. Example: s("bd . sd .").fill() will sustain bd into sd. - **trancegate(density, seed, length)** – Rhythmic gating effect: chops pattern on/off at 16th notes, with given density (approx fraction on), repeat length, and random seed for pattern[[23]](https://strudel.cc/learn/effects/#:~:text=%60duckorbit%28). Use on pads or drones. Example: note("a4").sawtooth().trancegate(1.2, 42, 2) – will gate the note pattern in a repeating 2-cycle random pattern. - **grab(scale, pat)** – Quantize a melody to nearest notes of a scale[[38]](https://strudel.cc/learn/samples/#:~:text=In%20this%20example%20we%20assign,audio%20files%20on%20a%20server)[[40]](https://strudel.cc/learn/samples/#:~:text=Loading%20Samples%20from%20a%20strudel,file). Use for constraining random patterns. Example: n("0 2 5 7").grab([0,3,5,7]).s("sine") – snaps 0,2,5,7 to nearest in {0,3,5,7} (basically no change here), but if pattern had out-of-scale notes, they'd be corrected. - **mpan([orbits], amt)** – Move a pattern through multiple orbits and pan positions based on a 0–1 value (e.g. slider)[[81]](https://www.instagram.com/reel/DO03Ga1DUjd/#:~:text=,bd). Example: s("noise").mpan([2,3,4], slider(0)). As slider goes 0→1, noise will route from orbit2 (left) to orbit3 (center) to orbit4 (right). - **beat(steps, length)** – Step sequencer: specify hits by indices and length. Example: .beat("0,4,8,12",16) on a pattern will activate it on 0,4,8,12 out of 16 steps (like a typical 4/4 pattern). Simplifies writing long strings of "~". (Our implementation sketch used .struct internally.)

These helpers streamline common patterns: acidenv for instant acid sound, trancegate for rhythmic gating, etc.
