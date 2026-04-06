import os
import string
import time
import json
import base64
import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ed25519

class Command(BaseCommand):
    help = "Listen for USB hardware key insertion with Signature Auth"

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS("SECURE USB Listener Started (RSA/Ed25519)..."))
        
        known_drives = set()

        while True:
            # Check listener state
            state_file = os.path.join(settings.BASE_DIR, "listener_state.json")
            is_active = True
            if os.path.exists(state_file):
                try:
                    with open(state_file, "r") as f:
                        data = json.load(f)
                        is_active = data.get("active", True)
                except Exception:
                    pass

            if not is_active:
                time.sleep(2)
                continue

            current_drives = self.get_removable_drives()
            new_drives = current_drives - known_drives

            for drive in new_drives:
                self.process_drive(drive)

            known_drives = current_drives
            time.sleep(2)

    def get_removable_drives(self):
        drives = set()
        for letter in string.ascii_uppercase:
            drive = f"{letter}:/"
            if os.path.exists(drive):
                # Simple check for removable (drives are usually D:, E:, etc.)
                if letter not in ['C']:
                    drives.add(drive)
        return drives

    def process_drive(self, drive):
        key_path = os.path.join(drive, "key.neocampus")
        user_path = os.path.join(drive, "user.neocampus")

        if not os.path.exists(key_path) or not os.path.exists(user_path):
            return

        self.stdout.write(f"🔑 Secure Key detected in {drive}")

        try:
            # 1. Read Private Key and Username
            with open(key_path, "rb") as f:
                private_key_pem = f.read()
            
            with open(user_path, "r") as f:
                username = f.read().strip()

            # 2. Load Private Key
            try:
                # First try loading as standard PEM (if we ever switch to PKCS8)
                private_key = serialization.load_pem_private_key(
                    private_key_pem,
                    password=None
                )
            except ValueError:
                # Fallback to OpenSSH format which our generator currently uses
                private_key = serialization.load_ssh_private_key(
                    private_key_pem,
                    password=None
                )

            # 3. Create a unique Challenge (Handshake)
            challenge = f"neocampus-auth-{time.time()}"
            
            # 4. Sign the challenge
            signature = private_key.sign(challenge.encode('utf-8'))
            signature_b64 = base64.b64encode(signature).decode('utf-8')

            # 5. Send to Server for Verification
            self.stdout.write(f"Sending signature for user: {username}...")
            
            # Use the internal API URL
            api_url = "http://127.0.0.1:8000/api/auth/hardware-signature-login/"
            
            response = requests.post(
                api_url,
                json={
                    "username": username,
                    "challenge": challenge,
                    "signature": signature_b64
                }
            )

            if response.status_code == 200:
                self.stdout.write(self.style.SUCCESS(f"✅ Authenticated: {username}"))
                
                # Save the JWT for the frontend to find
                auth_data = response.json()
                auth_data["status"] = "success"
                
                file_path = os.path.join(settings.BASE_DIR, "hardware_auth.json")
                with open(file_path, "w") as f:
                    json.dump(auth_data, f)
                
                self.stdout.write(self.style.SUCCESS("Token saved for frontend polling."))
            else:
                self.stdout.write(self.style.ERROR(f"❌ Server rejected hardware key: {response.text}"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Signature error: {str(e)}"))