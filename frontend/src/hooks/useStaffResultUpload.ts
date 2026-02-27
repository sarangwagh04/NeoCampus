import { useState, useEffect, useCallback } from "react";
import api from "@/api/axios";

export interface AcademicContext {
  batchId: string;
  semester?: string;
  examType?: string;
}

export interface StudentResult {
  rollNumber: string;
  subjectName: string;
  internalMarks: string;
  externalMarks: string;
  totalMarks: string;
  maxMarks: number;
  grade: string;
  status: "Pass" | "Fail";
}

export interface ResultSummary {
  totalStudents: number;
  passed: number;
  failed: number;
  averageMarks: number;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  upload_id: number;

}

export interface ClassPerformance {
  batch: string;
  averageAttendance: number;
  averageScore: number;
}

type UploadStep = 1 | 2 | 3 | 4;


export function useStaffResultUpload() {

  const [currentStep, setCurrentStep] = useState<UploadStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [academicContext, setAcademicContext] = useState<AcademicContext>({
    batchId: "",
    semester: "",
    examType: "",
  });

  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [parsedResults, setParsedResults] = useState<StudentResult[]>([]);
  const [backendSummary, setBackendSummary] = useState<ResultSummary | null>(null); // ✅ MOVED INSIDE
  const [isPublished, setIsPublished] = useState(false);

  const [classPerformance, setClassPerformance] = useState<ClassPerformance[] | null>(null);
  const [performanceLoading, setPerformanceLoading] = useState(true);

  const isContextComplete = Boolean(academicContext.batchId);

  const updateContext = useCallback((field: keyof AcademicContext, value: string) => {
    setAcademicContext((prev) => ({ ...prev, [field]: value }));
  }, []);

  

  // ============================================
  // FILE UPLOAD (USES BACKEND PREVIEW)
  // ============================================

  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    if (
      !validTypes.includes(file.type) &&
      !file.name.endsWith(".csv") &&
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls")
    ) {
      setError("Invalid file format.");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("batch_id", academicContext.batchId);

      const response = await api.post("/results/upload/", formData);

      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        upload_id: response.data.upload_id,  // ADD THIS

      });

      // ✅ Use backend preview + summary
      setParsedResults(response.data.preview);
      setBackendSummary(response.data.summary);

      setCurrentStep(3);

    } catch (err) {
      setError("Failed to upload file.");
    } finally {
      setIsLoading(false);
    }
  }, [academicContext.batchId]);

  const removeFile = useCallback(() => {
    setUploadedFile(null);
    setParsedResults([]);
    setBackendSummary(null); // ✅ reset summary also
    setCurrentStep(2);
  }, []);

  const proceedToUpload = useCallback(() => {
    if (isContextComplete) {
      setCurrentStep(2);
    }
  }, [isContextComplete]);

  const publishResults = useCallback(async () => {
  setIsLoading(true);
  setError(null);

  try {
    await api.post(`/results/publish/${uploadedFile?.upload_id}/`);
    setIsPublished(true);
    setCurrentStep(4);

    fetchPerformance(); // Refresh class performance after publishing


  } catch (err) {
    setError("Failed to publish results.");
  } finally {
    setIsLoading(false);
  }
}, [uploadedFile]);

  const resetUpload = useCallback(() => {
    setCurrentStep(1);
    setAcademicContext({
      batchId: "",
      semester: "",
      examType: "",
    });
    setUploadedFile(null);
    setParsedResults([]);
    setBackendSummary(null); // ✅ reset
    setIsPublished(false);
    setError(null);
  }, []);


// ============================================
  // CLASS PERFORMANCE (NEW SECTION)
  // ============================================

  const fetchPerformance = async () => {
    try {
      setPerformanceLoading(true);
      const response = await api.get("/results/performance/");
      setClassPerformance(response.data);
    } catch (error) {
      console.error("Failed to load performance", error);
    } finally {
      setPerformanceLoading(false);
    }
  };

  // ✅ Load performance on mount
  useEffect(() => {
    fetchPerformance();
  }, []);


  return {
    currentStep,
    setCurrentStep,
    isLoading,
    error,
    academicContext,
    updateContext,
    isContextComplete,
    uploadedFile,
    handleFileUpload,
    removeFile,
    parsedResults,
    summary: backendSummary,  // ✅ backend summary only
    proceedToUpload,
    publishResults,
    isPublished,
    resetUpload,
    classPerformance,
    performanceLoading,
  };
}