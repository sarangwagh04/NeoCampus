import api from "@/api/axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export interface StaffProfile {
  name: string;
  staffId: string;
  department: string;
  designation: string;
  avatar: string;
  subjects: string[];
}

export interface StaffStat {
  label: string;
  value: string | number;
  icon: string;
  status: "success" | "warning" | "danger";
  subtitle?: string;
  href?: string;
}

export interface TodayClass {
  id: string;
  assignmentId: string;
  lectureId: number;
  subject: string;
  subjectCode: string;
  class: string;
  division: string;
  time: string;
  room: string;
  attendanceStatus: "marked" | "pending" | "missed";
  totalStudents: number;
  presentStudents?: number;
}

export interface ClassPerformance {
  subject: string;
  averageAttendance: number;
  averageScore: number;
  submissionRate: number;
}

export interface StaffAnnouncement {
  id: string;
  title: string;
  message: string;
  type: "department" | "admin" | "exam";
  timestamp: string;
  isRead: boolean;
}

export interface StaffData {
  profile: StaffProfile;
  stats: StaffStat[];
  todayClasses: TodayClass[];
  todaySchedule: TodayClass[];
  recentMaterials: RecentMaterial[];
  announcements: StaffAnnouncement[];
}

export function useStaffData() {
  const [data, setData] = useState<StaffData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // ✅ REAL API CALL ADDED
        const res = await api.get("/home/staff-dashboard/");
        setData(res.data);

      } catch (err) {
        setError("Failed to load staff data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const markAttendance = (classItem: TodayClass) => {
  navigate(
    `/staff/attendance/mark/${classItem.assignmentId}`
  );
};


  return { data, isLoading, error, markAttendance };
}
