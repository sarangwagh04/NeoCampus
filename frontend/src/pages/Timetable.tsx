import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TimetableHeader } from "@/components/timetable/TimetableHeader";
import { WeeklyTimetable } from "@/components/timetable/WeeklyTimetable";
import { TeachingPlanSection } from "@/components/timetable/TeachingPlanSection";
import { useTimetableData } from "@/hooks/useTimetableData";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Timetable() {
  const { timetable, teachingPlans, isLoading, error } = useTimetableData();

  return (
    <DashboardLayout>
      <TimetableHeader />

      {error ? (
        <Card className="p-8 text-center border-destructive/20 bg-destructive/5">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Try again
          </button>
        </Card>
      ) : (
        <>
          <WeeklyTimetable timetable={timetable} isLoading={isLoading} />
          <TeachingPlanSection plans={teachingPlans} isLoading={isLoading} />
        </>
      )}
    </DashboardLayout>
  );
}
