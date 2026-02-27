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

const recentMaterials: RecentMaterial[] = [
  {
    id: "1",
    title: "Unit 2 - Trees and Graphs",
    subjectName: "Data Structures",
    subjectCode: "CS301",
    targetClass: "S.E. - Div A",
    uploadedAt: "2 hours ago",
    filesCount: 2,
    status: "published",
  },
  {
    id: "2",
    title: "Hashing Techniques",
    subjectName: "Data Structures",
    subjectCode: "CS301",
    targetClass: "S.E. - Div B",
    uploadedAt: "1 day ago",
    filesCount: 1,
    status: "published",
  },
  {
    id: "3",
    title: "Process Scheduling Draft",
    subjectName: "Operating Systems",
    subjectCode: "CS302",
    targetClass: "T.E. - Div A",
    uploadedAt: "2 days ago",
    filesCount: 1,
    status: "draft",
  },
  {
    id: "4",
    title: "SQL Joins and Subqueries",
    subjectName: "Database Management",
    subjectCode: "CS303",
    targetClass: "S.E. - All Divisions",
    uploadedAt: "3 days ago",
    filesCount: 3,
    status: "published",
  },
];

export function StaffRecentMaterials() {
  const publishedCount = recentMaterials.filter((m) => m.status === "published").length;

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
        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-3">
            {recentMaterials.map((material, index) => (
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
        </ScrollArea>
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
