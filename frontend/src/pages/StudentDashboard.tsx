import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { StatCards } from "@/components/dashboard/StatCards";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import { RecentMaterials } from "@/components/dashboard/RecentMaterials";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";


const StudentDashboard = () => {
  const { data, loading } = useStudentDashboard();

  

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Welcome back 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your academics today.
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Profile Card */}
        <ProfileCard profile={data?.profile} loading={loading} />

        {/* Stats Grid */}
        <StatCards stats={data?.stats} loading={loading} />

        {/* Quick Access Resources */}
        <QuickAccess />

        {/* Today's Schedule - Full Width */}
        <TodaySchedule />

        {/* Recent Assignments & Notes */}
        <RecentMaterials />
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;

