import { Download, FileText, FileSpreadsheet, File, FileArchive, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileAttachment as FileAttachmentType } from "@/hooks/useStudyMaterials";

interface FileAttachmentProps {
  file: FileAttachmentType;
}

const fileIcons = {
  pdf: FileText,
  ppt: Presentation,
  doc: FileText,
  xlsx: FileSpreadsheet,
  zip: FileArchive,
  other: File,
};

const fileColors = {
  pdf: "text-red-500",
  ppt: "text-orange-500",
  doc: "text-blue-500",
  xlsx: "text-green-500",
  zip: "text-yellow-600",
  other: "text-muted-foreground",
};

export function FileAttachment({ file }: FileAttachmentProps) {
  const Icon = fileIcons[file.type] || File;
  const iconColor = fileColors[file.type] || "text-muted-foreground";

  const handleDownload = () => {
    // In production, this would trigger actual file download
    console.log("Downloading:", file.name);
    // Simulate download by creating a temporary link
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`flex-shrink-0 ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">{file.size}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDownload}
        className="flex-shrink-0 gap-1.5 text-primary hover:text-primary hover:bg-primary/10 opacity-70 group-hover:opacity-100 transition-opacity"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Download</span>
      </Button>
    </div>
  );
}
