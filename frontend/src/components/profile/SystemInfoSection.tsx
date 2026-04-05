import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Settings, Clock } from "lucide-react";
import { format } from "date-fns";

interface SystemInfoSectionProps {
  profileCreatedAt: Date;
  lastLoginAt: Date;
}

export function SystemInfoSection({
  profileCreatedAt,
  lastLoginAt,
}: SystemInfoSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="w-5 h-5 text-primary" />
          System Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">
              Profile Created
            </Label>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Clock className="w-4 h-4 text-muted-foreground" />
              {format(profileCreatedAt, "MMMM d, yyyy")}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">
              Last Login
            </Label>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Clock className="w-4 h-4 text-muted-foreground" />
              {format(lastLoginAt, "MMMM d, yyyy 'at' h:mm a")}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
