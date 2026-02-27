import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { InlineBanner } from "@/components/ui/inline-banner";
import { BarChart3, Edit2, Save, Users } from "lucide-react";
import {
  Student,
  TeachingPlanLecture,
  AttendanceRecord,
  LectureAttendance,
} from "@/hooks/useStaffAttendanceData";
import api from "@/api/axios";

interface CompletedLecturesViewProps {
  lectures: LectureAttendance[];
  assignmentId: string;
  students: Student[];
  attendanceHistory: Record<string, AttendanceRecord[]>;
  completedLectures: TeachingPlanLecture[];
  onUpdateRecord: (lectureId: string, studentId: string, isPresent: boolean) => Promise<boolean>;
}

export function CompletedLecturesView({
  lectures,
  assignmentId,
  students,
  attendanceHistory,
  completedLectures,
  onUpdateRecord,
  
}: CompletedLecturesViewProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<TeachingPlanLecture | null>(null);
  const [editAttendance, setEditAttendance] = useState<Record<string, boolean>>({});
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleEditLecture = async (lectureNumber: number) => {
  const lecture = completedLectures.find(
    (l) => l.lectureNumber === lectureNumber
  );

  if (!lecture) return;

  setSelectedLecture(lecture);

  try {
    const res = await api.get(
      `/attendance/assignments/${assignmentId}/${lecture.id}/attendance-list/`
    );

    const initialAttendance: Record<string, boolean> = {};

    students.forEach((student) => {
      const record = res.data.find(
        (r: any) => String(r.student_id) === student.id
      );

      initialAttendance[student.id] =
        record?.is_present ?? false;
    });

    setEditAttendance(initialAttendance);
    setEditModalOpen(true);

  } catch (error) {
    console.error("Failed to load lecture attendance", error);
  }
};

  const handleSaveEdits = async () => {
    if (!selectedLecture) return;

    setIsSaving(true);
    try {
      const promises = students.map((student) => {
        const currentRecord = attendanceHistory[selectedLecture.id]?.find(
          (r) => r.studentId === student.id
        );
        const newValue = editAttendance[student.id];
        if (currentRecord?.isPresent !== newValue) {
          return onUpdateRecord(selectedLecture.id, student.id, newValue);
        }
        return Promise.resolve(true);
      });

      await Promise.all(promises);
      setBanner({ type: "success", message: "Lecture attendance updated!" });
      setTimeout(() => {
        setEditModalOpen(false);
        setBanner(null);
      }, 1500);
    } catch {
      setBanner({ type: "error", message: "Failed to update attendance" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Attendance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile view */}
          <div className="block sm:hidden space-y-3">
            {lectures.map((lecture) => (
              <div
                key={lecture.lectureNumber}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Lecture {lecture.lectureNumber}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-success/10 text-success rounded-full">
                      {lecture.presentCount}/{lecture.totalCount}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {lecture.topic}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(lecture.date).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditLecture(lecture.lectureNumber)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lecture #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead className="text-center">Present / Total</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lectures.map((lecture) => (
                  <TableRow key={lecture.lectureNumber}>
                    <TableCell className="font-medium">
                      {lecture.lectureNumber}
                    </TableCell>
                    <TableCell>
                      {new Date(lecture.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {lecture.topic}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-success/10 text-success rounded-full text-sm">
                        <Users className="w-3.5 h-3.5" />
                        {lecture.presentCount} / {lecture.totalCount}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditLecture(lecture.lectureNumber)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto" aria-describedby="edit-lecture-description">
          <DialogHeader>
            <DialogTitle>
              Edit Attendance - Lecture {selectedLecture?.lectureNumber}
            </DialogTitle>
            <DialogDescription id="edit-lecture-description">
              Modify attendance records for this lecture.
            </DialogDescription>
            {selectedLecture && (
              <p className="text-sm text-muted-foreground">
                {selectedLecture.topic}
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

          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium">{student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {student.rollNumber}
                  </p>
                </div>
                <RadioGroup
                  value={editAttendance[student.id] ? "present" : "absent"}
                  onValueChange={(val) =>
                    setEditAttendance((prev) => ({
                      ...prev,
                      [student.id]: val === "present",
                    }))
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="present"
                      id={`edit-present-${student.id}`}
                    />
                    <Label
                      htmlFor={`edit-present-${student.id}`}
                      className="text-sm text-success cursor-pointer"
                    >
                      P
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="absent"
                      id={`edit-absent-${student.id}`}
                    />
                    <Label
                      htmlFor={`edit-absent-${student.id}`}
                      className="text-sm text-destructive cursor-pointer"
                    >
                      A
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdits} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
