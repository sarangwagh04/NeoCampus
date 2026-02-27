// ✅ CONNECTED TO DJANGO BACKEND
// Only this file handles API logic

import { useState, useEffect, useCallback } from "react";
import api from "@/api/axios";

export interface StudentProfile {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: Date;
  email: string;
  mobileNumber: string;
  address: string;
  profilePicture: string;

  branch: string;
  semester: number;
  admissionYear: number;
  batchId: string;
  role: string;
  collegeId: string;

  parentName: string;
  parentMobileNumber: string;

  profileCreatedAt: Date;
  lastLoginAt: Date;
}

export interface EditableProfileFields {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: Date;
  email: string;
  mobileNumber: string;
  address: string;
  semester: number;
  admissionYear: number;
  batchId: string;
  parentName: string;
}

export function useStudentProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ FETCH PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/student/profile/");
        const data = response.data;

        setProfile({
          firstName: data.first_name,
          middleName: data.middle_name || "",
          lastName: data.last_name,
          gender: data.gender,
          dateOfBirth: data.dob ? new Date(data.dob) : new Date(),
          email: data.email,
          mobileNumber: data.mobile_number,
          address: data.address,
          profilePicture: data.profile_picture
            ? `http://127.0.0.1:8000${data.profile_picture}`
            : "",

          branch: data.branch,
          semester: Number(data.semester),
          admissionYear: Number(data.admission_year),
          batchId: data.batch_id,
          role: data.role,
          collegeId: data.username,

          parentName: data.parents_name,
          parentMobileNumber: data.parents_mobile_number,

          profileCreatedAt: new Date(data.date_created),
          lastLoginAt: data.last_login ? new Date(data.last_login) : new Date(),
        });
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ✅ UPDATE PROFILE
  const updateProfile = useCallback(
    async (updates: Partial<EditableProfileFields>): Promise<boolean> => {
      if (!profile) return false;

      setIsSaving(true);

      try {
        await api.put("/student/profile/", {
          first_name: updates.firstName,
          middle_name: updates.middleName,
          last_name: updates.lastName,
          gender: updates.gender,
          dob:
            updates.dateOfBirth instanceof Date
              ? updates.dateOfBirth.toISOString().split("T")[0]
              : typeof updates.dateOfBirth === "string"
                ? updates.dateOfBirth
                : null,
          email: updates.email,
          mobile_number: updates.mobileNumber,
          address: updates.address,
          parents_name: updates.parentName,
        });

        // Refetch updated profile
        const refreshed = await api.get("/student/profile/");
        const data = refreshed.data;

        setProfile(prev => ({
          ...prev!,
          firstName: data.first_name,
          middleName: data.middle_name,
          lastName: data.last_name,
          gender: data.gender,
          dateOfBirth: new Date(data.dob),
          email: data.email,
          mobileNumber: data.mobile_number,
          address: data.address,
          parentName: data.parents_name,
        }));

        return true;
      } catch (error: any) {
        console.error("Update failed", error.response?.data);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [profile]
  );

  const updateProfilePicture = async (file: File): Promise<boolean> => {
    if (!profile) return false;

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("profile_picture", file);

      await api.put("/student/profile/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refetch updated profile
      const refreshed = await api.get("/student/profile/");
      const data = refreshed.data;

      setProfile(prev => ({
        ...prev!,
        profilePicture: data.profile_picture
          ? `http://127.0.0.1:8000${data.profile_picture}`
          : "",
      }));

      return true;
    } catch (error) {
      console.error("Profile picture update failed:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
    validateEmail,
    validateMobile,
  };
}