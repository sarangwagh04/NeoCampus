import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Trash2,
  Power,
  BookOpen,
  UserPlus,
} from "lucide-react";
import {
  Subject,
  SubjectAssignment,
  useStaffList,
  useBatchList,
  useSubjectList,
} from "@/hooks/useStaffAttendanceData";

interface HodSubjectManagementProps {
  subjects: Subject[];
  assignments: SubjectAssignment[];
  onCreateSubject: (data: { name: string; code: string }) => Promise<Subject>;
  onToggleStatus: (subjectId: string) => Promise<void>;
  onDeleteSubject: (subjectId: string) => Promise<void>;
  onCreateAssignment: (data: { subjectId: string; staffId: string; batchId: string }) => Promise<SubjectAssignment>;
  onDeleteAssignment: (assignmentId: string) => Promise<void>;
}

export function HodSubjectManagement({
  subjects,
  assignments,
  onCreateSubject,
  onToggleStatus,
  onDeleteSubject,
  onCreateAssignment,
  onDeleteAssignment,
}: HodSubjectManagementProps) {
  const { staffList } = useStaffList();
  const { batchList } = useBatchList();
  const { subjectList } = useSubjectList();

  const [subjectBanner, setSubjectBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [assignmentBanner, setAssignmentBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isCreatingSubject, setIsCreatingSubject] = useState(false);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);

  // Subject creation form
  const [subjectForm, setSubjectForm] = useState({ name: "", code: "" });

  // Assignment form
  const [assignmentForm, setAssignmentForm] = useState({
    subjectId: "",
    staffId: "",
    batchId: "",
  });

  // Sort subjects: active first, then inactive
  const sortedSubjects = useMemo(() => {
    return [...subjects].sort((a, b) => {
      if (a.isActive === b.isActive) return 0;
      return a.isActive ? -1 : 1;
    });
  }, [subjects]);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.name || !subjectForm.code) {
      setSubjectBanner({ type: "error", message: "Please fill all required fields" });
      return;
    }

    setIsCreatingSubject(true);
    try {
      await onCreateSubject(subjectForm);
      setSubjectBanner({ type: "success", message: "Subject created successfully!" });
      setSubjectForm({ name: "", code: "" });
    } catch {
      setSubjectBanner({ type: "error", message: "Failed to create subject" });
    } finally {
      setIsCreatingSubject(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentForm.subjectId || !assignmentForm.staffId || !assignmentForm.batchId) {
      setAssignmentBanner({ type: "error", message: "Please select all fields" });
      return;
    }

    setIsCreatingAssignment(true);
    try {
      await onCreateAssignment(assignmentForm);
      setAssignmentBanner({ type: "success", message: "Subject assigned successfully!" });
      setAssignmentForm({ subjectId: "", staffId: "", batchId: "" });
    } catch {
      setAssignmentBanner({ type: "error", message: "Failed to assign subject" });
    } finally {
      setIsCreatingAssignment(false);
    }
  };

  const handleToggleStatus = async (subjectId: string) => {
    try {
      await onToggleStatus(subjectId);
      setSubjectBanner({ type: "success", message: "Subject status updated" });
    } catch {
      setSubjectBanner({ type: "error", message: "Failed to update status" });
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      await onDeleteSubject(subjectId);
      setSubjectBanner({ type: "success", message: "Subject deleted successfully" });
    } catch {
      setSubjectBanner({ type: "error", message: "Failed to delete subject" });
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      await onDeleteAssignment(assignmentId);
      setAssignmentBanner({ type: "success", message: "Assignment deleted successfully" });
    } catch {
      setAssignmentBanner({ type: "error", message: "Failed to delete assignment" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Subject Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-primary" />
            Create Subject
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subjectBanner && (
            <InlineBanner
              type={subjectBanner.type}
              message={subjectBanner.message}
              onClose={() => setSubjectBanner(null)}
              autoClose={3000}
            />
          )}

          {/* Create Subject Form */}
          <form onSubmit={handleCreateSubject} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="subjectName" className="sr-only">Subject Name</Label>
              <Input
                id="subjectName"
                value={subjectForm.name}
                onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                placeholder="Subject Name (e.g., Data Structures)"
              />
            </div>
            <div className="flex-1 sm:max-w-[200px]">
              <Label htmlFor="subjectCode" className="sr-only">Subject Code</Label>
              <Input
                id="subjectCode"
                value={subjectForm.code}
                onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                placeholder="Code (e.g., CS301)"
              />
            </div>
            <Button type="submit" disabled={isCreatingSubject} className="gap-2">
              <Plus className="w-4 h-4" />
              {isCreatingSubject ? "Creating..." : "Create"}
            </Button>
          </form>

          {/* Subject List */}
          <div className="border rounded-lg">
            <ScrollArea className="h-[240px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSubjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No subjects created yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedSubjects.map((subject) => (
                      <TableRow key={subject.id} className={!subject.isActive ? "opacity-60" : ""}>
                        <TableCell className="font-medium">{subject.name}</TableCell>
                        <TableCell className="text-muted-foreground">{subject.code}</TableCell>
                        <TableCell>
                          <Badge variant={subject.isActive ? "default" : "secondary"}>
                            {subject.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleStatus(subject.id)}
                              title={subject.isActive ? "Deactivate" : "Activate"}
                            >
                              <Power className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSubject(subject.id)}
                              className="text-destructive hover:text-destructive"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Subject Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="w-5 h-5 text-primary" />
            Assign Subject to Staff & Batch
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {assignmentBanner && (
            <InlineBanner
              type={assignmentBanner.type}
              message={assignmentBanner.message}
              onClose={() => setAssignmentBanner(null)}
              autoClose={3000}
            />
          )}

          {/* Assignment Form */}
          <form onSubmit={handleCreateAssignment} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="assignSubject" className="sr-only">Subject</Label>
              <Select
                value={assignmentForm.subjectId}
                onValueChange={(val) => setAssignmentForm({ ...assignmentForm, subjectId: val })}
              >
                <SelectTrigger id="assignSubject">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjectList.map((subject) => (
                    <SelectItem key={subject.id} value={String(subject.id)}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="assignStaff" className="sr-only">Staff</Label>
              <Select
                value={assignmentForm.staffId}
                onValueChange={(val) => setAssignmentForm({ ...assignmentForm, staffId: val })}
              >
                <SelectTrigger id="assignStaff">
                  <SelectValue placeholder="Select Staff" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((staff) => (
                    <SelectItem key={staff.id} value={String(staff.id)}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="assignBatch" className="sr-only">Batch</Label>
              <Select
                value={assignmentForm.batchId}
                onValueChange={(val) => setAssignmentForm({ ...assignmentForm, batchId: val })}
              >
                <SelectTrigger id="assignBatch">
                  <SelectValue placeholder="Select Batch" />
                </SelectTrigger>
                <SelectContent>
                  {batchList.map((batch) => (
                    <SelectItem key={batch.id} value={String(batch.id)}>
                      {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isCreatingAssignment} className="gap-2">
              <Plus className="w-4 h-4" />
              {isCreatingAssignment ? "Assigning..." : "Assign"}
            </Button>
          </form>

          {/* Assignments List */}
          <div className="border rounded-lg">
            <ScrollArea className="h-[240px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Batch ID</TableHead>
                    <TableHead className="hidden sm:table-cell">Assigned Staff</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No assignments created yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">{assignment.subjectName}</TableCell>
                        <TableCell className="text-muted-foreground">{assignment.subjectCode}</TableCell>
                        <TableCell>{assignment.batchId}</TableCell>
                        <TableCell className="hidden sm:table-cell">{assignment.staffName}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            className="text-destructive hover:text-destructive"
                            title="Delete Assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
