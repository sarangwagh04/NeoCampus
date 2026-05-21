import pandas as pd
import re
from datetime import datetime
from django.contrib.auth.models import User
from profiles.models import StudentProfile, StaffProfile

# ---------- Helper Functions ----------
def validate_name(name, field_name):
    if pd.isna(name) or not str(name).strip():
        raise ValueError(f"{field_name} is required.")
    name = str(name).strip()
    if ' ' in name or not name.isalpha():
        raise ValueError(f"{field_name} must contain exactly one word with only alphabetic characters.")
    return name

def validate_parents_name(name):
    if pd.isna(name) or not str(name).strip():
        raise ValueError("Parents name is required.")
    name = str(name).strip()
    if len(name.split()) != 2:
        raise ValueError("Parents name must contain exactly two words.")
    return name

def validate_email(email, username):
    if pd.isna(email) or not str(email).strip():
        raise ValueError("Email is required.")
    email = str(email).strip()
    if not re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", email):
        raise ValueError("Invalid email format.")
    if User.objects.filter(email=email).exclude(username=username).exists():
        raise ValueError(f"Email '{email}' is already in use by another user.")
    return email

def validate_mobile(mobile):
    if pd.isna(mobile) or not str(mobile).strip() or str(mobile).strip().lower() == "nan":
        raise ValueError("Mobile number is required.")
    mobile_str = str(mobile).strip().split(".")[0]
    if not re.match(r"^\d{10}$", mobile_str):
        raise ValueError("Mobile number must be exactly 10 digits.")
    return mobile_str

def validate_gender(gender):
    if pd.isna(gender) or not str(gender).strip():
        raise ValueError("Gender is required.")
    gender = str(gender).strip().capitalize()
    if gender not in ["Male", "Female", "Other"]:
        raise ValueError("Gender must be Male, Female, or Other.")
    return gender

def validate_year(year, field_name):
    if pd.isna(year) or not str(year).strip():
        raise ValueError(f"{field_name} is required.")
    year = str(year).strip().split(".")[0]
    if not re.match(r"^\d{4}$", year):
        raise ValueError(f"{field_name} must be a valid 4-digit year.")
    return year

def validate_dob(dob):
    """Validate DOB strictly in YYYY-MM-DD format and return it for the database."""
    if pd.isna(dob) or not str(dob).strip():
        raise ValueError("Valid Date of Birth is required.")
    
    # If pandas automatically parsed it into a datetime object
    if isinstance(dob, (datetime, pd.Timestamp)):
        return dob.strftime("%Y-%m-%d")
        
    s = str(dob).strip().split(" ")[0]  # strip time if present
    try:
        d = datetime.strptime(s, "%Y-%m-%d")
        return d.strftime("%Y-%m-%d")
    except ValueError:
        raise ValueError(f"Invalid DOB format: '{s}'. Only YYYY-MM-DD is allowed.")

def generate_password(first_name, valid_dob_str):
    """Generate password like Rutu0402 using the valid YYYY-MM-DD string."""
    name_part = str(first_name or "").capitalize()[:4]
    if valid_dob_str:
        d = datetime.strptime(valid_dob_str, "%Y-%m-%d")
        ddmm = f"{d.day:02d}{d.month:02d}"
        return f"{name_part}{ddmm}"
    return name_part

# ---------- STUDENT LOGIC ----------
def assign_branchwise_rolls(df):
    """Assign roll numbers (3 digits) branch-wise."""
    df = df.copy()
    df["branch"] = df["branch"].astype(str).str.upper()

    for branch in df["branch"].unique():
        mask = df["branch"] == branch
        branch_df = df[mask]
        df.loc[mask, "roll_number"] = range(1, len(branch_df) + 1)
    return df

def generate_student_username(branch, admission_year, roll_no):
    """Generate username like CSD2025001."""
    branch = str(branch or "").upper()[:3]
    year = str(admission_year)
    roll = str(int(roll_no)).zfill(3)[-3:]
    return f"{branch}{year}{roll}"

