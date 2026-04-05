import { Calendar, Clock, Edit, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClassYear } from "@/hooks/useStaffTimetableData";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StaffTimetableHeaderProps {
  selectedClass: ClassYear;
  onClassChange: (classYear: ClassYear) => void;
  isHod: boolean;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onSave: () => void;
  onCancel: () => void;
  hasChanges: boolean;
}

const classYears: ClassYear[] = ["F.E.", "S.E.", "T.E.", "B.E."];

export function StaffTimetableHeader({
  selectedClass,
  onClassChange,
  isHod,
  isEditMode,
  onToggleEditMode,
  onSave,
  onCancel,
  hasChanges,
}: StaffTimetableHeaderProps) {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Staff Timetable</h1>
          </div>
          <p className="text-muted-foreground">
            View and manage class schedules for all years
          </p>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {isHod && (
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button
                  onClick={onSave}
                  disabled={!hasChanges}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Timetable
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={onToggleEditMode}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Enable Timetable Edit
              </Button>
            )}
          </div>
        )}
      </div>

      <Tabs value={selectedClass} onValueChange={(v) => onClassChange(v as ClassYear)}>
        <TabsList className="bg-muted/50 p-1">
          {classYears.map((year) => (
            <TabsTrigger
              key={year}
              value={year}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6"
            >
              {year}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
