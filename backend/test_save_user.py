from users.serializers import RegisterSerializer

data = {
    "username": "save_test_user",
    "email": "save_test_user@example.com",
    "password": "password123",
    "first_name": "Save",
    "last_name": "Test",
    "role": "candidate",
    "profile_data": '{"bio": "hello", "ville": "Douala", "quartier": "AKWA"}'
}

serializer = RegisterSerializer(data=data)
if serializer.is_valid():
    print("VALID! Saving...")
    try:
        user = serializer.save()
        print(f"User saved: {user.id}")
    except Exception as e:
        print(f"Error saving: {e}")
else:
    print("INVALID!")
    print(serializer.errors)