def create_students_from_excel(df):
    """Create or update student users + StudentProfile."""
    df.columns = [c.strip().lower() for c in df.columns]
    df = assign_branchwise_rolls(df)

    created, updated, errors = 0, 0, []

    for idx, row in df.iterrows():
        try:
            branch = str(row.get("branch", "")).strip()
            if not branch or branch.lower() == "nan": raise ValueError("Branch is required.")
            
            admission_year = validate_year(row.get("admission_year", ""), "Admission year")
            roll_no = row.get("roll_number", "")
            
            username = generate_student_username(branch, admission_year, roll_no)
            
            first_name = validate_name(row.get("first_name", ""), "First name")
            last_name = validate_name(row.get("last_name", ""), "Last name")
            middle_name = str(row.get("middle_name", "")).strip()
            if middle_name.lower() == "nan": middle_name = ""
            
            email = validate_email(row.get("email", ""), username)
            
            semester = str(row.get("semester", "")).strip().split(".")[0]
            if not semester.isdigit() or not (1 <= int(semester) <= 8):
                raise ValueError("Semester must be an integer between 1 and 8.")
            
            dob_raw = row.get("dob", "")
            dob = validate_dob(dob_raw)
                
            gender = validate_gender(row.get("gender", ""))
            
            profile_picture = str(row.get("profile_picture", "")).strip()
            if profile_picture.lower() == "nan": profile_picture = ""
            
            mobile_number = validate_mobile(row.get("mobile_number", ""))
            if StudentProfile.objects.filter(mobile_number=mobile_number).exclude(user__username=username).exists():
                 raise ValueError("Mobile number is already in use by another student.")
                 
            address = str(row.get("address", "")).strip()
            if address.lower() == "nan": address = ""
            
            parents_name = validate_parents_name(row.get("parents_name", ""))
            parents_mobile_number = validate_mobile(row.get("parents_mobile_number", ""))

            password = generate_password(first_name, dob)

            # Create or update User
            user, created_flag = User.objects.get_or_create(
                username=username,
                defaults={
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email,
                    "is_active": True,
                },
            )

            # Keep user data synced always
            user.first_name = first_name
            user.last_name = last_name
            user.email = email
            user.save()

            if created_flag:
                user.set_password(password)
                user.save()
                created += 1
            else:
                updated += 1

            # Create or update StudentProfile (sync all name fields)
            StudentProfile.objects.update_or_create(
                user=user,
                defaults={
                    "first_name": first_name,
                    "middle_name": middle_name,
                    "last_name": last_name,
                    "gender": gender,
                    "dob": dob,
                    "profile_picture": profile_picture,
                    "branch": branch,
                    "semester": semester,
                    "admission_year": admission_year,
                    "batch_id": f"{branch}_{admission_year}",
                    "role": "Student",
                    "mobile_number": mobile_number,
                    "address": address,
                    "parents_name": parents_name,
                    "parents_mobile_number": parents_mobile_number,
                },
            )

        except Exception as e:
            errors.append(f"Row {idx + 1}: {str(e)}")

    return created, updated, errors


# ---------- STAFF LOGIC ----------
def generate_staff_username(branch, designation, idx):
    """Generate staff username like CSEHOD001."""
    dept = str(branch or "").upper()[:3]
    desg = str(designation or "").upper()[:3]
    uid = str(idx).zfill(3)
    return f"{dept}{desg}{uid}"


