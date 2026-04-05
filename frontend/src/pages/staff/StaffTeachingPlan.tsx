import { useParams } from "react-router-dom";
import { StaffDashboardLayout } from "@/components/staff/StaffDashboardLayout";
import { TeachingPlanForm } from "@/components/staff/attendance/TeachingPlanForm";
import { useTeachingPlan } from "@/hooks/useStaffAttendanceData";


export default function StaffTeachingPlan() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { plan, subject, isLoading, createPlan, updatePlan } = useTeachingPlan(assignmentId);

  return (
    <StaffDashboardLayout>
      <TeachingPlanForm
        subject={subject}
        existingPlan={plan}
        onCreatePlan={createPlan}
        onUpdatePlan={updatePlan}
        isLoading={isLoading}
      />
    </StaffDashboardLayout>
  );
}
