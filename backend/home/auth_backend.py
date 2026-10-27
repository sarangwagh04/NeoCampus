from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User
from django.db.models import Q


class EmailOrUsernameModelBackend(ModelBackend):
    """
    Custom authentication backend that allows users to log in using either
    their username (e.g. 'student1', 'staff1', 'staff_hod', 'admin') or their
    email address (e.g. 'student@neocampus.com').
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get("email")

        if not username or not password:
            return None

        clean_username = str(username).strip()

        try:
            user = User.objects.filter(
                Q(username__iexact=clean_username) | Q(email__iexact=clean_username)
            ).first()

            if user and user.check_password(password) and self.user_can_authenticate(user):
                return user
        except Exception:
            return None

        return None
