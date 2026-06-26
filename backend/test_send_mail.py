import time
from django.core.mail import send_mail
from django.conf import settings

start = time.time()
try:
    send_mail(
        subject="Test",
        message="Test message",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=["test@example.com"],
        fail_silently=False,
    )
    print("Email sent!")
except Exception as e:
    print(f"Error: {e}")
print(f"Time taken: {time.time() - start:.2f} seconds")
