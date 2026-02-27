import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, User, Phone, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffEmergencyContactSectionProps {
  emergencyContactName: string;
  emergencyMobileNumber: string;
  emergencyRelation: string;
  isEditMode: boolean;
  errors: Record<string, string>;
  onFieldChange: (field: string, value: string) => void;
}

const relationOptions = [
  "Spouse",
  "Parent",
  "Sibling",
  "Child",
  "Friend",
  "Colleague",
  "Other",
];

export function StaffEmergencyContactSection({
  emergencyContactName,
  emergencyMobileNumber,
  emergencyRelation,
  isEditMode,
  errors,
  onFieldChange,
}: StaffEmergencyContactSectionProps) {
  return (
    <Card className="card-shadow border-amber-200/50 dark:border-amber-800/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Emergency Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Name */}
        <div className="space-y-2">
          <Label htmlFor="emergencyContactName" className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            Contact Name
          </Label>
          {isEditMode ? (
            <>
              <Input
                id="emergencyContactName"
                value={emergencyContactName}
                onChange={(e) => onFieldChange("emergencyContactName", e.target.value)}
                className={cn(errors.emergencyContactName && "border-destructive")}
                placeholder="Enter emergency contact name"
              />
              {errors.emergencyContactName && (
                <p className="text-xs text-destructive">{errors.emergencyContactName}</p>
              )}
            </>
          ) : (
            <p className="text-sm text-foreground p-2 bg-muted/30 rounded-md border">
              {emergencyContactName || "—"}
            </p>
          )}
        </div>

        {/* Contact Mobile */}
        <div className="space-y-2">
          <Label htmlFor="emergencyMobileNumber" className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            Mobile Number
          </Label>
          {isEditMode ? (
            <>
              <Input
                id="emergencyMobileNumber"
                value={emergencyMobileNumber}
                onChange={(e) => onFieldChange("emergencyMobileNumber", e.target.value)}
                className={cn(errors.emergencyMobileNumber && "border-destructive")}
                placeholder="Enter emergency contact number"
              />
              {errors.emergencyMobileNumber && (
                <p className="text-xs text-destructive">{errors.emergencyMobileNumber}</p>
              )}
            </>
          ) : (
            <p className="text-sm text-foreground p-2 bg-muted/30 rounded-md border">
              {emergencyMobileNumber || "—"}
            </p>
          )}
        </div>

        {/* Relation */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            Relation
          </Label>
          {isEditMode ? (
            <Select
              value={emergencyRelation}
              onValueChange={(value) => onFieldChange("emergencyRelation", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select relation" />
              </SelectTrigger>
              <SelectContent>
                {relationOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-foreground p-2 bg-muted/30 rounded-md border">
              {emergencyRelation || "—"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
