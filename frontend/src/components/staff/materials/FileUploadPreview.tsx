import { X, FileText, FileSpreadsheet, File, FileArchive, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadPreviewProps {
  files: File[];
  onRemove: (index: number) => void;
}

const fileIcons: Record<string, React.ElementType> = {
  pdf: FileText,
  ppt: Presentation,
  pptx: Presentation,
  doc: FileText,
  docx: FileText,
  xlsx: FileSpreadsheet,
  xls: FileSpreadsheet,
  zip: FileArchive,
  rar: FileArchive,
};

const fileColors: Record<string, string> = {
  pdf: "text-red-500",
  ppt: "text-orange-500",
  pptx: "text-orange-500",
  doc: "text-blue-500",
  docx: "text-blue-500",
  xlsx: "text-green-500",
  xls: "text-green-500",
  zip: "text-yellow-600",
  rar: "text-yellow-600",
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

export function FileUploadPreview({ files, onRemove }: FileUploadPreviewProps) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {files.map((file, index) => {
          const ext = getFileExtension(file.name);
          const Icon = fileIcons[ext] || File;
          const iconColor = fileColors[ext] || "text-muted-foreground";

          return (
            <motion.div
              key={`${file.name}-${index}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 border border-border"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`flex-shrink-0 ${iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemove(index)}
                className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
