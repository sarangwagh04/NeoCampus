import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SubjectResult } from "@/hooks/useStudentResults";
import { Loader2 } from "lucide-react";

interface SubjectResultsTableProps {
  subjects: SubjectResult[];
  isLoading: boolean;
}

export function SubjectResultsTable({ subjects, isLoading }: SubjectResultsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-soft">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Subject-Wise Results</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading results...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Subject-Wise Results</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Detailed breakdown of marks for each subject
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-semibold">Subject Code</TableHead>
              <TableHead className="font-semibold">Subject Name</TableHead>
              <TableHead className="text-center font-semibold">Credits</TableHead>
              <TableHead className="text-center font-semibold">Internal</TableHead>
              <TableHead className="text-center font-semibold">External</TableHead>
              <TableHead className="text-center font-semibold">Total</TableHead>
              <TableHead className="text-center font-semibold">Grade</TableHead>
              <TableHead className="text-center font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject, index) => (
              <TableRow
                key={subject.code}
                className={cn(
                  "table-row-hover",
                  subject.status === "Fail" && "bg-destructive/5"
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <TableCell className="font-mono text-sm font-medium">
                  {subject.code}
                </TableCell>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell className="text-center">{subject.credits}</TableCell>
                <TableCell className="text-center">
                  <span className="text-muted-foreground">{subject.internalMarks}</span>
                  <span className="text-xs text-muted-foreground/60"> / {subject.internalMax}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-muted-foreground">{subject.externalMarks}</span>
                  <span className="text-xs text-muted-foreground/60"> / {subject.externalMax}</span>
                </TableCell>
                <TableCell className="text-center font-semibold">
                  <span className={cn(
                    subject.status === "Pass" ? "text-foreground" : "text-destructive"
                  )}>
                    {subject.totalMarks}
                  </span>
                  <span className="text-xs text-muted-foreground/60"> / {subject.maxMarks}</span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-semibold",
                      subject.grade === "A+" && "border-success text-success bg-success/10",
                      subject.grade === "A" && "border-success text-success bg-success/10",
                      subject.grade === "B+" && "border-primary text-primary bg-primary/10",
                      subject.grade === "B" && "border-primary text-primary bg-primary/10",
                      subject.grade === "C" && "border-warning text-warning bg-warning/10",
                      subject.grade === "F" && "border-destructive text-destructive bg-destructive/10"
                    )}
                  >
                    {subject.grade}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    className={cn(
                      subject.status === "Pass"
                        ? "bg-success/10 text-success hover:bg-success/20"
                        : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                    )}
                  >
                    {subject.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary Row */}
      <div className="p-4 bg-muted/30 border-t border-border">
        <div className="flex flex-wrap gap-4 justify-between text-sm">
          <div className="flex gap-6">
            <div>
              <span className="text-muted-foreground">Total Subjects: </span>
              <span className="font-semibold">{subjects.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Passed: </span>
              <span className="font-semibold text-success">
                {subjects.filter((s) => s.status === "Pass").length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Failed: </span>
              <span className="font-semibold text-destructive">
                {subjects.filter((s) => s.status === "Fail").length}
              </span>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Total Credits: </span>
            <span className="font-semibold">
              {subjects.reduce((sum, s) => sum + Number(s.credits || 0), 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
