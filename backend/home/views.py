import token
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from profiles.models import StudentProfile, StaffProfile




class CustomTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['user_id'] = user.id
        token['username'] = user.username
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        try:
            staff_profile = StaffProfile.objects.get(user=user)
            token["is_hod"] = staff_profile.is_hod
        except StaffProfile.DoesNotExist:
            token["is_hod"] = False
        return token


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer
