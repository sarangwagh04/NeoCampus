import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GraduationCap, Lock } from "lucide-react";

interface AcademicInfoSectionProps {
  branch: string;
  semester: number;
  admissionYear: number;
  batchId: string;
  role: string;
  collegeId: string;
}

export function AcademicInfoSection({
  branch,
  semester,
  admissionYear,
  batchId,
  role,
  collegeId,
}: AcademicInfoSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <GraduationCap className="w-5 h-5 text-primary" />
          Academic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Branch & Semester */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              Branch
              <Lock className="w-3 h-3 text-muted-foreground" />
            </Label>
            <p className="text-sm text-foreground py-2 px-3 bg-muted/50 rounded-md">
              {branch}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              Semester
              <Lock className="w-3 h-3 text-muted-foreground" />
            </Label>
            <p className="text-sm text-foreground py-2 px-3 bg-muted/50 rounded-md">
              Semester {semester}
            </p>
          </div>
        </div>

        {/* Admission Year & Batch ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              Admission Year
              <Lock className="w-3 h-3 text-muted-foreground" />
            </Label>
            <p className="text-sm text-foreground py-2 px-3 bg-muted/50 rounded-md">
              {admissionYear}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              Batch ID
              <Lock className="w-3 h-3 text-muted-foreground" />
            </Label>
            <p className="text-sm text-foreground py-2 px-3 bg-muted/50 rounded-md">
              {batchId}
            </p>
          </div>
        </div>

        {/* Role & College ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              Role
              <Lock className="w-3 h-3 text-muted-foreground" />
            </Label>
            <p className="text-sm text-foreground py-2 px-3 bg-muted/50 rounded-md">
              {role}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              College ID
              <Lock className="w-3 h-3 text-muted-foreground" />
            </Label>
            <p className="text-sm text-foreground py-2 px-3 bg-muted/50 rounded-md">
              {collegeId}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
