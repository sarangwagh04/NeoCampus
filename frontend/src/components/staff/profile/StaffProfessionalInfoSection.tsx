import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, Building2, Briefcase, Calendar, Lock, BadgeCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StaffProfessionalInfoSectionProps {
  branch: string;
  designation: string;
  qualifications: string;
  joinedYear: number;
  role: string;
  collegeId: string;
  isEditMode: boolean;
  onFieldChange: (field: string, value: string) => void;
}

function ReadOnlyField({ 
  label, 
  value, 
  icon: Icon 
}: { 
  label: string; 
  value: string | number; 
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-4 h-4" />
        {label}
        <Tooltip>
          <TooltipTrigger asChild>
            <Lock className="w-3 h-3 text-muted-foreground/50" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Managed by administration</p>
          </TooltipContent>
        </Tooltip>
      </Label>
      <p className="text-sm text-foreground p-2 bg-muted/50 rounded-md border border-dashed">
        {value}
      </p>
    </div>
  );
}

export function StaffProfessionalInfoSection({
  branch,
  designation,
  qualifications,
  joinedYear,
  role,
  collegeId,
  isEditMode,
  onFieldChange,
}: StaffProfessionalInfoSectionProps) {
  return (
    <Card className="card-shadow">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Briefcase className="w-5 h-5 text-primary" />
          Professional & Academic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Read-only fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ReadOnlyField label="College ID" value={collegeId} icon={BadgeCheck} />
          <ReadOnlyField label="Role" value={role} icon={GraduationCap} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ReadOnlyField label="Branch / Department" value={branch} icon={Building2} />
          <ReadOnlyField label="Designation" value={designation} icon={Briefcase} />
        </div>

        <ReadOnlyField label="Joined Year" value={joinedYear} icon={Calendar} />

        {/* Editable Qualifications */}
        <div className="space-y-2">
          <Label htmlFor="qualifications" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
            Qualifications
          </Label>
          {isEditMode ? (
            <Textarea
              id="qualifications"
              value={qualifications}
              onChange={(e) => onFieldChange("qualifications", e.target.value)}
              rows={3}
              placeholder="Enter your qualifications..."
            />
          ) : (
            <p className="text-sm text-foreground p-2 bg-muted/30 rounded-md border whitespace-pre-wrap">
              {qualifications}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
