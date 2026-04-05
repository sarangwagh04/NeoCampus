import { useParams } from "react-router-dom";
import { StaffDashboardLayout } from "@/components/staff/StaffDashboardLayout";
import { AttendanceMarkingPage } from "@/components/staff/attendance/AttendanceMarkingPage";
import { useAttendanceMarking } from "@/hooks/useStaffAttendanceData";

export default function StaffMarkAttendance() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const {
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
  } = useAttendanceMarking(assignmentId);

  return (
    <StaffDashboardLayout>
      <AttendanceMarkingPage
        subject={subject}
        students={students}
        teachingPlan={teachingPlan}
        attendanceHistory={attendanceHistory}
        isLoading={isLoading}
        getCurrentLecture={getCurrentLecture}
        getCompletedLectures={getCompletedLectures}
        allLecturesCompleted={allLecturesCompleted}
        onSubmitAttendance={submitAttendance}
        onUpdateRecord={updateAttendanceRecord}
        getLectureAttendanceSummary={getLectureAttendanceSummary}
      />
    </StaffDashboardLayout>
  );
}
