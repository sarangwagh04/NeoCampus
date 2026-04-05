import { useState, useCallback } from "react";

export type AnalysisMethod = "traditional" | "ai" | null;

export interface AnalysisMetadata {
  class: string;
  semester: string;
  branch: string;
  academicYear: string;
  examName: string;
  department: string;
}

export interface SubjectResult {
  srNo: number;
  subjectName: string;
  examHead: "TH" | "PR" | "OR" | "TW";
  appeared: number;
  passed: number;
  failed: number;
  passingPercentage: number;
  teacherName: string;
}

export interface ClassSummary {
  className: string;
  appeared: number;
  firstClassDistinction: number;
  firstClass: number;
  higherSecondClass: number;
  secondClass: number;
  passClass: number;
  totalPass: number;
  remark: string;
}

export interface Topper {
  rank: number;
  name: string;
  sgpa: number;
}

export interface AnalysisReport {
  collegeName: string;
  referenceNumber: string;
  date: string;
  term: string;
  exam: string;
  academicYear: string;
  classAndBranch: string;
  subjectResults: SubjectResult[];
  classSummary: ClassSummary[];
  toppers: Topper[];
}

// Mock data for demo
const generateMockReport = (metadata: AnalysisMetadata): AnalysisReport => ({
  collegeName: "Dr. Vithalrao Vikhe Patil College of Engineering, Viladghat",

  referenceNumber: `DVVP/EXAM/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000)}`,
  date: new Date().toLocaleDateString("en-IN"),
  term: metadata.semester,
  exam: metadata.examName,
  academicYear: metadata.academicYear,
  classAndBranch: `${metadata.class} - ${metadata.branch}`,
  subjectResults: [],
  classSummary: [
    { className: "F.E.", appeared: 120, firstClassDistinction: 15, firstClass: 35, higherSecondClass: 25, secondClass: 20, passClass: 15, totalPass: 110, remark: "Good" },
    { className: "S.E.", appeared: 65, firstClassDistinction: 8, firstClass: 20, higherSecondClass: 15, secondClass: 12, passClass: 5, totalPass: 60, remark: "Satisfactory" },
    { className: "T.E.", appeared: 58, firstClassDistinction: 10, firstClass: 18, higherSecondClass: 12, secondClass: 10, passClass: 4, totalPass: 54, remark: "Good" },
    { className: "B.E.", appeared: 52, firstClassDistinction: 12, firstClass: 22, higherSecondClass: 8, secondClass: 6, passClass: 2, totalPass: 50, remark: "Excellent" },
  ],
  toppers: [],
});

export function useResultAnalysis() {
  const [selectedMethod, setSelectedMethod] = useState<AnalysisMethod>(null);
  const [metadata, setMetadata] = useState<AnalysisMetadata>({
    class: "",
    semester: "",
    branch: "",
    academicYear: "",
    examName: "",
    department: "",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isMetadataComplete =
    metadata.class !== "" &&
    metadata.semester !== "" &&
    metadata.branch !== "" &&
    metadata.academicYear !== "" &&
    metadata.examName !== "";

  const updateMetadata = useCallback((field: keyof AnalysisMetadata, value: string) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a valid PDF file");
      return;
    }
    setUploadedFile(file);
    setError(null);
  }, []);

  const removeFile = useCallback(() => {
    setUploadedFile(null);
  }, []);

  const generateAnalysis = useCallback(async () => {
    if (!uploadedFile || !isMetadataComplete) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const res = await fetch("/api/result-analysis/analyze/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to analyze PDF");
      }

      const data = await res.json();

      /* 🔁 Map backend → frontend structure */

      const subjectResults: SubjectResult[] = data.subjects.map(
        (s: any, index: number) => {
          const headMatch = s.subject.match(/\((.*?)\)$/);
          return {
            srNo: index + 1,
            subjectName: s.subject.replace(/\s*\(.*?\)/, ""),
            examHead: (headMatch?.[1] || "TH") as any,
            appeared: s.appeared,
            passed: s.passed,
            failed: s.failed,
            passingPercentage: s.pass_percentage,
            teacherName: "-", // future use
          };
        }
      );

      const toppers: Topper[] = data.toppers.map(
        (t: any, index: number) => ({
          rank: index + 1,
          name: t.Name,
          sgpa: t.SGPA,
        })
      );

      const finalReport: AnalysisReport = {
        ...generateMockReport(metadata), // keep dummy metadata-based fields
        classAndBranch: `${data.class_name} - ${metadata.branch || "Branch"}`,
        subjectResults,
        toppers,
      };

      setReport(finalReport);
    } catch (err) {
      setError("Failed to process the PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedFile, isMetadataComplete, metadata]);

  const resetAnalysis = useCallback(() => {
    setSelectedMethod(null);
    setMetadata({
      class: "",
      semester: "",
      branch: "",
      academicYear: "",
      examName: "",
      department: "",
    });
    setUploadedFile(null);
    setReport(null);
    setError(null);
  }, []);

  return {
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
  };
}
