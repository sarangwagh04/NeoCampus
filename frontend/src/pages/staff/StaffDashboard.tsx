import { StaffDashboardLayout } from "@/components/staff/StaffDashboardLayout";
import { StaffProfileCard } from "@/components/staff/StaffProfileCard";
import { StaffStatCards } from "@/components/staff/StaffStatCards";
import { StaffTodayOverview } from "@/components/staff/StaffTodayOverview";
import { StaffAcademicResponsibilities } from "@/components/staff/StaffAcademicResponsibilities";
import { StaffRecentMaterials } from "@/components/staff/StaffRecentMaterials";
import { useStaffData } from "@/hooks/useStaffData";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function StaffDashboard() {
  const { data, isLoading, error, markAttendance } = useStaffData();

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground">
              Here's your teaching overview for today
            </p>
          </div>
          <ThemeToggle />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Profile Card */}
        <StaffProfileCard profile={data?.profile ?? null} isLoading={isLoading} />

        {/* Stat Cards */}
        <StaffStatCards stats={data?.stats ?? null} isLoading={isLoading} todaySchedule={data?.todaySchedule ?? null} />

        {/* Today's Overview - Combined Classes & Schedule in single card */}
        <StaffTodayOverview
          classes={data?.todayClasses ?? null}
          schedule={data?.todaySchedule ?? null}
          isLoading={isLoading}
          onMarkAttendance={markAttendance}
        />

        {/* Academic Responsibilities */}
        <StaffAcademicResponsibilities />

        {/* Recent Assignments & Notes */}
        <StaffRecentMaterials materials={data?.recentMaterials ?? []}/>
      </div>
    </StaffDashboardLayout>
  );
}
