import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface ProfileProps {
  profile?: {
    full_name: string;
    college_id: string;
    profile_picture: string | null;
    batch_id: string;
    branch: string;
    semester: string;
  };
  loading: boolean;
}



export function ProfileCard({ profile, loading }: ProfileProps) {
  if (loading || !profile) {
    return (
      <div className="stat-card flex flex-col sm:flex-row items-start gap-4 animate-slide-up">
        <div className="w-16 h-16 bg-muted rounded-full animate-pulse"></div>
        <div className="flex-1">
          <div className="h-6 bg-muted rounded w-32 animate-pulse mb-2"></div>
          <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    
    <div className="stat-card flex flex-col sm:flex-row items-start gap-4 animate-slide-up">
      <Avatar className="w-16 h-16 border-2 border-primary/10">
        <AvatarImage src={profile.profile_picture || ""} />
        <AvatarFallback>
          {profile.full_name?.charAt(0)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold">{profile.full_name}</h2>
            <p className="text-sm text-muted-foreground">
              {profile.college_id}
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/profile">
              View Profile
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
            {profile.batch_id}
          </span>
          <span className="px-3 py-1 bg-muted text-xs rounded-full">
            {profile.branch}
          </span>
          <span className="px-3 py-1 bg-muted text-xs rounded-full">
            {profile.semester}th Semester
          </span>
        </div>
      </div>
    </div>
  );
}