import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Eye, Users, TrendingUp, TrendingDown, Award } from "lucide-react";
import { StudentResult, ResultSummary } from "@/hooks/useStaffResultUpload";
import { cn } from "@/lib/utils";

interface ResultPreviewTableProps {
  isActive: boolean;
  results: StudentResult[];
  summary: ResultSummary | null;
}

export function ResultPreviewTable({ isActive, results, summary }: ResultPreviewTableProps) {
  if (!isActive || results.length === 0) {
    return (
      <Card className="opacity-60 transition-all duration-300">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
              3
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Result Preview
              </CardTitle>
              <CardDescription>Upload a file to preview results</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="ring-2 ring-primary/50 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
            <CheckCircle className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Result Preview
            </CardTitle>
            <CardDescription>Review results before publishing</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs">Total Students</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{summary.totalStudents}</p>
            </div>
            <div className="p-4 rounded-lg bg-success/10 border border-success/30">
              <div className="flex items-center gap-2 text-success mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Passed</span>
              </div>
              <p className="text-2xl font-bold text-success">{summary.passed}</p>
            </div>
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <div className="flex items-center gap-2 text-destructive mb-1">
                <TrendingDown className="h-4 w-4" />
                <span className="text-xs">Failed</span>
              </div>
              <p className="text-2xl font-bold text-destructive">{summary.failed}</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Award className="h-4 w-4" />
                <span className="text-xs">Average Marks</span>
              </div>
              <p className="text-2xl font-bold text-primary">{summary.averageMarks}%</p>
            </div>
          </div>
        )}

        {/* Results Table */}
        <ScrollArea className="h-[400px] rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-[120px]">College ID</TableHead>
                <TableHead>Subject Name</TableHead>
                <TableHead className="text-center">Internal</TableHead>
                <TableHead className="text-center">External</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow
                  key={`${result.rollNumber}-${result.studentName}`}
                  className={cn(
                    result.status === "Fail" && "bg-destructive/5"
                  )}
                >
                  <TableCell className="font-mono text-sm">{result.rollNumber}</TableCell>
                  <TableCell className="font-medium">{result.subjectName}</TableCell>
                  <TableCell className="text-center">{result.internalMarks}</TableCell>
                  <TableCell className="text-center">{result.externalMarks}</TableCell>
                  <TableCell className="text-center font-semibold">
                    <span
                      className={cn(
                        result.status === "Pass" ? "text-success" : "text-destructive"
                      )}
                    >
                      {result.totalMarks}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-semibold">
                      {result.grade}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={result.status === "Pass" ? "default" : "destructive"}>
                      {result.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
