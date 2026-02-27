import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ResultsSummaryCards } from "@/components/results/ResultsSummaryCards";
import { SubjectResultsTable } from "@/components/results/SubjectResultsTable";
import { BacklogsSection } from "@/components/results/BacklogsSection";
import { MarksheetDownload } from "@/components/results/MarksheetDownload";
import { ResultsEmptyState } from "@/components/results/ResultsEmptyState";
import { useStudentResults } from "@/hooks/useStudentResults";
import { GraduationCap } from "lucide-react";

const Results = () => {
  const {
    currentResult,
    overallStats,
    backlogs,
    isLoading,
    downloadMarksheet,
  } = useStudentResults();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Examination Results
              </h1>
              <p className="text-muted-foreground mt-1">
                View your academic performance and download college marksheet
              </p>
            </div>
          </div>
        </div>

        {/* Overall Performance Summary */}
        <ResultsSummaryCards stats={overallStats} />


        {/* Content based on result availability */}
        {!currentResult ? (
          <ResultsEmptyState type="no-data" />
        ) : !currentResult.isPublished ? (
          <ResultsEmptyState type="not-published" semester={currentResult.semester} />
        ) : (
          <>
            {/* Subject Results Table */}
            <SubjectResultsTable
              subjects={currentResult.subjects}
              isLoading={isLoading}
            />

            {/* Marksheet Download */}
              <MarksheetDownload
                semester={currentResult.semester}
                examType={currentResult.examType}
                onDownload={downloadMarksheet}
              />
            
          </>
        )}

        {/* Backlogs Section */}
        <BacklogsSection backlogs={backlogs} />
      </div>
    </DashboardLayout>
  );
};

export default Results;
