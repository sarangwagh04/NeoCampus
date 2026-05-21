import json
import threading
from pywebpush import webpush, WebPushException
from django.conf import settings
from django.db import close_old_connections

def send_push_notifications_worker(subscriptions, payload):
    print(f"\n[Push Background Worker] Starting to send {len(subscriptions)} notifications...")
    for sub in subscriptions:
        try:
            import os
            print(f"DEBUG: VAPID_PRIVATE_KEY = {repr(settings.VAPID_PRIVATE_KEY)}")
            print(f"DEBUG: isfile = {os.path.isfile(settings.VAPID_PRIVATE_KEY)}")
            print(f"[Push] Sending to {sub.user.username} (Endpoint: {sub.endpoint[:30]}...).")
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {
                        "p256dh": sub.p256dh,
                        "auth": sub.auth
                    }
                },
                data=json.dumps(payload),
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims={
                    "sub": f"mailto:{settings.VAPID_ADMIN_EMAIL}"
                },
                timeout=5
            )
            print(f"[Push] Successfully sent to {sub.user.username}!")
        except WebPushException as ex:
            if ex.response and ex.response.status_code in [404, 410]:
                print(f"[Push Error] Subscription expired/invalid for {sub.user.username}, deleting...")
                sub.delete()
            else:
                print(f"[Push Error] Web Push Error for {sub.user.username}: {repr(ex)}")
        except Exception as e:
            print(f"[Push Error] Push notification failed for {sub.user.username}: {str(e)}")
            
    print("[Push Background Worker] Finished sending notifications.")
    # Clean up database connections used by this thread
    close_old_connections()

def send_push_notifications_async(subscriptions, payload):
    """
    Spawns a single background thread to process all push notifications sequentially.
    """
    # Evaluate the QuerySet to a list in the main thread to safely pass it to the background thread
    sub_list = list(subscriptions)
    if not sub_list:
        print("[Push] No subscriptions found for this notice. Skipping push notifications.")
        return
        
    print(f"[Push] Queuing {len(sub_list)} subscriptions to background worker.")
    
    thread = threading.Thread(
        target=send_push_notifications_worker, 
        args=(sub_list, payload)
    )
    # Removing thread.daemon = True ensures the thread won't be abruptly killed
    # before finishing the network requests, which was causing silent failures.
    thread.start()
