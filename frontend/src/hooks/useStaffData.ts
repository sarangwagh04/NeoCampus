import api from "@/api/axios";
import { useState, useEffect } from "react";

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
  classPerformance: ClassPerformance[];
  announcements: StaffAnnouncement[];
}

const mockStaffData: StaffData = {
  profile: {
    name: "Prof. Pooja Kajale",
    staffId: "FAC-2024-0042",
    department: "Computer Science & Design",
    designation: "Assistant Professor",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    subjects: ["Data Structures", "Algorithm Design", "Database Systems"],
  },
  stats: [
    {
      label: "Subjects Assigned",
      value: 4,
      icon: "BookOpen",
      status: "success",
      href: "/staff/attendance#subjects",
    },
    {
      label: "Classes Today",
      value: 6,
      icon: "Calendar",
      status: "success",
      href: "/staff/timetable",
    },
    {
      label: "Pending Entries",
      value: 2,
      icon: "Clock",
      status: "warning",
      href: "/staff/attendance#subjects",
    },
    {
      label: "Next Lecture",
      value: "countdown",
      icon: "GraduationCap",
      status: "success",
      href: "/staff/timetable",
    },
  ],
  todayClasses: [
    {
      id: "1",
      subject: "Data Structures",
      subjectCode: "CS301",
      class: "CSE",
      division: "A",
      time: "10:00 - 11:00",
      room: "Room 301",
      attendanceStatus: "marked",
      totalStudents: 65,
      presentStudents: 58,
    },
    {
      id: "2",
      subject: "Algorithm Design",
      subjectCode: "CS401",
      class: "CSE",
      division: "B",
      time: "11:00 - 12:00",
      room: "Room 302",
      attendanceStatus: "marked",
      totalStudents: 60,
      presentStudents: 55,
    },
    {
      id: "3",
      subject: "Database Systems",
      subjectCode: "CS302",
      class: "CSE",
      division: "A",
      time: "12:45 - 13:45",
      room: "Lab 201",
      attendanceStatus: "pending",
      totalStudents: 65,
    },
    {
      id: "4",
      subject: "Data Structures",
      subjectCode: "CS301",
      class: "CSE",
      division: "C",
      time: "13:45 - 14:45",
      room: "Room 305",
      attendanceStatus: "pending",
      totalStudents: 62,
    },
    {
      id: "5",
      subject: "Algorithm Design",
      subjectCode: "CS401",
      class: "CSE",
      division: "A",
      time: "15:00 - 16:00",
      room: "Room 303",
      attendanceStatus: "pending",
      totalStudents: 65,
    },
    {
      id: "6",
      subject: "Database Systems",
      subjectCode: "CS302",
      class: "CSE",
      division: "B",
      time: "16:00 - 17:00",
      room: "Lab 202",
      attendanceStatus: "pending",
      totalStudents: 58,
    },
  ],
  classPerformance: [
    { subject: "Data Structures", averageAttendance: 82, averageScore: 74, submissionRate: 88 },
    { subject: "Algorithm Design", averageAttendance: 78, averageScore: 71, submissionRate: 85 },
    { subject: "Database Systems", averageAttendance: 85, averageScore: 79, submissionRate: 92 },
  ],
  announcements: [
    {
      id: "1",
      title: "Faculty Meeting",
      message: "Mandatory faculty meeting scheduled for Friday at 4 PM in the conference room.",
      type: "department",
      timestamp: "2 hours ago",
      isRead: false,
    },
    {
      id: "2",
      title: "Mid-Semester Exam Schedule",
      message: "Mid-semester examination schedule has been released. Please review the invigilation duties.",
      type: "exam",
      timestamp: "1 day ago",
      isRead: false,
    },
    {
      id: "3",
      title: "Research Grant Opportunity",
      message: "New research grant applications are open. Deadline: 30th January 2026.",
      type: "admin",
      timestamp: "2 days ago",
      isRead: true,
    },
    {
      id: "4",
      title: "Workshop on AI in Education",
      message: "Department is organizing a workshop on AI applications in education next week.",
      type: "department",
      timestamp: "3 days ago",
      isRead: true,
    },
  ],
};



export function useStaffData() {
  const [data, setData] = useState<StaffData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData(mockStaffData);
      } catch (err) {
        setError("Failed to load staff data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const markAttendance = async (classId: string) => {
    // Simulate marking attendance
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (data) {
      setData({
        ...data,
        todayClasses: data.todayClasses.map((c) =>
          c.id === classId
            ? { ...c, attendanceStatus: "marked" as const, presentStudents: Math.floor(c.totalStudents * 0.9) }
            : c
        ),
      });
    }
  };

  return { data, isLoading, error, markAttendance };
}
