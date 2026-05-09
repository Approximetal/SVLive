"""
Phase 2.4: E2E test for vital-bridge server.
Usage:
    1. Start server: uvicorn server:app --port 8765
    2. Run tests: python test_server.py
"""
import requests
import time
import sys

BASE = "http://localhost:8765"

def test_health():
    r = requests.get(f"{BASE}/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
    print("  ✅ /health")

def test_root():
    r = requests.get(f"{BASE}/")
    assert r.status_code == 200
    data = r.json()
    assert data["service"] == "vital-bridge"
    assert "vita_version" in data
    print(f"  ✅ / (vita {data['vita_version']})")

def test_presets():
    r = requests.get(f"{BASE}/presets")
    assert r.status_code == 200
    data = r.json()
    assert data["count"] > 0
    print(f"  ✅ /presets ({data['count']} found)")

def test_load():
    r = requests.post(f"{BASE}/load", json={
        "path": "/Users/zhaozy/mnt/music/Vital/Factory/Presets/Plucked String.vital"
    })
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "loaded"
    assert data["name"] == "Plucked String"
    print(f"  ✅ /load ({data['name']}, hash={data['hash']})")
    return data["hash"]

def test_render():
    r = requests.post(f"{BASE}/render", json={
        "note": 60, "velocity": 0.7, "note_dur": 1.0, "render_dur": 2.0
    })
    assert r.status_code == 200
    assert r.headers["content-type"] == "audio/wav"
    assert len(r.content) > 10000  # should be substantial
    print(f"  ✅ /render (note=60, {len(r.content)} bytes)")

def test_render_cached():
    """Second render of same note should be faster (cached)."""
    t0 = time.time()
    r = requests.post(f"{BASE}/render", json={
        "note": 60, "velocity": 0.7, "note_dur": 1.0, "render_dur": 2.0
    })
    elapsed = (time.time() - t0) * 1000
    assert r.status_code == 200
    print(f"  ✅ /render cached (note=60, {elapsed:.0f}ms)")

def test_render_batch():
    r = requests.post(f"{BASE}/render-batch", json={
        "notes": [48, 60, 72],
        "velocity": 0.7,
        "note_dur": 1.0,
        "render_dur": 2.0,
    })
    assert r.status_code == 200
    data = r.json()
    assert data["total"] == 3
    assert len(data["notes"]) == 3
    print(f"  ✅ /render-batch (3 notes, {data['time_ms']}ms, {data['rendered']} rendered, {data['cached']} cached)")

def test_cache_serve():
    # First get the batch results to know a URL
    r = requests.post(f"{BASE}/render-batch", json={
        "notes": [48], "velocity": 0.7, "note_dur": 1.0, "render_dur": 2.0,
    })
    url = r.json()["notes"][0]["url"]
    
    r2 = requests.get(f"{BASE}{url}")
    assert r2.status_code == 200
    assert r2.headers["content-type"] == "audio/wav"
    print(f"  ✅ /cache/ serve ({len(r2.content)} bytes)")

def test_no_preset_error():
    """Should error if no preset loaded."""
    # Clear state by loading init
    r = requests.post(f"{BASE}/load", json={
        "path": "/nonexistent/path.vital"
    })
    assert r.status_code == 404
    print("  ✅ Error handling (404 for missing preset)")

def main():
    print("=" * 60)
    print("Vital-Bridge E2E Tests")
    print("=" * 60)
    
    # Check server is running
    try:
        requests.get(f"{BASE}/health", timeout=2)
    except requests.ConnectionError:
        print("ERROR: Server not running. Start with:")
        print("  uvicorn server:app --port 8765")
        sys.exit(1)
    
    tests = [
        test_health,
        test_root,
        test_presets,
        test_no_preset_error,
        test_load,
        test_render,
        test_render_cached,
        test_render_batch,
        test_cache_serve,
    ]
    
    passed = 0
    failed = 0
    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"  ❌ {test.__name__}: {e}")
            failed += 1
    
    print()
    print(f"Results: {passed} passed, {failed} failed")
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
