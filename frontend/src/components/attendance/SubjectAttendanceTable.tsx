import { CheckCircle, AlertTriangle, XCircle, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface SubjectAttendance {
  id: string;
  name: string;
  code: string;
  totalLectures: number;
  attendedLectures: number;
  percentage: number;
}

interface SubjectAttendanceTableProps {
  subjects: SubjectAttendance[];
  isLoading: boolean;
  error: Error | null;
}

function getStatusConfig(percentage: number) {
  if (percentage >= 75) {
    return {
      status: "Safe",
      icon: CheckCircle,
      badgeClass: "badge-safe",
      progressClass: "bg-success",
    };
  }
  if (percentage >= 65) {
    return {
      status: "Warning",
      icon: AlertTriangle,
      badgeClass: "badge-warning",
      progressClass: "bg-warning",
    };
  }
  return {
    status: "Shortage",
    icon: XCircle,
    badgeClass: "badge-danger",
    progressClass: "bg-destructive",
  };
}

function SubjectRow({ subject }: { subject: SubjectAttendance }) {
  const config = getStatusConfig(subject.percentage);
  const Icon = config.icon;

  return (
    <TableRow className="table-row-hover">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{subject.name}</p>
            <p className="text-xs text-muted-foreground">{subject.code}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <span className="font-medium text-foreground">
          {subject.totalLectures}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <span className="font-medium text-foreground">
          {subject.attendedLectures}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-24 cursor-help">
                <Progress
                  value={subject.percentage}
                  className="h-2"
                  indicatorClassName={config.progressClass}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {subject.attendedLectures} / {subject.totalLectures} lectures
                attended
              </p>
            </TooltipContent>
          </Tooltip>
          <span className="min-w-[3rem] text-sm font-semibold text-foreground">
            {subject.percentage}%
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs",
            config.badgeClass
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {config.status}
        </div>
      </TableCell>
    </TableRow>
  );
}

function TableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="mx-auto h-4 w-8" />
          </TableCell>
          <TableCell>
            <Skeleton className="mx-auto h-4 w-8" />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="h-2 w-24" />
              <Skeleton className="h-4 w-10" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-20 rounded-full" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <BookOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        No attendance records yet
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Attendance records will appear once lectures are conducted this
        semester.
      </p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <XCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        Unable to load attendance data
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Please try again later. If the issue persists, contact support.
      </p>
    </div>
  );
}

export function SubjectAttendanceTable({
  subjects,
  isLoading,
  error,
}: SubjectAttendanceTableProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="h-5 w-5 text-primary" />
          Subject-wise Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {error ? (
          <ErrorState />
        ) : !isLoading && subjects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="min-w-[200px]">Subject</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Attended</TableHead>
                  <TableHead className="min-w-[160px]">Percentage</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton />
                ) : (
                  subjects.map((subject) => (
                    <SubjectRow key={subject.id} subject={subject} />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
