import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InlineBanner } from "@/components/ui/inline-banner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Check,
  Calendar,
  Users,
  BookOpen,
  Edit2,
  PartyPopper,
  Download,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  AssignedSubject,
  Student,
  TeachingPlanLecture,
  AttendanceRecord,
  LectureAttendance,
} from "@/hooks/useStaffAttendanceData";
import { AttendanceCorrectionModal } from "./AttendanceCorrectionModal";
import { CompletedLecturesView } from "./CompletedLecturesView";

interface AttendanceMarkingPageProps {
  subject: AssignedSubject | null;
  students: Student[];
  teachingPlan: TeachingPlanLecture[];
  attendanceHistory: Record<string, AttendanceRecord[]>;
  isLoading: boolean;
  getCurrentLecture: () => TeachingPlanLecture | null;
  getCompletedLectures: () => TeachingPlanLecture[];
  allLecturesCompleted: () => boolean;
  onSubmitAttendance: (lectureId: string, records: AttendanceRecord[]) => Promise<boolean>;
  onUpdateRecord: (lectureId: string, studentId: string, isPresent: boolean) => Promise<boolean>;
  getLectureAttendanceSummary: () => LectureAttendance[];
}

export function AttendanceMarkingPage({
  subject,
  students,
  teachingPlan,
  attendanceHistory,
  isLoading,
  getCurrentLecture,
  getCompletedLectures,
  allLecturesCompleted,
  onSubmitAttendance,
  onUpdateRecord,
  getLectureAttendanceSummary,
}: AttendanceMarkingPageProps) {
  const [defaultAbsent, setDefaultAbsent] = useState(false);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const currentLecture = getCurrentLecture();
  const completedLectures = getCompletedLectures();

  // Initialize attendance based on default mode
  useEffect(() => {
    const initialAttendance: Record<string, boolean> = {};
    students.forEach((student) => {
      initialAttendance[student.id] = !defaultAbsent; // If defaultAbsent is ON, all start as absent (false)
    });
    setAttendance(initialAttendance);
  }, [students, defaultAbsent]);

  const handleToggleAttendance = (studentId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSubmit = async () => {
    if (!currentLecture) return;

    setIsSubmitting(true);
    try {
      const records: AttendanceRecord[] = students.map((student) => ({
        lectureId: currentLecture.id,
        studentId: student.id,
        isPresent: attendance[student.id] ?? !defaultAbsent,
      }));

      await onSubmitAttendance(currentLecture.id, records);
      setBanner({ type: "success", message: "Attendance submitted successfully!" });

      // Reset for next lecture
      setTimeout(() => {
        setBanner(null);
      }, 3000);
    } catch {
      setBanner({ type: "error", message: "Failed to submit attendance" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCorrection = (studentId: string) => {
    setSelectedStudentId(studentId);
    setCorrectionModalOpen(true);
  };

  const getStudentAttendanceStats = () => {
    return students.map((student) => ({
      rollNumber: student.rollNumber,
      name: student.name,
      attended: student.attendedLectures ?? 0,   
      total: student.totalLectures ?? 0,
      percentage: student.attendancePercentage,
    }));
  };

  const handleDownloadPDF = () => {
    if (!subject) return;
    try {
      const stats = getStudentAttendanceStats();
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Subject Attendance Report", pageWidth / 2, 15, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`${subject.name} (${subject.code})`, pageWidth / 2, 25, { align: "center" });
      doc.text(`Batch: ${subject.batchId} • Semester ${subject.semester}`, pageWidth / 2, 32, { align: "center" });
      doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, pageWidth / 2, 39, { align: "center" });

      autoTable(doc, {
        startY: 48,
        head: [["Roll No.", "Name", "Attended", "Total", "Percentage"]],
        body: stats.map((s) => [
          s.rollNumber,
          s.name,
          s.attended.toString(),
          s.total.toString(),
          `${s.percentage}%`,
        ]),
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 9 },
        styles: { fontSize: 9, cellPadding: 3 },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 4) {
            const percent = parseInt(data.cell.raw as string);
            if (percent < 65) {
              data.cell.styles.textColor = [220, 38, 38];
              data.cell.styles.fontStyle = "bold";
            } else if (percent < 75) {
              data.cell.styles.textColor = [234, 179, 8];
              data.cell.styles.fontStyle = "bold";
            } else {
              data.cell.styles.textColor = [34, 197, 94];
            }
          }
        },
      });

      doc.save(`${subject.code}_Attendance_Report.pdf`);
      toast.success("PDF report downloaded!");
    } catch (error) {
      toast.error("Failed to generate PDF");
      console.error(error);
    }
  };

  const handleDownloadExcel = () => {
    if (!subject) return;
    try {
      const stats = getStudentAttendanceStats();
      const wb = XLSX.utils.book_new();

      const data = [
        [`Subject Attendance Report - ${subject.name} (${subject.code})`],
        [`Batch: ${subject.batchId} • Semester ${subject.semester}`],
        [`Generated: ${new Date().toLocaleDateString("en-IN")}`],
        [],
        ["Roll No.", "Name", "Lectures Attended", "Total Lectures", "Percentage"],
        ...stats.map((s) => [s.rollNumber, s.name, s.attended, s.total, `${s.percentage}%`]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "Attendance");
      XLSX.writeFile(wb, `${subject.code}_Attendance_Report.xlsx`);
      toast.success("Excel report downloaded!");
    } catch (error) {
      toast.error("Failed to generate Excel");
      console.error(error);
    }
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!subject) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Subject not found</p>
          <Link to="/staff/attendance">
            <Button variant="link" className="mt-2">
              Go back to Attendance
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // All lectures completed view
  if (allLecturesCompleted()) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/staff/attendance">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Mark Attendance
              </h1>
              <p className="text-sm text-muted-foreground">
                {subject.name} ({subject.code}) • {subject.batchId}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download Report</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background z-50">
              <DropdownMenuItem onClick={handleDownloadPDF} className="gap-2 cursor-pointer">
                <FileText className="w-4 h-4" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadExcel} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="w-4 h-4" />
                Download Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Celebration */}
        <Card className="border-success/20 bg-success/5">
          <CardContent className="py-8 text-center">
            <PartyPopper className="w-16 h-16 mx-auto mb-4 text-success" />
            <h2 className="text-2xl font-bold text-success mb-2">
              All Lectures Completed! 🎉
            </h2>
            <p className="text-muted-foreground">
              You have completed all {teachingPlan.length} lectures for this subject.
            </p>
          </CardContent>
        </Card>

        {/* Completed lectures overview */}
        <CompletedLecturesView
          lectures={getLectureAttendanceSummary()}
          students={students}
          assignmentId={subject.id}
          attendanceHistory={attendanceHistory}
          completedLectures={completedLectures}
          onUpdateRecord={onUpdateRecord}
        />
      </div>
    );
  }


  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/staff/attendance">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Mark Attendance
            </h1>
            <p className="text-sm text-muted-foreground">
              {subject.name} ({subject.code}) • {subject.batchId} • Semester {subject.semester}
            </p>
          </div>
        </div>
        {completedLectures.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download Report</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background z-50">
              <DropdownMenuItem onClick={handleDownloadPDF} className="gap-2 cursor-pointer">
                <FileText className="w-4 h-4" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadExcel} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="w-4 h-4" />
                Download Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {banner && (
        <InlineBanner
          type={banner.type}
          message={banner.message}
          onClose={() => setBanner(null)}
          autoClose={4000}
        />
      )}

      {/* Current Lecture Card */}
      {currentLecture && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Lecture {currentLecture.lectureNumber}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground">
                  {currentLecture.topic}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(currentLecture.scheduledDate).toLocaleDateString()}
                  </span>
                  <span>{currentLecture.scheduledTime}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center px-4 py-2 bg-background rounded-lg">
                  <p className="text-2xl font-bold text-success">{presentCount}</p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
                <div className="text-center px-4 py-2 bg-background rounded-lg">
                  <p className="text-2xl font-bold text-destructive">{absentCount}</p>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Toggle */}
      <Card>
        <CardHeader className="pb-2">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Student Attendance
            </CardTitle>
            <div className="flex items-center gap-3">
              <Label htmlFor="default-mode" className="text-sm text-muted-foreground">
                Default Absent
              </Label>
              <Switch
                id="default-mode"
                checked={defaultAbsent}
                onCheckedChange={setDefaultAbsent}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {defaultAbsent
              ? "All students marked absent by default. Check present students."
              : "All students marked present by default. Uncheck absent students."}
          </p>
        </CardHeader>
        <CardContent>
          {/* Mobile-first card layout */}
          <div className="block sm:hidden space-y-3">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`mobile-${student.id}`}
                    checked={attendance[student.id] ?? !defaultAbsent}
                    onCheckedChange={() => handleToggleAttendance(student.id)}
                    className="h-6 w-6"
                  />
                  <div>
                    <p className="font-medium text-sm">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.rollNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={student.attendancePercentage >= 75 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {student.attendancePercentage.toFixed(0)}%
                  </Badge>
                  {completedLectures.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenCorrection(student.id)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Present</TableHead>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="text-center">Attendance %</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Checkbox
                        checked={attendance[student.id] ?? !defaultAbsent}
                        onCheckedChange={() => handleToggleAttendance(student.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {student.rollNumber}
                    </TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={student.attendancePercentage >= 75 ? "default" : "destructive"}
                      >
                        {student.attendancePercentage.toFixed(0)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {completedLectures.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenCorrection(student.id)}
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Correct
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Submit button */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !currentLecture}
              className="w-full sm:w-auto gap-2"
              size="lg"
            >
              <Check className="w-5 h-5" />
              {isSubmitting ? "Submitting..." : "Submit Attendance"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Correction Modal */}
      {subject && subject.id && (
        <AttendanceCorrectionModal
          open={correctionModalOpen}
          onOpenChange={setCorrectionModalOpen}
          studentId={selectedStudentId}
          students={students}
          completedLectures={completedLectures}
          assignmentId={subject.id}
          onUpdateRecord={onUpdateRecord}
        />)}
    </div>
  );
}
