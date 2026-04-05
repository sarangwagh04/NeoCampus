import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, BookOpen } from "lucide-react";
import { AcademicContext } from "@/hooks/useStaffResultUpload";
import { cn } from "@/lib/utils";
import api from "@/api/axios";

interface AcademicContextFormProps {
  context: AcademicContext;
  onUpdate: (field: keyof AcademicContext, value: string) => void;
  isComplete: boolean;
  isFormValid: boolean;
  onProceed: () => void;
  isActive: boolean;
}

const semesterOptions = [
  "Semester I", "Semester II", "Semester III", "Semester IV",
  "Semester V", "Semester VI", "Semester VII", "Semester VIII"
];

const examTypeOptions = ["APR/MAY", "NOV/DEC"];

export function AcademicContextForm({
  context,
  onUpdate,
  isComplete,
  isFormValid,
  onProceed,
  isActive,
}: AcademicContextFormProps) {

  const [batches, setBatches] = useState<{ id: string; name: string }[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoadingBatches(true);

        const response = await api.get("/attendance/batches/");
        setBatches(response.data);

      } catch (error) {
        console.error("Failed to fetch batches", error);
      } finally {
        setLoadingBatches(false);
      }
    };

    fetchBatches();
  }, []);

  return (
    <Card className={cn(
      "transition-all duration-300",
      isActive ? "ring-2 ring-primary/50" : "opacity-60"
    )}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
            isComplete ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"
          )}>
            {isComplete ? <CheckCircle className="h-4 w-4" /> : "1"}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Result Context Selection
            </CardTitle>
            <CardDescription>
              Select batch and optional exam details
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Batch ID (Required) */}
          <div className="space-y-2">
            <Label htmlFor="batch">Batch ID *</Label>
            <Select
              value={context.batchId}
              onValueChange={(v) => onUpdate("batchId", v)}
              disabled={loadingBatches}
            >
              <SelectTrigger id="batch">
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Semester (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="semester">Semester</Label>
            <Select
              value={context.semester}
              onValueChange={(v) => onUpdate("semester", v)}
            >
              <SelectTrigger id="semester">
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                {semesterOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Exam Type (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="examType">Exam Type</Label>
            <Select
              value={context.examType}
              onValueChange={(v) => onUpdate("examType", v)}
            >
              <SelectTrigger id="examType">
                <SelectValue placeholder="Select exam type" />
              </SelectTrigger>
              <SelectContent>
                {examTypeOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={onProceed}
            disabled={!isFormValid}
            className="gap-2"
          >
            Continue to Upload
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}