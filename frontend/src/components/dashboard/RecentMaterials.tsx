import { BookOpen, FileText, ExternalLink, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface RecentMaterial {
  id: string;
  title: string;
  subjectName: string;
  subjectCode: string;
  uploadedBy: string;
  uploadedAt: string;
  filesCount: number;
  hasReferenceLink: boolean;
}

const recentMaterials: RecentMaterial[] = [
  {
    id: "1",
    title: "Unit 2 - Trees and Graphs",
    subjectName: "Data Structures",
    subjectCode: "CS301",
    uploadedBy: "Dr. Rajesh Kumar",
    uploadedAt: "2 hours ago",
    filesCount: 2,
    hasReferenceLink: true,
  },
  {
    id: "2",
    title: "Process Scheduling Algorithms",
    subjectName: "Operating Systems",
    subjectCode: "CS302",
    uploadedBy: "Prof. Anita Sharma",
    uploadedAt: "5 hours ago",
    filesCount: 1,
    hasReferenceLink: false,
  },
  {
    id: "3",
    title: "SQL Joins and Subqueries",
    subjectName: "Database Management",
    subjectCode: "CS303",
    uploadedBy: "Dr. Priya Menon",
    uploadedAt: "1 day ago",
    filesCount: 3,
    hasReferenceLink: true,
  },
  {
    id: "4",
    title: "OSI Model Complete Notes",
    subjectName: "Computer Networks",
    subjectCode: "CS304",
    uploadedBy: "Prof. Vikram Singh",
    uploadedAt: "2 days ago",
    filesCount: 1,
    hasReferenceLink: false,
  },
];

export function RecentMaterials() {
  return (
    <div className="stat-card animate-slide-up" style={{ animationDelay: "0.5s" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Recent Assignments & Notes</h3>
        </div>
        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
          {recentMaterials.length} New
        </span>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
        {recentMaterials.map((material, index) => (
          <div
            key={material.id}
            className={cn(
              "p-3 rounded-lg border bg-card hover:bg-muted/30 transition-all duration-200 cursor-pointer hover:shadow-sm",
              index === 0 && "border-l-4 border-l-primary bg-primary/5"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 rounded-lg bg-primary/10">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={cn(
                    "text-sm leading-tight font-medium",
                    index === 0 ? "text-foreground font-semibold" : "text-muted-foreground"
                  )}>
                    {material.title}
                  </h4>
                  {material.hasReferenceLink && (
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">
                    {material.subjectCode}
                  </span>
                  <span className="text-xs text-muted-foreground">{material.subjectName}</span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {material.uploadedBy}
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
            </div>
          </div>
        ))}
      </div>

      <Link 
        to="/materials"
        className="block w-full mt-4 py-2 text-sm text-center text-primary hover:bg-primary/5 rounded-lg transition-colors"
      >
        View All Materials →
      </Link>
    </div>
  );
}

