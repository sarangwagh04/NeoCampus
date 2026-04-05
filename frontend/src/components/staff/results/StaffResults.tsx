import { StaffDashboardLayout } from "@/components/staff/StaffDashboardLayout";
import { AcademicContextForm } from "@/components/staff/results/AcademicContextForm";
import { ResultFileUpload } from "@/components/staff/results/ResultFileUpload";
import { ResultPreviewTable } from "@/components/staff/results/ResultPreviewTable";
import { PublishControls } from "@/components/staff/results/PublishControls";
import { StaffClassInsights } from "@/components/staff/StaffClassInsights";
import { useStaffResultUpload } from "@/hooks/useStaffResultUpload";
import { useStaffData } from "@/hooks/useStaffData";
import { FileUp } from "lucide-react";

export default function StaffResults() {
  const {
    currentStep,
    isLoading,
    error,
    academicContext,
    updateContext,
    isContextComplete,
    uploadedFile,
    handleFileUpload,
    removeFile,
    parsedResults,
    summary,
    proceedToUpload,
    publishResults,
    isPublished,
    resetUpload,
  } = useStaffResultUpload();

  const { data, isLoading: staffLoading } = useStaffData();

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <FileUp className="h-7 w-7 text-primary" />
            Result Upload & Publish
          </h1>
          <p className="text-muted-foreground">
            Upload, validate, and publish student results securely
          </p>
        </div>

        {/* Step-based Upload Flow */}
        <div className="space-y-4">
          {/* Step 1: Academic Context */}
          <AcademicContextForm
            context={academicContext}
            onUpdate={updateContext}
            isComplete={currentStep > 1}
            isFormValid={isContextComplete}
            onProceed={proceedToUpload}
            isActive={currentStep === 1}
          />

          {/* Step 2: File Upload */}
          <ResultFileUpload
            isActive={currentStep >= 2}
            isComplete={currentStep > 2}
            isLoading={isLoading && currentStep === 2}
            uploadedFile={uploadedFile}
            onFileUpload={handleFileUpload}
            onRemoveFile={removeFile}
            error={error}
          />

          {/* Step 3: Preview */}
          <ResultPreviewTable
            isActive={currentStep >= 3}
            results={parsedResults}
            summary={summary}
          />

          {/* Step 4: Publish */}
          <PublishControls
            isActive={currentStep >= 3 && parsedResults.length > 0}
            isPublished={isPublished}
            isLoading={isLoading && currentStep >= 3}
            onPublish={publishResults}
            onReset={resetUpload}
          />
        </div>

        {/* Class Performance Section (moved from dashboard) */}
        <div className="pt-6 border-t">
          <StaffClassInsights 
            performance={data?.classPerformance ?? null} 
            isLoading={staffLoading} 
          />
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
