import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const studentData = {
  name: "Sarang Wagh",
  rollNumber: "CSE2021045",
  department: "Computer Science & Design",
  year: "4th Year",
  semester: "8th Semester",
  email: "sarang.wagh@neocampus.edu",
  avatar: "/avatars/sarang.jpg",
};

export function ProfileCard() {
  return (
    <div className="stat-card flex flex-col sm:flex-row items-start gap-4 animate-slide-up">
      <Avatar className="w-16 h-16 border-2 border-primary/10">
        <AvatarImage src={studentData.avatar} />
        <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
          SW
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{studentData.name}</h2>
            <p className="text-sm text-muted-foreground">{studentData.rollNumber}</p>
          </div>
          <Button variant="ghost" size="sm" className="self-start sm:self-center" asChild>
            <Link to="/profile">
              View Profile
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            {studentData.department}
          </span>
          <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
            {studentData.year}
          </span>
          <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
            {studentData.semester}
          </span>
        </div>
      </div>
    </div>
  );
}
