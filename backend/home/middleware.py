# home/middleware.py
import logging
import time
from datetime import timedelta
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

# In-memory throttle to avoid checking DB timestamp on literally every microsecond
_LAST_EVALUATION_TIMESTAMP = 0.0
_EVALUATION_INTERVAL_SECONDS = 60.0  # Check at most once per minute


class DemoAutoResetMiddleware:
    """
    Middleware that checks if the demo dataset has expired (e.g. daily interval of 24h)
    and automatically resets & re-seeds the baseline demo data.

    This ensures that even if no external cron or scheduler is running,
    the very first request of the day triggers an automated fresh reset.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        global _LAST_EVALUATION_TIMESTAMP

        demo_mode = getattr(settings, "DEMO_MODE", True)
        if demo_mode:
            current_time = time.time()
            if current_time - _LAST_EVALUATION_TIMESTAMP >= _EVALUATION_INTERVAL_SECONDS:
                _LAST_EVALUATION_TIMESTAMP = current_time
                self._check_and_trigger_reset()

        return self.get_response(request)

    def _check_and_trigger_reset(self):
        try:
            from home.models import DemoResetLog
            from home.services.demo_seeder import reset_and_seed_demo_data

            reset_interval_hours = getattr(settings, "DEMO_RESET_INTERVAL_HOURS", 24)
            interval_seconds = int(reset_interval_hours) * 3600

            last_reset = DemoResetLog.objects.filter(status="SUCCESS").first()

            needs_reset = False
            if not last_reset:
                needs_reset = True
            else:
                elapsed = (timezone.now() - last_reset.reset_at).total_seconds()
                if elapsed >= interval_seconds:
                    needs_reset = True

            if needs_reset:
                logger.info("Demo auto-reset threshold reached. Initiating automatic daily database reset & seed...")
                reset_and_seed_demo_data(triggered_by="daily_auto_middleware")
        except Exception as e:
            # Never let auto-reset error crash normal user requests
            logger.error(f"Error in DemoAutoResetMiddleware: {e}", exc_info=True)
