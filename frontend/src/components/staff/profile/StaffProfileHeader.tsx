import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Loader2 } from "lucide-react";
import { useRef } from "react";

interface StaffProfileHeaderProps {
  profilePicture: string;
  firstName: string;
  middleName: string;
  lastName: string;
  collegeId: string;
  role: string;
  designation: string;
  onPictureChange: (file: File) => void;
  isUploading: boolean;
  isEditMode: boolean;
}

export function StaffProfileHeader({
  profilePicture,
  firstName,
  middleName,
  lastName,
  collegeId,
  role,
  designation,
  onPictureChange,
  isUploading,
  isEditMode,
}: StaffProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) return;
      onPictureChange(file);
    }
  };

  const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");
  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

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
      
      <div className="flex gap-2 mt-3">
        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10">
          {role}
        </Badge>
        <Badge variant="outline" className="text-muted-foreground">
          {designation}
        </Badge>
      </div>
    </div>
  );
}
