#!/usr/bin/env python3
"""
Simple test script to verify backend endpoints are working
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✅ Health check: {response.status_code} - {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_scan_endpoint():
    """Test scan endpoint"""
    try:
        # Test manual scan
        data = {
            "ip": "127.0.0.1",
            "ports": [80, 443, 8080]
        }
        response = requests.post(f"{BASE_URL}/scan/", json=data)
        print(f"✅ Manual scan: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Message: {result.get('message', 'No message')}")
            print(f"   Devices found: {len(result.get('devices', []))}")
        return True
    except Exception as e:
        print(f"❌ Manual scan failed: {e}")
        return False

def test_auto_scan():
    """Test auto scan endpoint"""
    try:
        response = requests.post(f"{BASE_URL}/scan/auto")
        print(f"✅ Auto scan: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Message: {result.get('message', 'No message')}")
            print(f"   Cameras found: {len(result.get('cameras', []))}")
        return True
    except Exception as e:
        print(f"❌ Auto scan failed: {e}")
        return False

def test_suggestions():
    """Test suggestions endpoint"""
    try:
        data = {"keyword": "RTSP"}
        response = requests.post(f"{BASE_URL}/suggestions/", json=data)
        print(f"✅ Suggestions: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Keyword: {result.get('keyword', 'No keyword')}")
            print(f"   Suggestions: {len(result.get('suggestions', []))}")
        return True
    except Exception as e:
        print(f"❌ Suggestions failed: {e}")
        return False

def test_assistant():
    """Test assistant endpoint"""
    try:
        data = {"issue": "weak password"}
        response = requests.post(f"{BASE_URL}/assistant/", json=data)
        print(f"✅ Assistant: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Suggestion: {result.get('suggestion', 'No suggestion')[:50]}...")
            print(f"   Steps: {len(result.get('steps', []))}")
        return True
    except Exception as e:
        print(f"❌ Assistant failed: {e}")
        return False

def test_quick_fixes():
    """Test quick fixes endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/assistant/quick-fixes")
        print(f"✅ Quick fixes: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Quick fixes: {len(result.get('quick_fixes', []))}")
        return True
    except Exception as e:
        print(f"❌ Quick fixes failed: {e}")
        return False

def test_scan_history():
    """Test scan history endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/scan/history")
        print(f"✅ Scan history: {response.status_code}")
        if response.status_code == 200:
            history = response.json()
            print(f"   History entries: {len(history)}")
        return True
    except Exception as e:
        print(f"❌ Scan history failed: {e}")
        return False

def main():
    print("🧪 Testing IoT Security Scanner Backend")
    print("=" * 50)
    
    tests = [
        test_health,
        test_scan_endpoint,
        test_auto_scan,
        test_suggestions,
        test_assistant,
        test_quick_fixes,
        test_scan_history
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the backend logs for details.")

if __name__ == "__main__":
    main()
