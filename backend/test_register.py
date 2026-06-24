import requests

url = "http://localhost:8000/api/register/"
data = {
    "username": "testuserphoto",
    "email": "testphoto@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "Photo",
    "role": "candidate",
    "profile_data": '{"bio": "hello"}'
}
files = {
    "photo": ("test.png", b"fakeimagecontent", "image/png")
}

try:
    res = requests.post(url, data=data, files=files)
    print("Status Code:", res.status_code)
    print("Response:", res.text)
except Exception as e:
    print(e)