def create_staff_from_excel(df):
    """Create or update staff users + StaffProfile."""
    df.columns = [c.strip().lower() for c in df.columns]
    created, updated, errors = 0, 0, []

    for idx, row in df.iterrows():
        try:
            branch = str(row.get("branch", "")).strip()
            if not branch or branch.lower() == "nan": raise ValueError("Branch is required.")
            
            designation = str(row.get("designation", "")).strip()
            if not designation or designation.lower() == "nan": raise ValueError("Designation is required.")
            
            username = generate_staff_username(branch, designation, idx + 1)
            
            first_name = validate_name(row.get("first_name", ""), "First name")
            last_name = validate_name(row.get("last_name", ""), "Last name")
            middle_name = str(row.get("middle_name", "")).strip()
            if middle_name.lower() == "nan": middle_name = ""
            
            email = validate_email(row.get("email", ""), username)
            
            qualifications = str(row.get("qualifications", "")).strip()
            if not qualifications or qualifications.lower() == "nan": raise ValueError("Qualifications are required.")
            
            joined_year = validate_year(row.get("joined_year", ""), "Joined year")
            
            dob_raw = row.get("dob", "")
            dob = validate_dob(dob_raw)
                
            gender = validate_gender(row.get("gender", ""))
            
            profile_picture = str(row.get("profile_picture", "")).strip()
            if profile_picture.lower() == "nan": profile_picture = ""
            
            mobile_number = validate_mobile(row.get("mobile_number", ""))
            if StaffProfile.objects.filter(mobile_number=mobile_number).exclude(user__username=username).exists():
                 raise ValueError("Mobile number is already in use by another staff member.")
                 
            address = str(row.get("address", "")).strip()
            if address.lower() == "nan": address = ""
            
            emergency_name = str(row.get("emergency_name", "")).strip()
            if emergency_name.lower() == "nan": emergency_name = ""
            
            emergency_mobile_number_raw = str(row.get("emergency_mobile_number", "")).strip()
            emergency_mobile_number = ""
            if emergency_mobile_number_raw and emergency_mobile_number_raw.lower() != "nan":
                emergency_mobile_number = validate_mobile(emergency_mobile_number_raw)
                
            emergency_relation = str(row.get("emergency_relation", "")).strip()
            if emergency_relation.lower() == "nan": emergency_relation = ""

            password = generate_password(first_name, dob)

            # Create or update User
            user, created_flag = User.objects.get_or_create(
                username=username,
                defaults={
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email,
                    "is_staff": True,
                    "is_active": True,
                },
            )

            # Always sync User with profile
            user.first_name = first_name
            user.last_name = last_name
            user.email = email
            user.save()

            if created_flag:
                user.set_password(password)
                user.save()
                created += 1
            else:
                updated += 1

            # Create or update StaffProfile (sync all name fields)
            StaffProfile.objects.update_or_create(
                user=user,
                defaults={
                    "first_name": first_name,
                    "middle_name": middle_name,
                    "last_name": last_name,
                    "gender": gender,
                    "dob": dob,
                    "profile_picture": profile_picture,
                    "branch": branch,
                    "designation": designation,
                    "qualifications": qualifications,
                    "joined_year": joined_year,
                    "mobile_number": mobile_number,
                    "address": address,
                    "emergency_name": emergency_name,
                    "emergency_mobile_number": emergency_mobile_number,
                    "emergency_relation": emergency_relation,
                    "role": "Staff",
                },
            )

        except Exception as e:
            errors.append(f"Row {idx + 1}: {str(e)}")

    return created, updated, errors


def staff_template():
    columns = [
        "first_name",
        "middle_name",
        "last_name",
        "email",
        "branch",
        "designation",
        "qualifications",
        "joined_year",
        "dob",
        "gender",
        "profile_picture",
        "mobile_number",
        "address",
        "emergency_name",
        "emergency_mobile_number",
        "emergency_relation",
    ]

    return pd.DataFrame(columns=columns)

def student_template():
    columns = [
            "first_name",
            "middle_name",
            "last_name",
            "email",
            "branch",
            "semester",
            "admission_year",
            "dob",
            "gender",
            "profile_picture",
            "mobile_number",
            "address",
            "parents_name",
            "parents_mobile_number",
        ]

    return pd.DataFrame(columns=columns)
