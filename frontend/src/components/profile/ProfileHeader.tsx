import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Loader2 } from "lucide-react";
import { useRef } from "react";

interface ProfileHeaderProps {
  profilePicture: string;
  fullName: string;
  collegeId: string;
  role: string;
  onPictureChange: (file: File) => void;
  isUploading: boolean;
  isEditMode: boolean;
}

export function ProfileHeader({
  profilePicture,
  fullName,
  collegeId,
  role,
  onPictureChange,
  isUploading,
  isEditMode,
}: ProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return;
      }
      onPictureChange(file);
    }
  };

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="stat-card flex flex-col items-center text-center p-6 lg:p-8">
      <div className="relative">
        <Avatar className="w-28 h-28 border-4 border-primary/10 shadow-lg">
          <AvatarImage src={profilePicture} alt={fullName} />
          <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        {isEditMode && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              size="icon"
              variant="secondary"
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full shadow-md"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </Button>
          </>
        )}
      </div>

      <h2 className="text-xl font-semibold text-foreground mt-4">{fullName}</h2>
      <p className="text-sm text-muted-foreground mt-1">{collegeId}</p>
      
      <Badge variant="secondary" className="mt-3 bg-primary/10 text-primary hover:bg-primary/10">
        {role}
      </Badge>
    </div>
  );
}
