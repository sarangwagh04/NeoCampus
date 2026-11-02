"""
WSGI config for neocampus project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neocampus.settings')

application = get_wsgi_application()

# Start background midnight reset daemon in production
try:
    from home.scheduler import start_midnight_scheduler
    start_midnight_scheduler()
except Exception as e:
    import logging
    logging.getLogger(__name__).warning(f"Could not start midnight scheduler: {e}")
