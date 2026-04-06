# profiles/models.py
from django.db import models
from django.contrib.auth.models import User

# -------------------- COMMON --------------------
GENDER_CHOICES = [
    ("Male", "Male"),
    ("Female", "Female"),
    ("Other", "Other"),
]


# -------------------- STUDENT PROFILE --------------------
class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="student_profile")

    # Basic info
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    dob = models.DateField(blank=True, null=True)
    profile_picture = models.ImageField(
    upload_to="profile_pictures/",
    blank=True,
    null=True
)

    # Academic info
    branch = models.CharField(max_length=100)
    semester = models.CharField(max_length=10)
    admission_year = models.CharField(max_length=10)
    role = models.CharField(max_length=20)
    batch_id = models.CharField(max_length=20, blank=True, null=True)

    # Contact
    mobile_number = models.CharField(max_length=15, unique=True)
    address = models.TextField()

    # Parent Info
    parents_name = models.CharField(max_length=100)
    parents_mobile_number = models.CharField(max_length=15)

    # Meta
    date_created = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(blank=True, null=True)
    hardware_public_key = models.TextField(blank=True, null=True, help_text="User's hardware public key for signature login")

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.user.username})"

    class Meta:
        verbose_name = "Student Profile"
        verbose_name_plural = "Student Profiles"


# -------------------- STAFF PROFILE --------------------
class StaffProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="staff_profile")

    # Basic info
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    dob = models.DateField(blank=True, null=True)
    profile_picture = models.ImageField(
    upload_to="profile_pictures/",
    blank=True,
    null=True
)

    # Job info
    branch = models.CharField(max_length=100)
    is_hod = models.BooleanField(default=False)
    designation = models.CharField(max_length=100)
    qualifications = models.CharField(max_length=150)
    joined_year = models.CharField(max_length=10)
    role = models.CharField(max_length=20)

    # Contact
    mobile_number = models.CharField(max_length=15, unique=True)
    address = models.TextField()

    # Emergency Info
    emergency_name = models.CharField(max_length=100)
    emergency_mobile_number = models.CharField(max_length=15)
    emergency_relation = models.CharField(max_length=50)

    # Meta
    date_created = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    hardware_public_key = models.TextField(blank=True, null=True, help_text="User's hardware public key for signature login")

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.user.username})"

    class Meta:
        verbose_name = "Staff Profile"
        verbose_name_plural = "Staff Profiles"


