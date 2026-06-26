from users.models import User
sus = User.objects.filter(is_superuser=True)
for su in sus:
    print(f"Superuser: {su.username}, Role: '{su.role}'")
