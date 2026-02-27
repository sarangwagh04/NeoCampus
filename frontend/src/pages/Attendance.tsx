import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AttendanceHeader } from "@/components/attendance/AttendanceHeader";
import { OverallAttendanceCard } from "@/components/attendance/OverallAttendanceCard";
import { SubjectAttendanceTable } from "@/components/attendance/SubjectAttendanceTable";
import { useAttendanceData } from "@/hooks/useAttendanceData";

export default function Attendance() {
  const [selectedSemester, setSelectedSemester] = useState("current");
  const { data, isLoading, error } = useAttendanceData(selectedSemester);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <AttendanceHeader/>
        
        <OverallAttendanceCard
          percentage={data?.overallPercentage ?? 0}
          isLoading={isLoading}
          error={error}
        />

        <SubjectAttendanceTable
          subjects={data?.subjects ?? []}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </DashboardLayout>
  );
}
