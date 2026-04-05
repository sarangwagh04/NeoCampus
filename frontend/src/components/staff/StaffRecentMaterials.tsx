import { BookOpen, FileText, ExternalLink, Calendar, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface RecentMaterial {
  id: string;
  title: string;
  subjectName: string;
  subjectCode: string;
  targetClass: string;
  uploadedAt: string;
  filesCount: number;
  status: "published" | "draft";
}



export function StaffRecentMaterials({ materials }: { materials: RecentMaterial[] }) {
  const publishedCount = materials.filter((m) => m.status === "published").length;

  return (
    <Card className="card-shadow animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Recent Assignments & Notes</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {publishedCount} published
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {materials.length === 0 && (
          /* =====================================================
             ✅ EMPTY STATE ADDED (NO VISUAL CHANGE TO DESIGN)
          ===================================================== */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mb-3" />
            <h4 className="text-sm font-medium text-foreground">
              No Materials Uploaded
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              You haven’t uploaded any materials yet.
            </p>
          </div>
        )}

        {materials.length > 0 && (
        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-3">
            {materials.map((material, index) => (
              <div
                key={material.id}
                className={cn(
                  "p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors animate-slide-up",
                  material.status === "draft" && "border-dashed border-warning/50 bg-warning/5"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-sm text-foreground line-clamp-1">
                      {material.title}
                    </h4>
                  </div>
                  <Badge 
                    className={cn(
                      "text-xs shrink-0",
                      material.status === "published" 
                        ? "bg-success/10 text-success" 
                        : "bg-warning/10 text-warning"
                    )}
                  >
                    {material.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-medium text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">
                    {material.subjectCode}
                  </span>
                  <span className="text-xs text-muted-foreground">{material.subjectName}</span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {material.targetClass}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {material.uploadedAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {material.filesCount} file{material.filesCount > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>)}
        <Link 
          to="/staff/materials"
          className="block w-full mt-4 py-2 text-sm text-center text-primary hover:bg-primary/5 rounded-lg transition-colors"
        >
          View All Materials →
        </Link>
      </CardContent>
    </Card>
  );
}
