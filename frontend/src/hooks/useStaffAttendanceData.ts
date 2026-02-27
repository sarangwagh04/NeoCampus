import { useState, useEffect } from "react";
import api from "@/api/axios";

/* ======================================================
   TYPES
====================================================== */

export interface Subject {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface SubjectAssignment {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  batchId: string;
  staffId: string;
  staffName: string;
  semester: number;
  hasTeachingPlan: boolean;
}

export interface AssignedSubject {
  id: string;
  name: string;
  code: string;
  batchId: string;
  semester: number;
  isActive: boolean;
  assignedStaffId: string;
  assignedStaffName: string;
  hasTeachingPlan: boolean;
}

export interface TeachingPlanLecture {
  id: string;
  lectureNumber: number;
  topic: string;
  scheduledDate: string;
  scheduledTime: string;
  isCompleted: boolean;
}

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  attendancePercentage: number;
  attendedLectures: number;
  totalLectures: number; 
}

export interface AttendanceRecord {
  lectureId: string;
  studentId: string;
  isPresent: boolean;
}

export interface LectureAttendance {
  lectureNumber: number;
  topic: string;
  date: string;
  presentCount: number;
  totalCount: number;
}

export interface StaffRole {
  isHod: boolean;
  department: string;
}

/* ======================================================
   STAFF ROLE
====================================================== */

export function useStaffRole() {
  const [role, setRole] = useState<StaffRole | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (stored) {
      const user = JSON.parse(stored);

      setRole({
        isHod: user.is_staff && user.is_hod,
        department: null, // you can add later if needed
      });
    }
  }, []);

  return { role, isLoading: false };
}

/* ======================================================
   MY ASSIGNED SUBJECTS
====================================================== */

export function useAssignedSubjects() {
  const [subjects, setSubjects] = useState<AssignedSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const res = await api.get("/attendance/assignments/my/");
      setSubjects(
        res.data.map((a: any) => ({
          id: a.assignment_id,
          name: a.subject.name,
          code: a.subject.code,
          batchId: a.batch_id,
          semester: a.semester,
          isActive: true,
          assignedStaffId: String(a.staff.id),
          assignedStaffName: a.staff.name,
          hasTeachingPlan: a.has_teaching_plan,
        }))
      );
      setIsLoading(false);
    };
    fetch();
  }, []);

  return { subjects, isLoading };
}

/* ======================================================
   SUBJECT MANAGEMENT (HOD)
====================================================== */

export function useSubjectManagement() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<SubjectAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
    fetchAssignments();
  }, []);

  const fetchSubjects = async () => {
    const res = await api.get("/attendance/subjects/");
    setSubjects(
      res.data.map((s: any) => ({
        id: String(s.id),
        name: s.name,
        code: s.code,
        isActive: s.is_active,
      }))
    );
  };

  const fetchAssignments = async () => {
    const res = await api.get("/attendance/assignments/");
    setAssignments(
      res.data.map((a: any) => ({
        id: a.assignment_id,
        subjectId: String(a.subject.id),
        subjectName: a.subject.name,
        subjectCode: a.subject.code,
        batchId: a.batch_id,
        staffId: String(a.staff.id),
        staffName: a.staff.name,
        semester: a.semester,
        hasTeachingPlan: a.has_teaching_plan,
      }))
    );
    setIsLoading(false);
  };

  const createSubject = async (data: { name: string; code: string }) => {
    const res = await api.post("/attendance/subjects/", data);
    fetchSubjects();
    return res.data;
  };

  const toggleSubjectStatus = async (subjectId: string) => {
    await api.patch(`/attendance/subjects/${subjectId}/toggle/`);
    fetchSubjects();
  };

  const deleteSubject = async (subjectId: string) => {
    await api.delete(`/attendance/subjects/${subjectId}/delete/`);
    fetchSubjects();
  };

  const createAssignment = async (data: {
    subjectId: string;
    staffId: string;
    batchId: string;
  }) => {
    const res = await api.post("/attendance/assignments/", {
      subject_id: data.subjectId,
      staff_id: data.staffId,
      batch_id: data.batchId,
    });
    fetchAssignments();
    return res.data;
  };

  const deleteAssignment = async (assignmentId: string) => {
    await api.delete(`/attendance/assignments/${assignmentId}/`);
    fetchAssignments();
  };

  return {
    subjects,
    assignments,
    isLoading,
    createSubject,
    toggleSubjectStatus,
    deleteSubject,
    createAssignment,
    deleteAssignment,
  };
}

/* ======================================================
   STAFF LIST
====================================================== */

