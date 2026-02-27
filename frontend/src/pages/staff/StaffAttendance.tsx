import { StaffDashboardLayout } from "@/components/staff/StaffDashboardLayout";
import { HodSubjectManagement } from "@/components/staff/attendance/HodSubjectManagement";
import { AssignedSubjectsTable } from "@/components/staff/attendance/AssignedSubjectsTable";
import {
  useStaffRole,
  useSubjectManagement,
  useAssignedSubjects,
} from "@/hooks/useStaffAttendanceData";
import { CalendarCheck } from "lucide-react";

export default function StaffAttendance() {

  // ✅ Hooks MUST be inside component
  const { role, isLoading: roleLoading } = useStaffRole();

  const {
    subjects,
    assignments,
    isLoading: dataLoading,
    createSubject,
    toggleSubjectStatus,
    deleteSubject,
    createAssignment,
    deleteAssignment,
  } = useSubjectManagement();

  const {
    subjects: myAssignedSubjects,
    isLoading: assignedLoading,
  } = useAssignedSubjects();

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Attendance Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage subjects and mark attendance
            </p>
          </div>
        </div>

        {role?.isHod && !roleLoading && (
          <HodSubjectManagement
            subjects={subjects}
            assignments={assignments}
            onCreateSubject={createSubject}
            onToggleStatus={toggleSubjectStatus}
            onDeleteSubject={deleteSubject}
            onCreateAssignment={createAssignment}
            onDeleteAssignment={deleteAssignment}
          />
        )}

        <AssignedSubjectsTable
          subjects={myAssignedSubjects}
          isLoading={assignedLoading}
          isHod={role?.isHod}
        />
      </div>
    </StaffDashboardLayout>
  );
}