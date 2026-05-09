"""
Phase 1 验证脚本：测试 Vita 加载 .vital 预设并渲染音频
Usage: python test_vita.py
"""
import vita
import numpy as np
from scipy.io import wavfile
import time
import json
import os

SAMPLE_RATE = 44100
BPM = 120.0
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "test_output")

# 测试预设列表（每个大类选一个）
PRESETS = [
    "/Users/zhaozy/mnt/music/Vital/Factory/Presets/Plucked String.vital",
    "/Users/zhaozy/mnt/music/Vital/Afro/Presets/Banana Wob.vital",
    "/Users/zhaozy/mnt/music/Vital/Mr Bill/Presets/Honk Wub.vital",
    "/Users/zhaozy/mnt/music/Vital/Billain/Presets/Factory Presets/Cinema Bells.vital",
    "/Users/zhaozy/mnt/music/Vital/Databroth/Presets/Factory Presets/Fleet.vital",
    "/Users/zhaozy/mnt/music/Vital/Level 8/Presets/Factory Presets/Crescendo Bells.vital",
    "/Users/zhaozy/mnt/music/Vital/Yuli Yolo/Presets/Factory Presets/Keystation.vital",
]


def test_single_preset(synth, preset_path, notes=[48, 60, 72], velocity=0.7, 
                       note_dur=1.0, render_dur=3.0):
    """Test a single preset: load, render multiple notes, return results."""
    name = os.path.splitext(os.path.basename(preset_path))[0]
    
    # Load preset
    t0 = time.time()
    if not synth.load_preset(preset_path):
        return {"name": name, "status": "load_failed"}
    
    # Get version info
    with open(preset_path, 'r') as f:
        data = json.load(f)
        version = data.get('synth_version', 'unknown')
    
    # Render multiple notes
    all_audio = []
    for note in notes:
        audio = synth.render(note, velocity, note_dur, render_dur)
        all_audio.append(audio)
    
    elapsed = (time.time() - t0) * 1000
    
    # Combine all notes into one stereo file (sequential)
    combined = np.concatenate(all_audio, axis=1)
    rms = np.sqrt(np.mean(combined**2))
    
    return {
        "name": name,
        "version": version,
        "status": "ok" if rms > 0.001 else "silent",
        "shape": combined.shape,
        "rms": float(rms),
        "range": (float(combined.min()), float(combined.max())),
        "time_ms": elapsed,
        "audio": combined,
    }


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    synth = vita.Synth()
    synth.set_bpm(BPM)
    
    print("=" * 80)
    print("Vita Preset Rendering Test")
    print(f"Vita version: {vita.__version__}")
    print(f"Sample rate: {SAMPLE_RATE} Hz (default)")
    print(f"BPM: {BPM}")
    print("=" * 80)
    print()
    
    results = []
    for preset_path in PRESETS:
        if not os.path.exists(preset_path):
            print(f"  SKIP: {preset_path} (file not found)")
            continue
            
        result = test_single_preset(synth, preset_path)
        results.append(result)
        
        status_icon = "✅" if result["status"] == "ok" else "⚠️"
        print(f"  {status_icon} {result['name']:<30} v{result.get('version','?'):<5} "
              f"RMS={result.get('rms', 0):.4f}  {result.get('time_ms', 0):.0f}ms")
        
        # Save wav file
        if result["status"] == "ok":
            audio = result["audio"]
            # Transpose to (samples, channels) for wavfile
            wav_path = os.path.join(OUTPUT_DIR, f"{result['name']}.wav")
            wavfile.write(wav_path, SAMPLE_RATE, audio.T)
    
    print()
    print("-" * 80)
    ok_count = sum(1 for r in results if r["status"] == "ok")
    print(f"Results: {ok_count}/{len(results)} presets rendered successfully")
    print(f"Output WAVs saved to: {OUTPUT_DIR}")
    print()
    
    # Test multi-note rendering for pitch accuracy
    print("Pitch coverage test (C2 to C6, one preset):")
    synth.load_preset(PRESETS[0])  # Plucked String
    notes = list(range(36, 85, 4))  # C2 to C6 in major thirds
    for note in notes:
        audio = synth.render(note, 0.7, 0.5, 1.0)
        rms = np.sqrt(np.mean(audio**2))
        print(f"    Note {note:>3} (MIDI): RMS={rms:.4f} {'✅' if rms > 0.001 else '⚠️'}")


if __name__ == "__main__":
    main()
