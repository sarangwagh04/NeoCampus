from django.contrib import admin

# Register your models here.
# noticeboard/admin.py

from django.contrib import admin
from .models import Notice, NoticeLink, NoticeFile, PushSubscription


class NoticeLinkInline(admin.TabularInline):
    model = NoticeLink
    extra = 0


class NoticeFileInline(admin.TabularInline):
    model = NoticeFile
    extra = 0


@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ('title', 'uploaded_by', 'is_public', 'created_at')
    inlines = [NoticeLinkInline, NoticeFileInline]

@admin.register(PushSubscription)
class PushSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'endpoint', 'created_at')
    search_fields = ('user__username', 'endpoint')
    list_filter = ('created_at',)