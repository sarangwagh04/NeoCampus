import { StaffDashboardLayout } from "@/components/staff/StaffDashboardLayout";
import { AnalysisMethodSelector } from "@/components/staff/analysis/AnalysisMethodSelector";
import { AnalysisUploadForm } from "@/components/staff/analysis/AnalysisUploadForm";
import { AnalysisProcessing } from "@/components/staff/analysis/AnalysisProcessing";
import { AnalysisReportView } from "@/components/staff/analysis/AnalysisReportView";
import { useResultAnalysis } from "@/hooks/useResultAnalysis";
import { BarChart2 } from "lucide-react";
export default function StaffResultAnalysis() {
  const {
    selectedMethod,
    setSelectedMethod,
    metadata,
    updateMetadata,
    isMetadataComplete,
    uploadedFile,
    handleFileUpload,
    removeFile,
    isProcessing,
    report,
    error,
    generateAnalysis,
    resetAnalysis,
  } = useResultAnalysis();

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <BarChart2 className="h-7 w-7 text-primary" />
            Result Analysis
          </h1>
          <p className="text-muted-foreground">
            Generate institutional result analysis reports
          </p>
        </div>

        {/* Workflow Steps */}
        {isProcessing ? (
          <AnalysisProcessing />
        ) : report ? (
          <AnalysisReportView 
            report={report} 
            onReset={resetAnalysis}
          />
        ) : selectedMethod === "traditional" ? (
          <AnalysisUploadForm
            metadata={metadata}
            onUpdateMetadata={updateMetadata}
            isMetadataComplete={isMetadataComplete}
            uploadedFile={uploadedFile}
            onFileUpload={handleFileUpload}
            onRemoveFile={removeFile}
            onGenerate={generateAnalysis}
            onBack={() => setSelectedMethod(null)}
            isProcessing={isProcessing}
            error={error}
          />
        ) : (
          <AnalysisMethodSelector onSelect={setSelectedMethod} />
        )}
      </div>
    </StaffDashboardLayout>
  );
}
