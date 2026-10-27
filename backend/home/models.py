from django.db import models


class DemoResetLog(models.Model):
    reset_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default="SUCCESS")
    triggered_by = models.CharField(max_length=100, default="auto")  # 'auto', 'command', 'api'
    records_seeded = models.IntegerField(default=0)
    details = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["-reset_at"]
        verbose_name = "Demo Reset Log"
        verbose_name_plural = "Demo Reset Logs"

    def __str__(self):
        return f"Reset at {self.reset_at.strftime('%Y-%m-%d %H:%M:%S')} ({self.status})"
