import requests
import json

base_url = "http://localhost:8000/api"

# Login
r = requests.post(f"{base_url}/token/", json={
    "username": "hackdumping@gmail.com",
    "password": "@Dumping0305"
})
if r.status_code == 200:
    token = r.json().get('access')
    print("Token fetched")
    r2 = requests.get(f"{base_url}/conversations/", headers={"Authorization": f"Bearer {token}"})
    print("Conversations status:", r2.status_code)
    try:
        print(json.dumps(r2.json(), indent=2)[:1000])
    except:
        print(r2.text[:500])
else:
    print("Login failed", r.status_code, r.text)
