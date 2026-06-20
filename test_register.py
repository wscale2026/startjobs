import requests

API_URL = 'http://localhost:8001/api'

# 1. Register
res = requests.post(f"{API_URL}/register/", json={
    "username": "testcand99",
    "email": "test99@test.com",
    "password": "Password123!",
    "first_name": "Test",
    "last_name": "Cand",
    "role": "candidate"
})
print("REGISTER:", res.status_code, res.text)

if res.status_code == 201 or 'already exists' in res.text:
    # 2. Token
    token_res = requests.post(f"{API_URL}/token/", json={
        "username": "testcand99",
        "password": "Password123!"
    })
    print("TOKEN:", token_res.status_code)
    access = token_res.json().get('access')

    # 3. Me
    me_res = requests.get(f"{API_URL}/users/me/", headers={"Authorization": f"Bearer {access}"})
    print("ME:", me_res.status_code, me_res.text)
    user_id = me_res.json().get('id')

    # 4. Patch candidate
    patch_res = requests.patch(f"{API_URL}/candidates/{user_id}/", json={
        "generated_password": "Password123!",
        "phone": "123456789"
    }, headers={"Authorization": f"Bearer {access}"})
    print("PATCH:", patch_res.status_code, patch_res.text)
