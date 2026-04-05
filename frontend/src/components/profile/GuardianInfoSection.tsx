import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Lock, Info } from "lucide-react";

interface GuardianInfoSectionProps {
  parentName: string;
  parentMobileNumber: string;
  isEditMode: boolean;
  onFieldChange: (field: string, value: string) => void;
}

export function GuardianInfoSection({
  parentName,
  parentMobileNumber,
  isEditMode,
  onFieldChange,
}: GuardianInfoSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-primary" />
          Parent / Guardian Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="parentName">Parent Name</Label>
            {isEditMode ? (
              <Input
                id="parentName"
                value={parentName}
                onChange={(e) => onFieldChange("parentName", e.target.value)}
              />
            ) : (
              <p className="text-sm text-foreground py-2">{parentName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              Parent Mobile Number
              <Lock className="w-3 h-3 text-muted-foreground" />
            </Label>
            <p className="text-sm text-foreground py-2 px-3 bg-muted/50 rounded-md">
              {parentMobileNumber}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Parent mobile number cannot be modified. Please contact the administration office for any changes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
