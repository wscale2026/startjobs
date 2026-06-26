import requests

url = "http://localhost:8000/api/register/"
data = {
    "username": "deep_test_user",
    "email": "deep_test_user@example.com",
    "password": "password123",
    "first_name": "Deep",
    "last_name": "Test",
    "role": "candidate",
    "profile_data": '{"bio": "hello", "ville": "Douala", "quartier": "AKWA"}'
}

try:
    res = requests.post(url, data=data)
    print("Status Code:", res.status_code)
    print("Response JSON:", res.json())
except Exception as e:
    print(e)
