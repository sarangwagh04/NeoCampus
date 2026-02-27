import { useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, X, CheckCircle, Loader2 } from "lucide-react";
import { UploadedFile } from "@/hooks/useStaffResultUpload";
import { cn } from "@/lib/utils";

interface ResultFileUploadProps {
  isActive: boolean;
  isComplete: boolean;
  isLoading: boolean;
  uploadedFile: UploadedFile | null;
  onFileUpload: (file: File) => void;
  onRemoveFile: () => void;
  error: string | null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResultFileUpload({
  isActive,
  isComplete,
  isLoading,
  uploadedFile,
  onFileUpload,
  onRemoveFile,
  error,
}: ResultFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  return (
    <Card className={cn(
      "transition-all duration-300",
      isActive ? "ring-2 ring-primary/50" : "opacity-60"
    )}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
            isComplete ? "bg-success text-success-foreground" : isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            {isComplete ? <CheckCircle className="h-4 w-4" /> : "2"}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Result File Upload
            </CardTitle>
            <CardDescription>
              Upload Excel or CSV file containing student results
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isActive ? (
          <p className="text-sm text-muted-foreground">Complete Step 1 to proceed</p>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Processing file...</p>
          </div>
        ) : uploadedFile ? (
          <div className="flex items-center justify-between p-4 bg-success/10 border border-success/30 rounded-lg">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-10 w-10 text-success" />
              <div>
                <p className="font-medium text-foreground">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onRemoveFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-foreground font-medium mb-1">
                Drag & drop your file here
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: .xlsx, .xls, .csv (Max 10MB)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            {error && (
              <p className="mt-3 text-sm text-destructive">{error}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
