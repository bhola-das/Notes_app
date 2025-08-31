import requests
import json

BASE_URL = "http://localhost:8000"

def test_auth_flow():
    print("Testing authentication flow...")
    
    # Test signup
    signup_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "testpass123"
    }
    
    print(f"1. Testing signup with: {signup_data}")
    signup_response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
    print(f"Signup response: {signup_response.status_code} - {signup_response.text}")
    
    # Test login
    login_data = {
        "email": "test@example.com",
        "password": "testpass123"
    }
    
    print(f"\n2. Testing login with: {login_data}")
    login_response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Login response: {login_response.status_code} - {login_response.text}")
    
    if login_response.status_code == 200:
        token = login_response.json().get("access_token")
        print(f"Token received: {token[:20] if token else 'None'}...")
        
        # Test creating a note with the token
        headers = {"Authorization": f"Bearer {token}"}
        note_data = {
            "title": "Test Note",
            "content": "This is a test note"
        }
        
        print(f"\n3. Testing note creation with token")
        note_response = requests.post(f"{BASE_URL}/notes/", json=note_data, headers=headers)
        print(f"Note creation response: {note_response.status_code} - {note_response.text}")
        
        # Test getting notes
        print(f"\n4. Testing get notes")
        notes_response = requests.get(f"{BASE_URL}/notes/", headers=headers)
        print(f"Get notes response: {notes_response.status_code} - {notes_response.text}")
    
    else:
        print("Login failed, cannot test note creation")

if __name__ == "__main__":
    test_auth_flow()
