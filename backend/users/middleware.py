import datetime
from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import get_user_model

User = get_user_model()

class ActiveUserMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.user.is_authenticated:
            now = timezone.now()
            # Update last_login if it's been more than 5 minutes since the last update
            if not request.user.last_login or (now - request.user.last_login) > datetime.timedelta(minutes=5):
                User.objects.filter(pk=request.user.pk).update(last_login=now)
                # Keep the object in sync if accessed later in the same request
                request.user.last_login = now
