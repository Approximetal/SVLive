#!/usr/bin/env python3
"""
Generate a test .vital preset file to verify vital2strudel.py works.
"""

import json
import gzip
import struct
import base64
import math
import os

def generate_saw_wavetable(num_frames=64, frame_size=2048):
    """Generate a simple morphing saw wavetable (saw → square over frames)."""
    all_data = []
    for f in range(num_frames):
        morph = f / max(num_frames - 1, 1)  # 0 to 1
        frame = []
        for i in range(frame_size):
            t = i / frame_size
            # Morph from saw to square
            saw = 2 * t - 1
            square = 1.0 if t < 0.5 else -1.0
            sample = saw * (1 - morph) + square * morph
            frame.append(sample)
        all_data.extend(frame)
    
    return struct.pack(f'<{len(all_data)}f', *all_data), num_frames


def generate_pad_wavetable(num_frames=32, frame_size=2048):
    """Generate a harmonic pad wavetable with evolving harmonics."""
    all_data = []
    for f in range(num_frames):
        morph = f / max(num_frames - 1, 1)
        frame = []
        for i in range(frame_size):
            t = i / frame_size
            sample = 0.0
            # Add harmonics that evolve over frames
            for h in range(1, 16):
                # Fade in higher harmonics as frame progresses
                amp = (1.0 / h) * (1.0 if h <= 3 else morph * 2)
                amp = min(amp, 1.0 / h)
                sample += amp * math.sin(2 * math.pi * h * t)
            frame.append(sample)
        
        # Normalize frame
        peak = max(abs(s) for s in frame) or 1.0
        frame = [s / peak for s in frame]
        all_data.extend(frame)
    
    return struct.pack(f'<{len(all_data)}f', *all_data), num_frames


def make_test_preset():
    """Create a test Vital preset JSON with realistic structure."""
    
    # Generate wavetable data
    saw_data, saw_frames = generate_saw_wavetable(64, 2048)
    pad_data, pad_frames = generate_pad_wavetable(32, 2048)
    
    preset = {
        "preset_name": "Test Ethereal Pad",
        "settings": {
            "preset_name": "Test Ethereal Pad",
            
            # OSC 1 — Saw wavetable with sync warp
            "osc_1_on": 1.0,
            "osc_1_level": 0.8,
            "osc_1_pan": -0.2,
            "osc_1_wave_frame": 0.35,
            "osc_1_distortion_type": 1,  # Sync
            "osc_1_distortion_amount": 0.4,
            "osc_1_unison_voices": 4,
            "osc_1_unison_detune": 0.3,
            "osc_1_unison_blend": 0.7,
            "osc_1_transpose": 0,
            "osc_1_tune": 0.0,
            "osc_1_random_phase": 1.0,
            
            # OSC 2 — Pad wavetable with fold warp
            "osc_2_on": 1.0,
            "osc_2_level": 0.5,
            "osc_2_pan": 0.2,
            "osc_2_wave_frame": 0.6,
            "osc_2_distortion_type": 7,  # Asymmetric → ASYM
            "osc_2_distortion_amount": 0.25,
            "osc_2_unison_voices": 2,
            "osc_2_unison_detune": 0.15,
            "osc_2_unison_blend": 0.5,
            "osc_2_transpose": 12,
            "osc_2_tune": 0.05,
            "osc_2_random_phase": 1.0,
            
            # OSC 3 — Off
            "osc_3_on": 0.0,
            "osc_3_level": 0.0,
            
            # Filter 1 — Low pass with envelope
            "filter_1_on": 1.0,
            "filter_1_model": 0.0,  # Analog LP
            "filter_1_cutoff": 72.0,  # MIDI note → ~523 Hz
            "filter_1_resonance": 0.35,
            "filter_1_drive": 0.2,
            
            # Filter 2 — Off
            "filter_2_on": 0.0,
            
            # Amp Envelope (env_1)
            "env_1_attack": 0.5,
            "env_1_decay": 1.2,
            "env_1_sustain": 0.7,
            "env_1_release": 2.0,
            
            # Filter Envelope (env_2)
            "env_2_attack": 0.1,
            "env_2_decay": 0.8,
            "env_2_sustain": 0.3,
            "env_2_release": 1.0,
            
            # LFO 1 — Slow modulation
            "lfo_1_frequency": 0.3,
            "lfo_1_sync": 0.0,
            "lfo_1_tempo": 4.0,
            "lfo_1_smooth_mode": 0,  # Sine
            
            # LFO 2 — Faster
            "lfo_2_frequency": 1.5,
            "lfo_2_sync": 0.0,
            "lfo_2_smooth_mode": 1,  # Tri
            
            # Effects
            "reverb_dry_wet": 0.45,
            "reverb_size": 0.75,
            "delay_dry_wet": 0.25,
            "delay_tempo": 0.375,
            "delay_feedback": 0.55,
            "distortion_mix": 0.1,
            "chorus_dry_wet": 0.15,
            
            # Modulation connections
            "modulations": [
                {
                    "source": "lfo_1",
                    "destination": "osc_1_wave_frame",
                    "amount": 0.3,
                },
                {
                    "source": "lfo_2",
                    "destination": "filter_1_cutoff",
                    "amount": 0.2,
                },
                {
                    "source": "env_2",
                    "destination": "filter_1_cutoff",
                    "amount": 0.5,
                },
                {
                    "source": "lfo_1",
                    "destination": "osc_1_distortion_amount",
                    "amount": 0.15,
                },
                {
                    "source": "lfo_2",
                    "destination": "osc_2_level",
                    "amount": 0.1,
                },
            ],
        },
        "wavetables": [
            {
                "name": "Saw Morph",
                "groups": [{
                    "components": [{
                        "type": "Wave Source",
                        "keyframes": [
                            {"wave_data": base64.b64encode(saw_data[i*2048*4:(i+1)*2048*4]).decode()}
                            for i in range(min(saw_frames, 8))  # Export 8 representative frames
                        ],
                    }],
                }],
            },
            {
                "name": "Harmonic Pad",
                "groups": [{
                    "components": [{
                        "type": "Wave Source",
                        "keyframes": [
                            {"wave_data": base64.b64encode(pad_data[i*2048*4:(i+1)*2048*4]).decode()}
                            for i in range(min(pad_frames, 8))
                        ],
                    }],
                }],
            },
            {
                "name": "Empty",
                "groups": [],
            },
        ],
    }
    
    return preset


if __name__ == "__main__":
    preset = make_test_preset()
    
    # Save as gzip JSON (.vital format)
    output_path = os.path.join(os.path.dirname(__file__), "test_ethereal_pad.vital")
    json_bytes = json.dumps(preset).encode('utf-8')
    
    with gzip.open(output_path, 'wb') as f:
        f.write(json_bytes)
    
    size_kb = os.path.getsize(output_path) / 1024
    print(f"✅ Created test preset: {output_path} ({size_kb:.1f} KB)")
    print(f"   Name: {preset['preset_name']}")
    print(f"   Oscillators: 2 active (saw morph + harmonic pad)")
    print(f"   Filter: LP @ MIDI 72 with env modulation")
    print(f"   Effects: Reverb 45%, Delay 25%, Distortion 10%")
    print(f"   Modulations: 5 connections")
    print()
    print("Now run:")
    print(f"  python vital2strudel.py {output_path} --json")
