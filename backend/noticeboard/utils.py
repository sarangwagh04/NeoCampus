import json
import threading
from pywebpush import webpush, WebPushException
from django.conf import settings

def send_push_notification_worker(subscription, payload):
    try:
        webpush(
            subscription_info={
                "endpoint": subscription.endpoint,
                "keys": {
                    "p256dh": subscription.p256dh,
                    "auth": subscription.auth
                }
            },
            data=json.dumps(payload),
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={
                "sub": f"mailto:{settings.VAPID_ADMIN_EMAIL}"
            },
            timeout=5
        )
    except WebPushException as ex:
        # Check if the subscription is expired or invalid
        if ex.response and ex.response.status_code in [404, 410]:
            print(f"Subscription expired/invalid for {subscription.user.username}, deleting...")
            subscription.delete()
        else:
            print(f"Web Push Error: {repr(ex)}")
    except Exception as e:
        print(f"Push notification failed: {str(e)}")

def send_push_notification(subscription, payload):
    """
    Sends a push notification to a specific subscription asynchronously.
    """
    thread = threading.Thread(
        target=send_push_notification_worker, 
        args=(subscription, payload)
    )
    thread.daemon = True
    thread.start()
