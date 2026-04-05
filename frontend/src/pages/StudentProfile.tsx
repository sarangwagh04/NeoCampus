import { useState, useCallback, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PersonalInfoSection } from "@/components/profile/PersonalInfoSection";
import { AcademicInfoSection } from "@/components/profile/AcademicInfoSection";
import { GuardianInfoSection } from "@/components/profile/GuardianInfoSection";
import { SystemInfoSection } from "@/components/profile/SystemInfoSection";
import { Button } from "@/components/ui/button";
import { InlineBanner } from "@/components/ui/inline-banner";
import { useStudentProfile, EditableProfileFields } from "@/hooks/useStudentProfile";
import { Edit3, Save, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const StudentProfile = () => {
  const {
    profile,
    isLoading,
    isSaving,
    updateProfile,
    updateProfilePicture,
    validateEmail,
    validateMobile,
  } = useStudentProfile();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<EditableProfileFields | null>(null);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        middleName: profile.middleName,
        lastName: profile.lastName,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth,
        email: profile.email,
        mobileNumber: profile.mobileNumber,
        address: profile.address,
        semester: profile.semester,
        admissionYear: profile.admissionYear,
        batchId: profile.batchId,
        parentName: profile.parentName,
      });
    }
  }, [profile]);

  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData(prev => (prev ? { ...prev, [field]: value } : prev));
  }, []);

  const handleEditToggle = () => {
    if (!profile || !formData) return;

    if (isEditMode) {
      setFormData({
        firstName: profile.firstName,
        middleName: profile.middleName,
        lastName: profile.lastName,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth,
        email: profile.email,
        mobileNumber: profile.mobileNumber,
        address: profile.address,
        semester: profile.semester,
        admissionYear: profile.admissionYear,
        batchId: profile.batchId,
        parentName: profile.parentName,
      });
      setErrors({});
    }

    setIsEditMode(!isEditMode);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSave = async () => {
    if (!formData) return;

    const success = await updateProfile(formData);

    if (success) {
      setIsEditMode(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(null), 5000);
    } else {
      setErrorMessage("Failed to update profile.");
    }
  };

  const handlePictureChange = async (file: File) => {
    setIsUploadingPicture(true);
    await updateProfilePicture(file);
    setIsUploadingPicture(false);
  };

  if (isLoading || !profile || !formData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const fullName = `${profile.firstName} ${profile.middleName ? profile.middleName + " " : ""}${profile.lastName}`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              My Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage your personal information
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleEditToggle}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
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
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Feedback Banners */}
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

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Header & System Info */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProfileHeader
                profilePicture={profile.profilePicture}
                fullName={fullName}
                collegeId={profile.collegeId}
                role={profile.role}
                onPictureChange={handlePictureChange}
                isUploading={isUploadingPicture}
                isEditMode={isEditMode}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <SystemInfoSection
                profileCreatedAt={profile.profileCreatedAt}
                lastLoginAt={profile.lastLoginAt}
              />
            </motion.div>
          </div>

          {/* Right Column - Information Sections */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <PersonalInfoSection
                firstName={isEditMode ? formData.firstName : profile.firstName}
                middleName={isEditMode ? formData.middleName : profile.middleName}
                lastName={isEditMode ? formData.lastName : profile.lastName}
                gender={isEditMode ? formData.gender : profile.gender}
                dateOfBirth={isEditMode ? formData.dateOfBirth : profile.dateOfBirth}
                email={isEditMode ? formData.email : profile.email}
                mobileNumber={isEditMode ? formData.mobileNumber : profile.mobileNumber}
                address={isEditMode ? formData.address : profile.address}
                isEditMode={isEditMode}
                errors={errors}
                onFieldChange={handleFieldChange}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <AcademicInfoSection
                branch={profile.branch}
                semester={profile.semester}
                admissionYear={profile.admissionYear}
                batchId={profile.batchId}
                role={profile.role}
                collegeId={profile.collegeId}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <GuardianInfoSection
                parentName={isEditMode ? formData.parentName : profile.parentName}
                parentMobileNumber={profile.parentMobileNumber}
                isEditMode={isEditMode}
                onFieldChange={handleFieldChange}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;