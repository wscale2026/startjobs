import requests

url = "http://localhost:8000/api/register/"
data = {
    "username": "testuserphoto2",
    "email": "testphoto2@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "Photo",
    "role": "candidate",
    "profile_data": '{"bio": "hello"}'
}
# valid 1x1 transparent GIF
gif_bytes = b'GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x01D\x00;'
files = {
    "photo": ("test.gif", gif_bytes, "image/gif")
}

try:
    res = requests.post(url, data=data, files=files)
    print("Status Code:", res.status_code)
    print("Response:", res.text)
except Exception as e:
    print(e)
