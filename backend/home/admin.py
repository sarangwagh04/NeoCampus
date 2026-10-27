from django.contrib import admin
from .models import DemoResetLog


@admin.register(DemoResetLog)
class DemoResetLogAdmin(admin.ModelAdmin):
    list_display = ("reset_at", "status", "triggered_by", "records_seeded")
    list_filter = ("status", "triggered_by")
    readonly_fields = ("reset_at", "status", "triggered_by", "records_seeded", "details")