export function useStaffList() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const res = await api.get("/attendance/staff/");
      setStaffList(res.data);
      setIsLoading(false);
    };
    fetch();
  }, []);

  return { staffList, isLoading };
}

/* ======================================================
   BATCH LIST
====================================================== */

export function useBatchList() {
  const [batchList, setBatchList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const res = await api.get("/attendance/batches/");
      setBatchList(res.data);
      setIsLoading(false);
    };
    fetch();
  }, []);

  return { batchList, isLoading };
}

/* ======================================================
   SUBJECT LIST
====================================================== */

export function useSubjectList() {
  const [subjectList, setSubjectList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const res = await api.get("/attendance/subjects/");
      setSubjectList(res.data.filter((s: any) => s.is_active));
      setIsLoading(false);
    };
    fetch();
  }, []);

  return { subjectList, isLoading };
}




/* ======================================================
   Teaching Paln
====================================================== */

export function useTeachingPlan(assignmentId: string | undefined) {
  const [plan, setPlan] = useState<TeachingPlanLecture[]>([]);
  const [subject, setSubject] = useState<AssignedSubject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!assignmentId) {
        setIsLoading(false);
        return;
      }

      try {
        // ✅ Get assignment details safely
        const resAssignment = await api.get(
          "/attendance/assignments/my/"
        );

        const found = resAssignment.data.find(
          (a: any) => a.assignment_id === assignmentId
        );

        if (!found) {
          setIsLoading(false);
          return;
        }

        setSubject({
          id: found.assignment_id,
          name: found.subject.name,
          code: found.subject.code,
          batchId: found.batch_id,
          semester: found.semester,
          isActive: true,
          assignedStaffId: found.staff.id,
          assignedStaffName: found.staff.name,
          hasTeachingPlan: found.has_teaching_plan,
        });

        // ✅ Fetch teaching plan
        const planRes = await api.get(
          `/attendance/assignments/${assignmentId}/teaching-plan/`
        );

        setPlan(
          planRes.data.map((l: any) => ({
            id: String(l.id),
            lectureNumber: l.lecture_number,
            topic: l.topic,
            scheduledDate: l.lecture_date,
            scheduledTime: "09:00",
            isCompleted: l.is_completed,
          }))
        );
      } catch (err) {
        console.error("Teaching plan load failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, [assignmentId]);

  const createPlan = async (
    totalLectures: number,
    lectures: Partial<TeachingPlanLecture>[]
  ) => {
    const payload = lectures.map((l, index) => ({
      lecture_number: index + 1,
      topic: l.topic,
      lecture_date: l.scheduledDate,
    }));

    const res = await api.post(
      `/attendance/assignments/${assignmentId}/teaching-plan/`,
      payload
    );

    const created = res.data.map((l: any) => ({
      id: String(l.id),
      lectureNumber: l.lecture_number,
      topic: l.topic,
      scheduledDate: l.lecture_date,
      scheduledTime: "09:00",
      isCompleted: false,
    }));

    setPlan(created);
    return created;
  };

  const updatePlan = async (lectures: TeachingPlanLecture[]) => {
    const payload = lectures.map((l) => ({
      lecture_number: l.lectureNumber,
      topic: l.topic,
      lecture_date: l.scheduledDate,
    }));

    const res = await api.put(
      `/attendance/assignments/${assignmentId}/teaching-plan/`,
      payload
    );

    const updated = res.data.map((l: any) => ({
      id: String(l.id),
      lectureNumber: l.lecture_number,
      topic: l.topic,
      scheduledDate: l.lecture_date,
      scheduledTime: "09:00",
      isCompleted: false,
    }));

    setPlan(updated);
    return updated;
  };

  return {
    plan,
    subject,
    isLoading,
    createPlan,
    updatePlan,
  };
}







/* ======================================================
   ATTENDANCE MARKING
====================================================== */

export function useAttendanceMarking(assignmentId: string | undefined) {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachingPlan, setTeachingPlan] = useState<TeachingPlanLecture[]>([]);
  const [subject, setSubject] = useState<AssignedSubject | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<
    Record<string, AttendanceRecord[]>
  >({});
  const [attendanceOverview, setAttendanceOverview] =
    useState<LectureAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!assignmentId) {
        setIsLoading(false);
        return;
      }

      // -----------------------------
      // 1️⃣ Assignment Details
      // -----------------------------
      const assignmentRes = await api.get("/attendance/assignments/my/");
      const found = assignmentRes.data.find(
        (a: any) => a.assignment_id === assignmentId
      );

      if (found) {
        setSubject({
          id: found.assignment_id,
          name: found.subject.name,
          code: found.subject.code,
          batchId: found.batch_id,
          semester: found.semester,
          isActive: true,
          assignedStaffId: String(found.staff.id),
          assignedStaffName: found.staff.name,
          hasTeachingPlan: found.has_teaching_plan,
        });
      }

      // -----------------------------
      // 2️⃣ Teaching Plan
      // -----------------------------
      const planRes = await api.get(
        `/attendance/assignments/${assignmentId}/teaching-plan/`
      );

     const lecturesList: TeachingPlanLecture[] = planRes.data.map((l: any) => ({
          id: String(l.id),
          lectureNumber: l.lecture_number,
          topic: l.topic,
          scheduledDate: l.lecture_date,
          scheduledTime: "09:00",
          isCompleted: l.is_completed || false,
        }));

        setTeachingPlan(lecturesList);

      // -----------------------------
      // 3️⃣ Students
      // -----------------------------
      const studentsRes = await api.get(
        `/attendance/assignments/${assignmentId}/students/`
      );

      setStudents(
        studentsRes.data.map((s: any) => ({
          id: String(s.id),
          rollNumber: s.username,
          name: s.name,
          attendancePercentage: 0,
        }))
      );

      // -----------------------------
      // 4️⃣ Attendance Overview (NEW)
      // -----------------------------
      const overviewRes = await api.get(
        `/attendance/assignments/${assignmentId}/attendance-overview/`
      );
      

      setAttendanceOverview(
        overviewRes.data.map((l: any) => ({
          lectureNumber: l.lecture_number,
          topic: l.topic,
          date: l.date,
          presentCount: l.present_count,
          totalCount: l.total_count,
        }))
      );




      // -----------------------------
      // 5️⃣ Refresh Percentages
      // -----------------------------
      await refreshPercentages();

      setIsLoading(false);
    };

    fetchData();
  }, [assignmentId]);

  // ================================
  // FIX: Refresh overview after submit
  // ================================
  const refreshOverview = async () => {
    if (!assignmentId) return;

    const overviewRes = await api.get(
      `/attendance/assignments/${assignmentId}/attendance-overview/`
    );

    setAttendanceOverview(
      overviewRes.data.map((l: any) => ({
        lectureNumber: l.lecture_number,
        topic: l.topic,
        date: l.date,
        presentCount: l.present_count,
        totalCount: l.total_count,
      }))
    );
  };

  const refreshPercentages = async () => {
    if (!assignmentId) return;

    const res = await api.get(
      `/attendance/assignments/${assignmentId}/attendance-percentage/`
    );

    setStudents((prev) =>
      prev.map((s) => {
        const found = res.data.find(
          (r: any) => String(r.student_id) === s.id
        );
        return found
      ? {
          ...s,
          attendancePercentage: found.percentage,
          attendedLectures: found.attended_lectures,   // ✅ NEW
          totalLectures: found.total_lectures,         // ✅ NEW
        }
      : {
          ...s,
          attendedLectures: 0,
          totalLectures: 0,
        };
      })
    );
  };

  // ================================
  // FIX: Refresh overview + percentage
  // ================================
  const submitAttendance = async (
    lectureId: string,
    records: AttendanceRecord[]
  ) => {
    await api.post(
      `/attendance/assignments/${assignmentId}/${lectureId}/attendance/`,
      records
    );

    await refreshPercentages();
    await refreshOverview(); // ✅ NEW
    return true;
  };

  const updateAttendanceRecord = async (
    lectureId: string,
    studentId: string,
    isPresent: boolean
  ) => {
    await api.post(
      `/attendance/assignments/${assignmentId}/${lectureId}/students/${studentId}/attendance/`,
      { is_present: isPresent }
    );

    await refreshPercentages();
    await refreshOverview(); // ✅ NEW
    return true;
  };

  const getCurrentLecture = () =>
    teachingPlan.find((l) => !l.isCompleted) || null;

  const getCompletedLectures = () =>
    teachingPlan.filter((l) => l.isCompleted);

  const allLecturesCompleted = () =>
    teachingPlan.length > 0 &&
    teachingPlan.every((l) => l.isCompleted);

  const getLectureAttendanceSummary = () => attendanceOverview;

  return {
    students,
    teachingPlan,
    subject,
    attendanceHistory,
    isLoading,
    getCurrentLecture,
    getCompletedLectures,
    allLecturesCompleted,
    submitAttendance,
    updateAttendanceRecord,
    getLectureAttendanceSummary,
  };
}