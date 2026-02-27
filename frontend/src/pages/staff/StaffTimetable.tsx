import { useState, useCallback } from "react";
import { StaffDashboardLayout } from "@/components/staff/StaffDashboardLayout";
import { StaffTimetableHeader } from "@/components/staff/timetable/StaffTimetableHeader";
import { StaffWeeklyTimetable } from "@/components/staff/timetable/StaffWeeklyTimetable";
import { useStaffTimetableData, ClassYear } from "@/hooks/useStaffTimetableData";
import { TimetableData, LectureSlot } from "@/hooks/useTimetableData";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import api from "@/api/axios";

export default function StaffTimetable() {
  const [selectedClass, setSelectedClass] = useState<ClassYear>("F.E.");
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [editedTimetables, setEditedTimetables] = useState<Record<ClassYear, TimetableData | null>>({
    "F.E.": null,
    "S.E.": null,
    "T.E.": null,
    "B.E.": null,
  });
  const [hasChanges, setHasChanges] = useState(false);

  const { timetables, isLoading, error, isHod, getSubjectsForClass } = useStaffTimetableData();
  const { toast } = useToast();

  const currentTimetable = isEditMode && editedTimetables[selectedClass] 
    ? editedTimetables[selectedClass] 
    : timetables[selectedClass];

  const subjects = getSubjectsForClass(selectedClass);

  const handleToggleEditMode = useCallback(() => {
    if (!isEditMode) {
      // Entering edit mode - copy current timetables
      setEditedTimetables({ ...timetables });
      setHasChanges(false);
    }
    setIsEditMode(!isEditMode);
  }, [isEditMode, timetables]);

  const handleUpdateLecture = useCallback((day: string, slotId: string, subjectCode: string | null) => {
    setEditedTimetables((prev) => {
      const currentClassTimetable = prev[selectedClass];
      if (!currentClassTimetable) return prev;

      const updatedSchedule = { ...currentClassTimetable.schedule };
      
      if (!updatedSchedule[day]) {
        updatedSchedule[day] = {};
      }

      if (subjectCode === null) {
        updatedSchedule[day][slotId] = null;
      } else {
        const subject = subjects.find((s) => s.code === subjectCode);
        if (subject) {
          const newLecture: LectureSlot = {
            id: `${subjectCode}-${Date.now()}`,
            subjectCode: subject.code,
            subjectName: subject.name,
            facultyName: subject.staffName,
            classroom: subject.classroom,
            lecturesPlanned: 30,
            lecturesCompleted: 0,
            lecturesRemaining: 30,
          };
          updatedSchedule[day][slotId] = newLecture;
        }
      }

      return {
        ...prev,
        [selectedClass]: {
          ...currentClassTimetable,
          schedule: updatedSchedule,
        },
      };
    });
    setHasChanges(true);
  }, [selectedClass, subjects]);

  const handleSave = useCallback(() => {
    setShowSaveDialog(true);
  }, []);

  const handleConfirmSave = useCallback(async () => {

  try {

    const timetableToSave = editedTimetables[selectedClass];

    await api.put(`/staff-timetable/${selectedClass}/`, {
      schedule: timetableToSave?.schedule,
    });

    toast({
      title: "Timetable Updated",
      description: "Timetable updated successfully.",
    });

    setIsEditMode(false);
    setHasChanges(false);
    setShowSaveDialog(false);

  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to update timetable.",
      variant: "destructive",
    });
  }

}, [toast, editedTimetables, selectedClass]);

  const handleCancel = useCallback(() => {
    setIsEditMode(false);
    setEditedTimetables({
      "F.E.": null,
      "S.E.": null,
      "T.E.": null,
      "B.E.": null,
    });
    setHasChanges(false);
  }, []);

  return (
    <StaffDashboardLayout>
      <StaffTimetableHeader
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        isHod={isHod}
        isEditMode={isEditMode}
        onToggleEditMode={handleToggleEditMode}
        onSave={handleSave}
        onCancel={handleCancel}
        hasChanges={hasChanges}
      />

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
        <StaffWeeklyTimetable
          timetable={currentTimetable}
          isLoading={isLoading}
          isEditMode={isEditMode}
          subjects={subjects}
          onUpdateLecture={handleUpdateLecture}
        />
      )}

      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Timetable Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Once saved, the updated timetable will be visible to all students immediately. 
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StaffDashboardLayout>
  );
}
