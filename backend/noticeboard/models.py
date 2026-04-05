from django.db import models

# noticeboard/models.py

from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.conf import settings

# ==============================
# FILE VALIDATION FUNCTION
# ==============================

def validate_file_size(file):
    # ✅ Max file size: 20MB
    limit = 20 * 1024 * 1024
    if file.size > limit:
        raise ValidationError("File size must not exceed 20MB.")


# ==============================
# MAIN NOTICE MODEL
# ==============================

class Notice(models.Model):
    # ==============================
    # BASIC DETAILS
    # ==============================

    title = models.CharField(max_length=200)

    brief_message = models.TextField()

    # ==============================
    # SUBJECT DETAILS
    # ==============================

    subject_name = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    subject_code = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    batch_id = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    is_public = models.BooleanField(default=False)

    # ==============================
    # META INFO
    # ==============================

    uploaded_by = models.CharField(max_length=200)  # storing staff name

    created_at = models.DateTimeField(default=timezone.now)

    # ==============================
    # VALIDATION LOGIC
    # ==============================

    def clean(self):
        # ✅ If public → subject must be empty
        if self.is_public:
            self.subject_name = None
            self.subject_code = None
            self.batch_id = None

        # ✅ If not public → subject & batch required
        else:
            if not self.subject_name:
                raise ValidationError("Subject name is required if not public.")
            if not self.subject_code:
                raise ValidationError("Subject code is required if not public.")
            if not self.batch_id:
                raise ValidationError("Batch ID is required if not public.")

    def __str__(self):
        return self.title


# ==============================
# NOTICE LINKS (MAX 5)
# ==============================

class NoticeLink(models.Model):
    notice = models.ForeignKey(
        Notice,
        on_delete=models.CASCADE,
        related_name='links'
    )

    url = models.URLField()

    def __str__(self):
        return f"Link for {self.notice.title}"


# ==============================
# NOTICE FILES (MAX 3 FILES)
# ==============================

class NoticeFile(models.Model):
    notice = models.ForeignKey(
        Notice,
        on_delete=models.CASCADE,
        related_name='files'
    )

    file = models.FileField(
        upload_to='notice_files/',
        validators=[validate_file_size]  # ✅ 20MB limit
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"File for {self.notice.title}"

# ==============================
# PUSH NOTIFICATION SUBSCRIPTION
# ==============================

from django.contrib.auth.models import User

class PushSubscription(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='push_subscriptions'
    )
    endpoint = models.TextField(unique=True)
    p256dh = models.TextField()
    auth = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Push Subscription for {self.user.username}"