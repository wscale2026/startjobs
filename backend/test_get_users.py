import requests

API_URL = 'http://localhost:8001/api/users/'

# Need to login first to get the token
login_data = {
    'username': 'cand1@startjobs.com', # Wait, need admin user
    'password': 'password123' 
}
