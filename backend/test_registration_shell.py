from users.serializers import RegisterSerializer

data = {
    "username": "deep_shell_user",
    "email": "deep_shell_user@example.com",
    "password": "password123",
    "first_name": "Deep",
    "last_name": "Shell",
    "role": "candidate",
    "profile_data": '{"bio": "hello", "ville": "Douala", "quartier": "AKWA", "domaines": ["Test"]}'
}

serializer = RegisterSerializer(data=data)
if serializer.is_valid():
    print("VALID!")
    print(serializer.validated_data)
else:
    print("INVALID!")
    print(serializer.errors)

