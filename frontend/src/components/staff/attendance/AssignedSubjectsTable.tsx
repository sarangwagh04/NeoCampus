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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar as CalendarIcon, ClipboardList, Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { AssignedSubject } from "@/hooks/useStaffAttendanceData";
import { generateAttendanceReportPDF, generateAttendanceReportExcel, AttendanceReportFilters } from "@/utils/generateAttendanceReport";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AssignedSubjectsTableProps {
  subjects: AssignedSubject[];
  isLoading: boolean;
  isHod?: boolean;
  userBranch?: string;
}

export function AssignedSubjectsTable({ subjects, isLoading, isHod = false, userBranch = "CSD" }: AssignedSubjectsTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [minPercentage, setMinPercentage] = useState<string>("");
  const [maxPercentage, setMaxPercentage] = useState<string>("");


const mySubjects = subjects;

  const getFilters = (): AttendanceReportFilters => ({
    branch: userBranch,
    minPercentage: minPercentage ? parseInt(minPercentage) : undefined,
    maxPercentage: maxPercentage ? parseInt(maxPercentage) : undefined,
  });

  const handleDownloadPDF = async () => {
    try {
      await generateAttendanceReportPDF(getFilters());
      toast.success("PDF report downloaded successfully!");
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to generate PDF report");
      console.error(error);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      await generateAttendanceReportExcel(getFilters());
      toast.success("Excel report downloaded successfully!");
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to generate Excel report");
      console.error(error);
    }
  };

  const resetFilters = () => {
    setMinPercentage("");
    setMaxPercentage("");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            My Assigned Subjects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          My Assigned Subjects
        </CardTitle>
        {isHod && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download Report</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Download Attendance Report - {userBranch}</DialogTitle>
                <DialogDescription className="sr-only">Configure filters and download attendance report</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Percentage Filter */}
                <div className="space-y-2">
                  <Label>Attendance Percentage Range (Optional)</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Min %"
                      min="0"
                      max="100"
                      value={minPercentage}
                      onChange={(e) => setMinPercentage(e.target.value)}
                      className="flex-1"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="number"
                      placeholder="Max %"
                      min="0"
                      max="100"
                      value={maxPercentage}
                      onChange={(e) => setMaxPercentage(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground">
                  Reset Filters
                </Button>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleDownloadPDF} className="gap-2 flex-1">
                  <FileText className="w-4 h-4" />
                  PDF
                </Button>
                <Button onClick={handleDownloadExcel} variant="secondary" className="gap-2 flex-1">
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {mySubjects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No subjects assigned yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead className="hidden sm:table-cell">Batch ID</TableHead>
                  <TableHead className="hidden md:table-cell">Semester</TableHead>
                  <TableHead>Teaching Plan</TableHead>
                  <TableHead>Attendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mySubjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{subject.name}</p>
                        <p className="text-sm text-muted-foreground">{subject.code}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">
                          {subject.batchId}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">{subject.batchId}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      Sem {subject.semester}
                    </TableCell>
                    <TableCell>
                      <Link to={`/staff/attendance/teaching-plan/${subject.id}`}>
                        <Button
                          variant={subject.hasTeachingPlan ? "outline" : "default"}
                          size="sm"
                          className="gap-1.5 w-full sm:w-auto"
                        >
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">
                            {subject.hasTeachingPlan ? "View Plan" : "Create Plan"}
                          </span>
                          <span className="sm:hidden">Plan</span>
                        </Button>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/staff/attendance/mark/${subject.id}`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="gap-1.5 w-full sm:w-auto"
                          disabled={!subject.hasTeachingPlan}
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Mark Attendance</span>
                          <span className="sm:hidden">Attend</span>
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
