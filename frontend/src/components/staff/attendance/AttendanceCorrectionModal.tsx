import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // ✅ FIX: Added for accessibility warning
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { InlineBanner } from "@/components/ui/inline-banner";
import { Save } from "lucide-react";
import api from "@/api/axios";

import {
  Student,
  TeachingPlanLecture,
} from "@/hooks/useStaffAttendanceData";

interface AttendanceCorrectionModalProps {
  assignmentId: string; // ✅ REQUIRED
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string | null;
  students: Student[];
  completedLectures: TeachingPlanLecture[];
  onUpdateRecord: (
    lectureId: string,
    studentId: string,
    isPresent: boolean
  ) => Promise<boolean>;
}

export function AttendanceCorrectionModal({
  assignmentId,
  open,
  onOpenChange,
  studentId,
  students,
  completedLectures,
  onUpdateRecord,
}: AttendanceCorrectionModalProps) {
  const [originalCorrections, setOriginalCorrections] = useState<Record<string, boolean>>({});
  const [corrections, setCorrections] = useState<Record<string, boolean>>({});
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const student = students.find((s) => s.id === studentId);

  // =============================================
  // ✅ LOAD ACTUAL ATTENDANCE FROM OPTIMIZED API
  // =============================================
  useEffect(() => {
    const fetchStudentAttendance = async () => {
      if (!studentId || !assignmentId || !open) return;

      setIsLoading(true);

      try {
        const res = await api.get(
          `/attendance/assignments/${assignmentId}/students/${studentId}/attendance-history/`
        );

        const initial: Record<string, boolean> = {};

        res.data.forEach((lecture: any) => {
          initial[String(lecture.lecture_id)] = lecture.is_present;
        });

        setCorrections(initial);
        setOriginalCorrections(initial);   // ✅ store original
        setBanner(null);
      } catch (err) {
        console.error("Failed to load attendance history", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentAttendance();
  }, [studentId, assignmentId, open]);

  const handleCorrectionChange = (
    lectureId: string,
    isPresent: boolean
  ) => {
    setCorrections((prev) => ({
      ...prev,
      [lectureId]: isPresent,
    }));
  };

  const handleSave = async () => {
  if (!studentId) return;

  setIsSaving(true);

  try {
    const changedLectures = Object.entries(corrections).filter(
      ([lectureId, isPresent]) =>
        originalCorrections[lectureId] !== isPresent
    );

    if (changedLectures.length === 0) {
      setBanner({
        type: "success",
        message: "No changes detected.",
      });
      setIsSaving(false);
      return;
    }

    const promises = changedLectures.map(
      ([lectureId, isPresent]) =>
        onUpdateRecord(lectureId, studentId, isPresent)
    );

    await Promise.all(promises);

    setBanner({
      type: "success",
      message: "Attendance corrections saved!",
    });

    setTimeout(() => {
      onOpenChange(false);
    }, 1200);

  } catch {
    setBanner({
      type: "error",
      message: "Failed to save corrections",
    });
  } finally {
    setIsSaving(false);
  }
};


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Attendance Correction</DialogTitle>

          {/* ✅ FIX: This removes accessibility warning */}
          <DialogDescription>
            Modify attendance for completed lectures.
          </DialogDescription>

          {student && (
            <p className="text-sm text-muted-foreground">
              {student.name} ({student.rollNumber})
            </p>
          )}
        </DialogHeader>

        {banner && (
          <InlineBanner
            type={banner.type}
            message={banner.message}
            onClose={() => setBanner(null)}
            className="mb-4"
          />
        )}

        {isLoading ? (
          <p className="text-center py-6 text-muted-foreground">
            Loading attendance...
          </p>
        ) : (
          <div className="space-y-4">
            {completedLectures.map((lecture) => {
              const value =
                corrections[lecture.id] !== undefined
                  ? corrections[lecture.id]
                    ? "present"
                    : "absent"
                  : undefined;

              return (
                <div
                  key={lecture.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Lecture {lecture.lectureNumber}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {lecture.topic}
                    </p>
                  </div>

                  <RadioGroup
                    key={lecture.id + "-" + studentId}
                    value={value}
                    onValueChange={(val) =>
                      handleCorrectionChange(
                        lecture.id,
                        val === "present"
                      )
                    }
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="present"
                        id={`present-${lecture.id}`}
                      />
                      <Label
                        htmlFor={`present-${lecture.id}`}
                        className="text-sm text-success cursor-pointer"
                      >
                        Present
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="absent"
                        id={`absent-${lecture.id}`}
                      />
                      <Label
                        htmlFor={`absent-${lecture.id}`}
                        className="text-sm text-destructive cursor-pointer"
                      >
                        Absent
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}