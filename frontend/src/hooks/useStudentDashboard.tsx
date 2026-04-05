import { useEffect, useState } from "react";
import api from "@/api/axios";

interface DashboardProfile {
  full_name: string;
  college_id: string;
  profile_picture: string | null;
  batch_id: string;
  branch: string;
  semester: string;
}

interface DashboardStats {
  attendance_percentage: number;
  subjects_enrolled: number;
  current_sgpa: number;
  rank: number;
}

interface StudentDashboardData {
  profile: DashboardProfile;
  stats: DashboardStats;
}

export const useStudentDashboard = () => {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/home/student-dashboard/")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        setError("Failed to load dashboard");
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
};