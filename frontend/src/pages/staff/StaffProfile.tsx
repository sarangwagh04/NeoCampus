import { useState, useEffect } from "react";
import { StaffDashboardLayout } from "@/components/staff/StaffDashboardLayout";
import { StaffProfileHeader } from "@/components/staff/profile/StaffProfileHeader";
import { StaffPersonalInfoSection } from "@/components/staff/profile/StaffPersonalInfoSection";
import { StaffProfessionalInfoSection } from "@/components/staff/profile/StaffProfessionalInfoSection";
import { StaffEmergencyContactSection } from "@/components/staff/profile/StaffEmergencyContactSection";
import { StaffSystemInfoSection } from "@/components/staff/profile/StaffSystemInfoSection";
import { Button } from "@/components/ui/button";
import { InlineBanner } from "@/components/ui/inline-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { useStaffProfile, EditableStaffFields } from "@/hooks/useStaffProfile";
import { Edit, X, Save, Loader2 } from "lucide-react";

export default function StaffProfile() {
  const { profile, isLoading, isSaving, updateProfile, updateProfilePicture, validateMobile } = useStaffProfile();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<EditableStaffFields>({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "Male",
    dateOfBirth: new Date(),
    mobileNumber: "",
    address: "",
    qualifications: "",
    emergencyContactName: "",
    emergencyMobileNumber: "",
    emergencyRelation: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        middleName: profile.middleName,
        lastName: profile.lastName,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth,
        mobileNumber: profile.mobileNumber,
        address: profile.address,
        qualifications: profile.qualifications,
        emergencyContactName: profile.emergencyContactName,
        emergencyMobileNumber: profile.emergencyMobileNumber,
        emergencyRelation: profile.emergencyRelation,
      });
    }
  }, [profile]);

  const handleEditToggle = () => {
    if (isEditMode && profile) {
      // Reset form data on cancel
      setFormData({
        firstName: profile.firstName,
        middleName: profile.middleName,
        lastName: profile.lastName,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth,
        mobileNumber: profile.mobileNumber,
        address: profile.address,
        qualifications: profile.qualifications,
        emergencyContactName: profile.emergencyContactName,
        emergencyMobileNumber: profile.emergencyMobileNumber,
        emergencyRelation: profile.emergencyRelation,
      });
      setErrors({});
    }
    setIsEditMode(!isEditMode);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleFieldChange = (field: string, value: string | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!validateMobile(formData.mobileNumber)) {
      newErrors.mobileNumber = "Invalid mobile number format";
    }
    if (formData.emergencyMobileNumber && !validateMobile(formData.emergencyMobileNumber)) {
      newErrors.emergencyMobileNumber = "Invalid mobile number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const success = await updateProfile(formData);
    if (success) {
      setIsEditMode(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage("Failed to update profile. Please try again.");
    }
  };

  const handlePictureChange = async (file: File) => {
    setIsUploadingPicture(true);
    const success = await updateProfilePicture(file);
    setIsUploadingPicture(false);
    
    if (success) {
      setSuccessMessage("Profile picture updated!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage("Failed to upload picture.");
    }
  };

  if (isLoading) {
    return (
      <StaffDashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-80" />
              <Skeleton className="h-60" />
            </div>
          </div>
        </div>
      </StaffDashboardLayout>
    );
  }

  if (!profile) return null;

  return (
    <StaffDashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header with Edit/Save buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground text-sm">
              Manage your personal and professional information
            </p>
          </div>
          <div className="flex gap-2">
            {isEditMode ? (
              <>
                <Button variant="outline" onClick={handleEditToggle} disabled={isSaving}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={handleEditToggle}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Banners */}
        {successMessage && (
          <InlineBanner
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        )}
        {errorMessage && (
          <InlineBanner
            type="error"
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        )}

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Header */}
          <div className="space-y-6">
            <StaffProfileHeader
              profilePicture={profile.profilePicture}
              firstName={formData.firstName}
              middleName={formData.middleName}
              lastName={formData.lastName}
              collegeId={profile.collegeId}
              role={profile.role}
              designation={profile.designation}
              onPictureChange={handlePictureChange}
              isUploading={isUploadingPicture}
              isEditMode={isEditMode}
            />
            
            {/* System Info */}
            <StaffSystemInfoSection
              isActive={profile.isActive}
              createdAt={profile.createdAt}
              lastLogin={profile.lastLogin}
            />
          </div>

          {/* Right Column - Info Sections */}
          <div className="lg:col-span-2 space-y-6">
            <StaffPersonalInfoSection
              firstName={formData.firstName}
              middleName={formData.middleName}
              lastName={formData.lastName}
              gender={formData.gender}
              dateOfBirth={formData.dateOfBirth}
              mobileNumber={formData.mobileNumber}
              address={formData.address}
              isEditMode={isEditMode}
              errors={errors}
              onFieldChange={handleFieldChange}
            />

            <StaffProfessionalInfoSection
              branch={profile.branch}
              designation={profile.designation}
              qualifications={formData.qualifications}
              joinedYear={profile.joinedYear}
              role={profile.role}
              collegeId={profile.collegeId}
              isEditMode={isEditMode}
              onFieldChange={handleFieldChange}
            />

            <StaffEmergencyContactSection
              emergencyContactName={formData.emergencyContactName}
              emergencyMobileNumber={formData.emergencyMobileNumber}
              emergencyRelation={formData.emergencyRelation}
              isEditMode={isEditMode}
              errors={errors}
              onFieldChange={handleFieldChange}
            />
          </div>
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
