import { useState, useMemo, useEffect } from "react";
import api from "@/api/axios";
import { generateMarksheetPDF } from "@/utils/generateMarksheetPDF";
import { toast } from "sonner";

/* -------------------- TYPES & INTERFACES -------------------- */
interface StudentProfile {
  first_name: string;
  middle_name?: string;
  last_name: string;
  branch: string;
  semester: string;
  college_id: string;
}

export interface SubjectResult {
  code: string;
  name: string;
  credits: number;
  internalMarks: number;
  internalMax: number;
  externalMarks: number;
  externalMax: number;
  totalMarks: number;
  maxMarks: number;
  status: "Pass" | "Fail";
  grade: string;
}

export interface SemesterResult {
  semester: number;
  examType: string;
  sgpa: number;
  totalCredits: number;
  earnedCredits: number;
  subjects: SubjectResult[];
  isPublished: boolean;
}

export interface Backlog {
  subjectCode: string;
  subjectName: string;
  semester: number;
  attemptCount: number;
  status: "Pending" | "Cleared";
}

export interface PerformanceTrend {
  semester: number;
  sgpa: number;
  cgpa: number;
}

/* -------------------- MOCK DATA (UNCHANGED) -------------------- */
// const mockResults: SemesterResult[] = [ /* unchanged */];
const mockBacklogs: Backlog[] = [
  { subjectCode: "CS403", subjectName: "Computer Architecture", semester: 4, attemptCount: 1, status: "Pending" },
];




/* ===============================================================
   UPDATED HOOK
   =============================================================== */

export function useStudentResults() {

  const [isLoading, setIsLoading] = useState(false);

  // ✅ NEW STATE: backend summary data
  const [backendSummary, setBackendSummary] = useState({
    currentSgpa: 0,
    totalBacklogs: 0,
    creditsEarned: 0,
    totalCredits: 0,
    latestSemester: 0,
  });

  /* ===============================================================
     ✅ NEW: FETCH SUMMARY FROM BACKEND
     =============================================================== */
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get("/results/student/summary/");
        setBackendSummary(response.data); // ✅ store backend data
      } catch (error) {
        console.error("Failed to load student summary");
      }
    };

    fetchSummary();
  }, []);


  const [currentResult, setCurrentResult] = useState<SemesterResult | null>(null);
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/results/student/results/");
        setCurrentResult(response.data);
      } catch (error) {
        console.error("Failed to load subject results");
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, []);



  const overallStats = useMemo(() => {
    return {
      currentSgpa: backendSummary.currentSgpa,
      totalBacklogs: backendSummary.totalBacklogs,
      creditsEarned: backendSummary.creditsEarned,
      totalCredits: backendSummary.totalCredits,
      overallStatus:
        backendSummary.totalBacklogs > 0 ? "Has Backlogs" : "Pass",
      latestSemester: backendSummary.latestSemester,
    };
  }, [backendSummary]);



  const [studentProfile, setStudentProfile] =
    useState<StudentProfile | null>(null);


  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const response = await api.get("results/student/profile/");
        setStudentProfile(response.data);
      } catch (error) {
        console.error("Failed to load student profile");
      }
    };

    fetchStudentProfile();
  }, []);

  const downloadMarksheet = () => {
    if (!currentResult || !studentProfile) {
      toast.error("Missing student data");
      return;
    }


    const fullName = [
      studentProfile.first_name,
      studentProfile.middle_name,
      studentProfile.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    try {
      const hasFailedSubjects = currentResult.subjects.some((s) => s.status === "Fail");

      generateMarksheetPDF({
        studentName: fullName,
        collegeId: studentProfile.college_id,
        branch: studentProfile.branch,
        semester: Number(studentProfile.semester),
        subjects: currentResult.subjects,
        sgpa: currentResult.sgpa,
        totalCredits: currentResult.totalCredits,
        earnedCredits: currentResult.earnedCredits,
        result: hasFailedSubjects ? "FAIL" : "PASS",
      });

      toast.success("Marksheet downloaded successfully!");
    } catch (error) {
      console.error("Error generating marksheet:", error);
      toast.error("Failed to generate marksheet. Please try again.");
    }
  };

  const [backlogs, setBacklogs] = useState<Backlog[]>([]);

  useEffect(() => {
    const fetchBacklogs = async () => {
      try {
        const response = await api.get("/results/student/backlogs/");
        setBacklogs(response.data);
      } catch (error) {
        console.error("Failed to load backlogs");
      }
    };

    fetchBacklogs();
  }, []);


  return {
    currentResult,
    overallStats,
    backlogs,
    isLoading,
    downloadMarksheet,
  };
}