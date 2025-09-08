#!/usr/bin/env python3
"""
Test script for authentication system
Run this to test user registration and login functionality
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_register():
    """Test user registration"""
    print("🧪 Testing user registration...")
    
    user_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "TestPassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
        
        if response.status_code == 200:
            print("✅ Registration successful!")
            print(f"User: {response.json()['name']} ({response.json()['email']})")
            return True
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return False

def test_login():
    """Test user login"""
    print("\n🧪 Testing user login...")
    
    login_data = {
        "email": "test@example.com",
        "password": "TestPassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login successful!")
            print(f"Token: {data['access_token'][:20]}...")
            print(f"User: {data['user']['name']} ({data['user']['email']})")
            return data['access_token']
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_protected_route(token):
    """Test accessing protected route"""
    print("\n🧪 Testing protected route access...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        
        if response.status_code == 200:
            print("✅ Protected route access successful!")
            print(f"User info: {response.json()}")
            return True
        else:
            print(f"❌ Protected route access failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Protected route error: {e}")
        return False

def main():
    print("🚀 Testing Scanner Eyes Authentication System")
    print("=" * 50)
    
    # Test registration
    if not test_register():
        print("\n❌ Registration test failed. Make sure the backend is running.")
        return
    
    # Test login
    token = test_login()
    if not token:
        print("\n❌ Login test failed.")
        return
    
    # Test protected route
    if not test_protected_route(token):
        print("\n❌ Protected route test failed.")
        return
    
    print("\n🎉 All authentication tests passed!")
    print("\nNext steps:")
    print("1. Start the frontend: npm run dev")
    print("2. Open http://localhost:5173")
    print("3. Try registering and logging in")

if __name__ == "__main__":
    main()
