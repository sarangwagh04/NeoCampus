import { useQuery } from "@tanstack/react-query";
import type { SubjectAttendance } from "@/components/attendance/SubjectAttendanceTable";
import api from "@/api/axios";

interface AttendanceData {
  overallPercentage: number;
  subjects: SubjectAttendance[];
}

// Simulated API call - replace with actual API endpoint
async function fetchAttendanceData(semester: string): Promise<AttendanceData> {
  const res = await api.get("/attendance/student/overall/");
  
  return {
    overallPercentage: res.data.overallPercentage,
    subjects: res.data.subjects.map((subj: any, index: number) => ({
      id: String(index + 1),
      name: subj.name,
      code: subj.code,
      totalLectures: subj.total,
      attendedLectures: subj.attended,
      percentage: subj.percentage,
    })),
  };
}

export function useAttendanceData(semester: string) {
  return useQuery<AttendanceData, Error>({
    queryKey: ["attendance", semester],
    queryFn: () => fetchAttendanceData(semester),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
