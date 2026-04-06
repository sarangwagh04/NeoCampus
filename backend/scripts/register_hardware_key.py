import os
import sys
import django
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ed25519

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "neocampus.settings")
django.setup()

from django.contrib.auth.models import User
from profiles.models import StudentProfile, StaffProfile

def register_key(username, drive_letter):
    try:
        user = User.objects.get(username=username)
        
        # 1. Generate Ed25519 key pair (modern and secure)
        private_key = ed25519.Ed25519PrivateKey.generate()
        public_key = private_key.public_key()

        # 2. Serialize keys
        private_bytes = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.OpenSSH,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        public_bytes = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )

        # 3. Save Private Key and Username to USB
        usb_key_path = f"{drive_letter}:/key.neocampus"
        usb_user_path = f"{drive_letter}:/user.neocampus"
        
        with open(usb_key_path, "wb") as f:
            f.write(private_bytes)
            
        with open(usb_user_path, "w") as f:
            f.write(username)
        
        print(f"✅ Private key saved to {usb_key_path}")
        print(f"✅ Username saved to {usb_user_path}")

        # 4. Save Public Key to Django Profile
        # Check both Student and Staff profiles
        profile = None
        if hasattr(user, 'student_profile'):
            profile = user.student_profile
        elif hasattr(user, 'staff_profile'):
            profile = user.staff_profile
            
        if profile:
            profile.hardware_public_key = public_bytes.decode('utf-8')
            profile.save()
            print(f"✅ Public key registered for user: {username}")
        else:
            print(f"❌ No profile found for user: {username}")

    except User.DoesNotExist:
        print(f"❌ User '{username}' not found.")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python register_hardware_key.py <username> <drive_letter>")
        print("Example: python register_hardware_key.py 2021001 E")
    else:
        register_key(sys.argv[1], sys.argv[2])
