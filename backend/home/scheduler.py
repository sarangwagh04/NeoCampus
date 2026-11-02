# home/scheduler.py
import logging
import threading
import time
from django.conf import settings

logger = logging.getLogger(__name__)

_scheduler_started = False
_scheduler_lock = threading.Lock()


def start_midnight_scheduler():
    """
    Launches a daemon background thread that sleeps and checks every 30 seconds
    if 12:00 AM midnight has arrived in the configured timezone (Asia/Kolkata by default).
    When midnight strikes, it automatically clears user data and restores the clean baseline.
    """
    global _scheduler_started
    with _scheduler_lock:
        if _scheduler_started:
            return
        _scheduler_started = True

    thread = threading.Thread(
        target=_midnight_loop,
        daemon=True,
        name="NeoCampusMidnightDaemon",
    )
    thread.start()
    logger.info("NeoCampus Midnight Auto-Reset background daemon thread started.")


def _midnight_loop():
    # Initial brief delay before starting periodic checks
    time.sleep(5)
    while True:
        try:
            demo_mode = getattr(settings, "DEMO_MODE", True)
            if demo_mode:
                from home.models import DemoResetLog
                from home.services.demo_seeder import reset_and_seed_demo_data, should_reset_for_midnight

                tz_name = getattr(settings, "RESET_TIMEZONE", "Asia/Kolkata")
                reset_hour = getattr(settings, "DEMO_RESET_HOUR", 0)
                reset_minute = getattr(settings, "DEMO_RESET_MINUTE", 0)

                last_reset = DemoResetLog.objects.filter(status="SUCCESS").first()
                last_time = last_reset.reset_at if last_reset else None

                if should_reset_for_midnight(last_time, reset_tz_name=tz_name, reset_hour=reset_hour, reset_minute=reset_minute):
                    logger.info(
                        f"[MidnightDaemon] Midnight reset boundary arrived ({reset_hour:02d}:{reset_minute:02d} in {tz_name}). "
                        f"Purging daily user data and restoring demo baseline..."
                    )
                    reset_and_seed_demo_data(triggered_by="midnight_cron_daemon")
        except Exception as e:
            logger.error(f"[MidnightDaemon] Error in loop: {e}", exc_info=True)

        time.sleep(30)

