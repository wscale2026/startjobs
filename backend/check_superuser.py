from users.models import User
su = User.objects.filter(is_superuser=True).first()
if su:
    print(f"Superuser: {su.username}, Role: '{su.role}'")
else:
    print("No superuser found")
