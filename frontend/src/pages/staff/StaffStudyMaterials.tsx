import { useState } from "react";
import { BookOpen } from "lucide-react";
import { StaffDashboardLayout } from "@/components/staff/StaffDashboardLayout";
import { StudyMaterialUploadForm } from "@/components/staff/materials/StudyMaterialUploadForm";
import { UploadHistorySection } from "@/components/staff/materials/UploadHistorySection";
import { InlineBanner } from "@/components/ui/inline-banner";
import { useStaffStudyMaterials } from "@/hooks/useStaffStudyMaterials";

const StaffStudyMaterials = () => {
  const { uploadHistory } = useStaffStudyMaterials();
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSuccess = () => {
    setBanner({ type: "success", message: "Update published successfully!" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleError = (message: string) => {
    setBanner({ type: "error", message });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Notice Board
              </h1>
              <p className="text-sm text-muted-foreground">
                Share notes, presentations, and updates with your students
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Banner */}
        {banner && (
          <InlineBanner
            type={banner.type}
            message={banner.message}
            onClose={() => setBanner(null)}
            autoClose={5000}
          />
        )}

        {/* Upload Form */}
        <StudyMaterialUploadForm onSuccess={handleSuccess} onError={handleError} />

        {/* Upload History */}
        <UploadHistorySection materials={uploadHistory} />
      </div>
    </StaffDashboardLayout>
  );
};

export default StaffStudyMaterials;
