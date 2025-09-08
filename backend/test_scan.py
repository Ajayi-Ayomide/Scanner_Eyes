#!/usr/bin/env python3
"""
Test script for network scanning functionality
Run this to test the scanning endpoints
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_quick_scan():
    """Test quick scan functionality"""
    print("🧪 Testing quick scan...")
    
    # Test with localhost
    test_ip = "127.0.0.1"
    
    try:
        response = requests.get(f"{BASE_URL}/scan/quick/{test_ip}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Quick scan successful!")
            print(f"Message: {data['message']}")
            if data.get('device'):
                device = data['device']
                print(f"Device: {device['device_name']} ({device['ip']})")
                print(f"Type: {device['device_type']}")
                print(f"Risk Level: {device['risk_level']}")
                print(f"Open Ports: {len(device['open_ports'])}")
            return True
        else:
            print(f"❌ Quick scan failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Quick scan error: {e}")
        return False

def test_manual_scan():
    """Test manual scan functionality"""
    print("\n🧪 Testing manual scan...")
    
    scan_data = {
        "ip": "127.0.0.1",
        "ports": [22, 80, 443, 8080],
        "scan_type": "manual_scan"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/scan/", json=scan_data)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Manual scan successful!")
            print(f"Message: {data['message']}")
            print(f"Devices found: {data['total_devices']}")
            print(f"Scan duration: {data.get('scan_duration', 0):.2f} seconds")
            return True
        else:
            print(f"❌ Manual scan failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Manual scan error: {e}")
        return False

def test_auto_scan():
    """Test auto scan functionality"""
    print("\n🧪 Testing auto scan...")
    
    try:
        response = requests.post(f"{BASE_URL}/scan/auto")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Auto scan successful!")
            print(f"Message: {data['message']}")
            print(f"Cameras found: {len(data.get('cameras', []))}")
            print(f"Scan duration: {data.get('scan_duration', 0):.2f} seconds")
            return True
        else:
            print(f"❌ Auto scan failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Auto scan error: {e}")
        return False

def test_scan_stats():
    """Test scan statistics"""
    print("\n🧪 Testing scan statistics...")
    
    try:
        response = requests.get(f"{BASE_URL}/scan/stats")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Scan stats successful!")
            print(f"Total scans: {data['total_scans']}")
            print(f"Today's scans: {data['today_scans']}")
            print(f"Vulnerable devices: {data['vulnerable_devices']}")
            print(f"Total devices found: {data['total_devices_found']}")
            return True
        else:
            print(f"❌ Scan stats failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Scan stats error: {e}")
        return False

def test_scan_history():
    """Test scan history"""
    print("\n🧪 Testing scan history...")
    
    try:
        response = requests.get(f"{BASE_URL}/scan/history")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Scan history successful!")
            print(f"History entries: {len(data)}")
            if data:
                latest = data[0]
                print(f"Latest scan: {latest['scan_type']} at {latest['timestamp']}")
            return True
        else:
            print(f"❌ Scan history failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Scan history error: {e}")
        return False

def main():
    print("🚀 Testing Scanner Eyes Network Scanning")
    print("=" * 50)
    
    tests = [
        test_quick_scan,
        test_manual_scan,
        test_auto_scan,
        test_scan_stats,
        test_scan_history
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        time.sleep(1)  # Small delay between tests
    
    print("\n" + "=" * 50)
    print(f"🎯 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All scanning tests passed!")
        print("\nNext steps:")
        print("1. Start the frontend: npm run dev")
        print("2. Open http://localhost:5173")
        print("3. Try the different scan types in the UI")
    else:
        print("❌ Some tests failed. Check the backend logs for details.")

if __name__ == "__main__":
    main()
