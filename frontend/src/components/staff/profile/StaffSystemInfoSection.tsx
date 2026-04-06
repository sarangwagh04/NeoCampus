import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, CheckCircle2, XCircle, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { HardwareKeyManager } from "@/components/profile/HardwareKeyManager";
import { ChangePasswordManager } from "@/components/profile/ChangePasswordManager";

interface StaffSystemInfoSectionProps {
  isActive: boolean;
  createdAt: Date;
  lastLogin: Date;
}

export function StaffSystemInfoSection({
  isActive,
  createdAt,
  lastLogin,
}: StaffSystemInfoSectionProps) {
  return (
    <Card className="card-shadow bg-muted/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-muted-foreground">
          <Settings className="w-5 h-5" />
          System & Account Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Account Status */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-sm">Account Status</Label>
          <div>
            {isActive ? (
              <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="destructive" className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/30">
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Inactive
              </Badge>
            )}
          </div>
        </div>

        {/* Created Date */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="w-4 h-4" />
            Profile Created
          </Label>
          <p className="text-sm text-foreground/80 p-2 bg-muted/30 rounded-md border border-dashed">
            {format(createdAt, "MMMM d, yyyy")}
          </p>
        </div>

        {/* Last Login */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-muted-foreground text-sm">
            <Clock className="w-4 h-4" />
            Last Login
          </Label>
          <p className="text-sm text-foreground/80 p-2 bg-muted/30 rounded-md border border-dashed">
            {format(lastLogin, "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>

        <p className="text-xs text-muted-foreground/70 italic pt-2">
          These fields are managed by the system and cannot be edited.
        </p>

        <div className="mt-4 pt-4 border-t border-dashed">
          <Label className="text-muted-foreground text-sm block mb-3">Security & Access</Label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center">
            <HardwareKeyManager />
            <ChangePasswordManager />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
