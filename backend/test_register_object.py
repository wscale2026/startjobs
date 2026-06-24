import requests

url = "http://localhost:8000/api/register/"
data = {
    "username": "testobj",
    "email": "testobj@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "Obj",
    "role": "candidate",
    "profile_data": '{"bio": "hello"}',
    "photo": "[object Object]"
}

try:
    res = requests.post(url, data=data)
    print("Status Code:", res.status_code)
    print("Response:", res.text)
except Exception as e:
    print(e)
