import os
import string
import time
import psutil
from django.core.management.base import BaseCommand
from django.contrib.auth import authenticate
from django.conf import settings
from django.contrib.auth import get_user_model

from rest_framework.test import APIRequestFactory
from home.views import LoginView

from rest_framework_simplejwt.tokens import RefreshToken
import json

User = get_user_model()

class Command(BaseCommand):
    help = "Listen for USB hardware key insertion"

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS("USB Listener Started..."))

        known_drives = self.get_removable_drives()

        while True:
            current_drives = self.get_removable_drives()
            print("Current Drives:", current_drives)
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
                drives.add(drive)
        return drives

    def process_drive(self, drive):
        key_path = os.path.join(drive, "key.neocampus")

        if not os.path.exists(key_path):
            return

        self.stdout.write(f"Key detected in {drive}")

        try:
            with open(key_path, "r", encoding="utf-8") as f:
                lines = f.read().strip().split("\n")

            data = {}
            for line in lines:
                if "=" in line:
                    k, v = line.strip().split("=")
                    data[k.strip()] = v.strip()

            college_id = data.get("college_id")
            password = data.get("password")

            if not college_id or not password:
                self.stdout.write(self.style.ERROR("Invalid key format"))
                return

            user = authenticate(username=college_id, password=password)

            if user:
                self.stdout.write(self.style.SUCCESS(f"Authenticated: {college_id}"))
                self.handle_success(college_id, password)
            else:
                self.stdout.write(self.style.ERROR("Authentication Failed"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(str(e)))




    def handle_success(self, username, password):
        factory = APIRequestFactory()

        request = factory.post(
            "/api/auth/login/",
            {
                "username": username,
                "password": password,
            },
            format="json"
        )

        view = LoginView.as_view()
        response = view(request)

        if response.status_code == 200:
            import json
            file_path = os.path.join(settings.BASE_DIR, "hardware_auth.json")
            with open(file_path, "w") as f:
                json.dump(response.data, f)

            self.stdout.write(self.style.SUCCESS("Login API executed internally"))
        else:
            self.stdout.write(self.style.ERROR("Internal login failed"))