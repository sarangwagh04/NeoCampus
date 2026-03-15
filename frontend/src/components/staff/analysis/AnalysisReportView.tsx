import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Download, RotateCcw, Building2, Trophy, FileText, Loader2 } from "lucide-react";
import type { AnalysisReport } from "@/hooks/useResultAnalysis";
import { cn } from "@/lib/utils";
import { generateResultAnalysisPDF } from "@/utils/generateResultAnalysisPDF";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
interface AnalysisReportViewProps {
  report: AnalysisReport;
  onReset: () => void;
}
export function AnalysisReportView({
  report,
  onReset
}: AnalysisReportViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const handleDownload = () => {
    setIsGenerating(true);
    try {
      generateResultAnalysisPDF(report);
      toast({
        title: "PDF Generated",
        description: "Result analysis report has been downloaded successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  return <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          New Analysis
        </Button>
        <Button onClick={handleDownload} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
          Download Result Analysis PDF
        </Button>
      </div>

      {/* Report Card */}
      <Card className="bg-white dark:bg-card border-2 print:border-0">
        <CardContent className="p-6 md:p-8 space-y-8">
          {/* Institutional Header */}
          <div className="text-center space-y-4 pb-6 border-b">
            <div className="flex items-center justify-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                {report.collegeName}
              </h1>
            </div>
            
            

            

            <div className="bg-muted/50 rounded-lg p-4 inline-block">
              <p className="font-semibold text-foreground">Subject Wise Result Analysis</p>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                <span>Term: {report.term}</span>
                <span>Exam: {report.exam}</span>
                <span>Year: {report.academicYear}</span>
                <span>Class: {report.classAndBranch}</span>
              </div>
            </div>
          </div>

          {/* Subject-Wise Results Table */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Subject-Wise Result Analysis
            </h2>
            
            <ScrollArea className="w-full">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[60px] text-center">Sr. No</TableHead>
                      <TableHead>Name of Subject</TableHead>
                      <TableHead className="text-center w-[80px]">Exam Head</TableHead>
                      <TableHead className="text-center">Appeared</TableHead>
                      <TableHead className="text-center">Passed</TableHead>
                      <TableHead className="text-center">Failed</TableHead>
                      <TableHead className="text-center">% Passing</TableHead>
                      <TableHead>Teacher Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.subjectResults.map(subject => <TableRow key={subject.srNo}>
                        <TableCell className="text-center font-medium">{subject.srNo}</TableCell>
                        <TableCell>{subject.subjectName}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs">
                            {subject.examHead}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{subject.appeared}</TableCell>
                        <TableCell className="text-center text-emerald-600 dark:text-emerald-400 font-medium">
                          {subject.passed}
                        </TableCell>
                        <TableCell className="text-center text-destructive font-medium">
                          {subject.failed}
                        </TableCell>
                        <TableCell className={cn("text-center font-semibold", subject.passingPercentage >= 80 ? "text-emerald-600 dark:text-emerald-400" : subject.passingPercentage >= 60 ? "text-amber-600 dark:text-amber-400" : "text-destructive")}>
                          {subject.passingPercentage.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-muted-foreground">{subject.teacherName}</TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </div>

          {/* Class Toppers */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Class Toppers
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              {report.toppers.map(topper => <Card key={topper.rank} className={cn("text-center p-4", topper.rank === 1 && "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20", topper.rank === 2 && "border-slate-400/50 bg-slate-50/50 dark:bg-slate-900/20", topper.rank === 3 && "border-orange-400/50 bg-orange-50/50 dark:bg-orange-950/20")}>
                  <div className={cn("w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold", topper.rank === 1 && "bg-gradient-to-br from-amber-400 to-amber-600", topper.rank === 2 && "bg-gradient-to-br from-slate-400 to-slate-600", topper.rank === 3 && "bg-gradient-to-br from-orange-400 to-orange-600")}>
                    {topper.rank}
                  </div>
                  <p className="font-semibold text-foreground">{topper.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    SGPA: <span className="font-semibold text-primary">{topper.sgpa.toFixed(2)}</span>
                  </p>
                </Card>)}
            </div>
          </div>

          {/* Footer */}
          
        </CardContent>
      </Card>
    </div>;
}