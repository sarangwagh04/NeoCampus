// ✅ CONNECTED TO DJANGO BACKEND
// Only this file changed

import { useState, useEffect, useCallback } from "react";
import api from "@/api/axios";

export interface StaffProfileData {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: Date;
  mobileNumber: string;
  address: string;
  profilePicture: string;

  branch: string;
  designation: string;
  qualifications: string;
  joinedYear: number;
  role: string;
  collegeId: string;

  emergencyContactName: string;
  emergencyMobileNumber: string;
  emergencyRelation: string;

  isActive: boolean;
  createdAt: Date;
  lastLogin: Date;
}

export interface EditableStaffFields {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: Date;
  mobileNumber: string;
  address: string;
  qualifications: string;
  emergencyContactName: string;
  emergencyMobileNumber: string;
  emergencyRelation: string;
}

export function useStaffProfile() {
  const [profile, setProfile] = useState<StaffProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ FETCH FROM DJANGO
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/staff/profile/");
        const data = response.data;

        setProfile({
          firstName: data.first_name,
          middleName: data.middle_name || "",
          lastName: data.last_name,
          gender: data.gender,
          dateOfBirth: data.dob ? new Date(data.dob) : new Date(),
          mobileNumber: data.mobile_number,
          address: data.address,
          profilePicture: data.profile_picture
            ? `http://127.0.0.1:8000${data.profile_picture}`
            : "",

          branch: data.branch,
          designation: data.designation,
          qualifications: data.qualifications,
          joinedYear: Number(data.joined_year),
          role: data.role,
          collegeId: data.username || "",

          emergencyContactName: data.emergency_name,
          emergencyMobileNumber: data.emergency_mobile_number,
          emergencyRelation: data.emergency_relation,

          isActive: data.is_active,
          createdAt: new Date(data.date_created),
          lastLogin: data.last_login
            ? new Date(data.last_login)
            : new Date(),
        });
      } catch (error) {
        console.error("Failed to fetch staff profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ✅ UPDATE PROFILE
  const updateProfile = useCallback(
    async (updates: Partial<EditableStaffFields>): Promise<boolean> => {
      if (!profile) return false;

      setIsSaving(true);

      try {
        await api.put("/staff/profile/", {
          first_name: updates.firstName,
          middle_name: updates.middleName,
          last_name: updates.lastName,
          gender: updates.gender,
          dob:
            updates.dateOfBirth instanceof Date
              ? updates.dateOfBirth.toISOString().split("T")[0]
              : null,
          mobile_number: updates.mobileNumber,
          address: updates.address,
          qualifications: updates.qualifications,
          emergency_name: updates.emergencyContactName,
          emergency_mobile_number: updates.emergencyMobileNumber,
          emergency_relation: updates.emergencyRelation,
        });

        // Refetch updated
        const refreshed = await api.get("/staff/profile/");
        const data = refreshed.data;

        setProfile(prev => ({
          ...prev!,
          firstName: data.first_name,
          middleName: data.middle_name,
          lastName: data.last_name,
          gender: data.gender,
          dateOfBirth: new Date(data.dob),
          mobileNumber: data.mobile_number,
          address: data.address,
          qualifications: data.qualifications,
          emergencyContactName: data.emergency_name,
          emergencyMobileNumber: data.emergency_mobile_number,
          emergencyRelation: data.emergency_relation,
        }));

        return true;
      } catch (error: any) {
        console.error("Staff update failed:", error.response?.data);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [profile]
  );

  // ✅ PROFILE PICTURE
  const updateProfilePicture = async (file: File): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append("profile_picture", file);

      await api.put("/staff/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return true;
    } catch (error) {
      console.error("Staff image upload failed:", error);
      return false;
    }
  };

  const validateMobile = (mobile: string): boolean => {
    const mobileRegex = /^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/;
    return mobileRegex.test(mobile.replace(/\s/g, ""));
  };

  return {
    profile,
    isLoading,
    isSaving,
    updateProfile,
    updateProfilePicture,
    validateMobile,
  };
}