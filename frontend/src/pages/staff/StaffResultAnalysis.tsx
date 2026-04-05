import { StaffDashboardLayout } from "@/components/staff/StaffDashboardLayout";
import { AnalysisMethodSelector } from "@/components/staff/analysis/AnalysisMethodSelector";
import { AnalysisUploadForm } from "@/components/staff/analysis/AnalysisUploadForm";
import { AnalysisProcessing } from "@/components/staff/analysis/AnalysisProcessing";
import { AnalysisReportView } from "@/components/staff/analysis/AnalysisReportView";

import { AIUploadForm } from "@/components/staff/analysis/AIUploadForm";
import { AIProcessing } from "@/components/staff/analysis/AIProcessing";
import { AIColumnSelector } from "@/components/staff/analysis/AIColumnSelector";
import { AIValueMapping } from "@/components/staff/analysis/AIValueMapping";
import { AIFieldMapping } from "@/components/staff/analysis/AIFieldMapping";

import { useResultAnalysis } from "@/hooks/useResultAnalysis";
import { useAIResultAnalysis } from "@/hooks/useAIResultAnalysis";

import { BarChart2 } from "lucide-react";
import { useState } from "react";

import type { AnalysisMethod } from "@/hooks/useResultAnalysis";

export default function StaffResultAnalysis() {

  /* -------------------------------------------------------------------------- */
  /* 🔁 CHANGED: Method state moved to this component to control BOTH flows    */
  /* Previously: managed only inside useResultAnalysis                          */
  /* Now: this component decides whether AI or Traditional flow is active      */
  /* -------------------------------------------------------------------------- */

  const [selectedMethod, setSelectedMethod] = useState<AnalysisMethod>(null);


  /* -------------------------------------------------------------------------- */
  /* 🔁 CHANGED: Traditional hook renamed to "traditional" instance             */
  /* No internal logic changed                                                  */
  /* -------------------------------------------------------------------------- */

  const traditional = useResultAnalysis();


  /* -------------------------------------------------------------------------- */
  /* 🔁 NEW: AI hook instance                                                   */
  /* Handles the full AI analysis workflow                                      */
  /* -------------------------------------------------------------------------- */

  const ai = useAIResultAnalysis();


  /* -------------------------------------------------------------------------- */
  /* 🔁 NEW: Handle method selection from selector                              */
  /* -------------------------------------------------------------------------- */

  const handleMethodSelect = (method: AnalysisMethod) => {

    setSelectedMethod(method);

    /* -------------------------------------------------------------- */
    /* Maintain previous behaviour for traditional method             */
    /* -------------------------------------------------------------- */

    if (method === "traditional") {
      traditional.setSelectedMethod("traditional");
    }

    /* AI method requires no initialization here */
  };


  /* -------------------------------------------------------------------------- */
  /* 🔁 NEW: Unified reset handler for both systems                             */
  /* -------------------------------------------------------------------------- */

  const handleBackToSelector = () => {

    setSelectedMethod(null);

    /* Reset traditional workflow */
    traditional.resetAnalysis();

    /* Reset AI workflow */
    ai.resetAll();
  };


  /* -------------------------------------------------------------------------- */
  /* 🔁 NEW: Render AI Workflow                                                 */
  /* This keeps main JSX clean and easier to maintain                          */
  /* -------------------------------------------------------------------------- */

  const renderAIFlow = () => {

    switch (ai.step) {

      /* -------------------------------------------------------------- */
      /* Step 1: Upload file                                            */
      /* -------------------------------------------------------------- */

      case "upload":
        return (
          <AIUploadForm
            onFileUpload={ai.handleFileUpload}
            onBack={handleBackToSelector}
            error={ai.error}
          />
        );


      /* -------------------------------------------------------------- */
      /* Step 2: AI processing upload                                   */
      /* -------------------------------------------------------------- */

      case "processing-upload":
        return <AIProcessing stage="upload" />;


      /* -------------------------------------------------------------- */
      /* Step 3: Column selection                                       */
      /* -------------------------------------------------------------- */

      case "column-select":

        return ai.parsedData ? (
          <AIColumnSelector
            parsedData={ai.parsedData}
            onSelectColumn={ai.handleColumnSelect}
            onBack={ai.goBack}
          />
        ) : null;


      /* -------------------------------------------------------------- */
      /* Step 4: Pass/Fail mapping                                      */
      /* -------------------------------------------------------------- */

      case "value-mapping":

        return ai.selectedColumn ? (
          <AIValueMapping
            columnName={ai.selectedColumn}
            valueMappings={ai.valueMappings}
            onUpdateMapping={ai.updateValueMapping}
            allMapped={ai.allMapped}
            onGenerate={ai.proceedToFieldMapping}
            onBack={ai.goBack}
          />
        ) : null;
      case "field-mapping":
        return ai.parsedData ? (
          <AIFieldMapping
            columns={ai.parsedData.columns.map(c => c.name)}
            fieldMappings={ai.fieldMappings}
            onUpdateMapping={ai.updateFieldMapping}
            allRequiredMapped={ai.allRequiredFieldsMapped}
            onProceed={ai.generateReport}
            onBack={ai.goBack}
          />
        ) : null;


      /* -------------------------------------------------------------- */
      /* Step 5: Generate AI analysis                                   */
      /* -------------------------------------------------------------- */

      case "generating":
        return <AIProcessing stage="generating" />;


      /* -------------------------------------------------------------- */
      /* Step 6: Final Report                                           */
      /* Reuses the SAME report component as traditional method         */
      /* -------------------------------------------------------------- */

      case "report":

        return ai.report ? (
          <AnalysisReportView
            report={ai.report}
            onReset={handleBackToSelector}
          />
        ) : null;


      default:
        return null;
    }
  };


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


        {/* ------------------------------------------------------------------ */}
        {/* 🔁 CHANGED: Main workflow logic now supports BOTH methods          */}
        {/* Traditional logic preserved exactly as before                      */}
        {/* ------------------------------------------------------------------ */}


        {selectedMethod === "ai" ? (

          /* ------------------- AI FLOW ------------------- */

          renderAIFlow()

        ) : selectedMethod === "traditional" ? (

          /* ---------------- TRADITIONAL FLOW (UNCHANGED) ---------------- */

          traditional.isProcessing ? (

            <AnalysisProcessing />

          ) : traditional.report ? (

            <AnalysisReportView
              report={traditional.report}
              onReset={handleBackToSelector}
            />

          ) : (

            <AnalysisUploadForm
              metadata={traditional.metadata}
              onUpdateMetadata={traditional.updateMetadata}
              isMetadataComplete={traditional.isMetadataComplete}
              uploadedFile={traditional.uploadedFile}
              onFileUpload={traditional.handleFileUpload}
              onRemoveFile={traditional.removeFile}
              onGenerate={traditional.generateAnalysis}
              onBack={handleBackToSelector}
              isProcessing={traditional.isProcessing}
              error={traditional.error}
            />

          )

        ) : (

          /* ---------------- METHOD SELECTOR ---------------- */

          <AnalysisMethodSelector onSelect={handleMethodSelect} />

        )}

      </div>

    </StaffDashboardLayout>

  );

}
