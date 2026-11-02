# home/middleware.py
import logging
import time
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

# In-memory throttle to avoid checking DB timestamp on literally every microsecond
_LAST_EVALUATION_TIMESTAMP = 0.0
_EVALUATION_INTERVAL_SECONDS = 30.0  # Check DB at most once per 30 seconds


class DemoAutoResetMiddleware:
    """
    Middleware that checks if daily midnight (12:00 AM) has passed
    and automatically resets user-created ephemeral records to fresh baseline demo data.

    This guarantees that even on Render Free tier (where instances spin down after 15m),
    the first request of the day immediately purges previous day's user data
    and presents a pristine system state.
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
            from home.services.demo_seeder import reset_and_seed_demo_data, should_reset_for_midnight

            tz_name = getattr(settings, "RESET_TIMEZONE", "Asia/Kolkata")
            reset_hour = getattr(settings, "DEMO_RESET_HOUR", 0)
            reset_minute = getattr(settings, "DEMO_RESET_MINUTE", 0)

            last_reset = DemoResetLog.objects.filter(status="SUCCESS").first()
            last_reset_time = last_reset.reset_at if last_reset else None

            if should_reset_for_midnight(last_reset_time, reset_tz_name=tz_name, reset_hour=reset_hour, reset_minute=reset_minute):
                logger.info(
                    f"Midnight reset boundary passed ({reset_hour:02d}:{reset_minute:02d} in {tz_name}). "
                    f"Deleting user-created demo data and reseeding clean baseline..."
                )
                reset_and_seed_demo_data(triggered_by="daily_midnight_auto_middleware")
        except Exception as e:
            # Never let auto-reset error crash normal user requests
            logger.error(f"Error in DemoAutoResetMiddleware: {e}", exc_info=True)
