import { useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, X, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisMetadata } from "@/hooks/useResultAnalysis";

interface AnalysisUploadFormProps {
  metadata: AnalysisMetadata;
  onUpdateMetadata: (field: keyof AnalysisMetadata, value: string) => void;
  isMetadataComplete: boolean;
  uploadedFile: File | null;
  onFileUpload: (file: File) => void;
  onRemoveFile: () => void;
  onGenerate: () => void;
  onBack: () => void;
  isProcessing: boolean;
  error: string | null;
}

const classOptions = ["F.E.", "S.E.", "T.E.", "B.E.", "M.E."];
const semesterOptions = ["First", "Second"];
const branchOptions = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Electrical"];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AnalysisUploadForm({
  metadata,
  onUpdateMetadata,
  isMetadataComplete,
  uploadedFile,
  onFileUpload,
  onRemoveFile,
  onGenerate,
  onBack,
  isProcessing,
  error,
}: AnalysisUploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFileUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
  };

  const canGenerate = isMetadataComplete && uploadedFile && !isProcessing;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Method Selection
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Traditional Result Analysis
          </CardTitle>
          <CardDescription>
            Upload your result PDF and fill in the academic details to generate the analysis report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Metadata Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Class <span className="text-destructive">*</span></Label>
              <Select value={metadata.class} onValueChange={(v) => onUpdateMetadata("class", v)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {classOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Semester / Term <span className="text-destructive">*</span></Label>
              <Select value={metadata.semester} onValueChange={(v) => onUpdateMetadata("semester", v)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {semesterOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Branch <span className="text-destructive">*</span></Label>
              <Select value={metadata.branch} onValueChange={(v) => onUpdateMetadata("branch", v)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {branchOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Academic Year <span className="text-destructive">*</span></Label>
              <Input 
                value={metadata.academicYear} 
                onChange={(e) => onUpdateMetadata("academicYear", e.target.value)}
                placeholder="Ex. 2024-25"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label>Exam Name <span className="text-destructive">*</span></Label>
              <Input 
                value={metadata.examName} 
                onChange={(e) => onUpdateMetadata("examName", e.target.value)}
                placeholder="Ex. APR/MAY"
                className="bg-background"
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <Label>Result PDF <span className="text-destructive">*</span></Label>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {uploadedFile ? (
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(uploadedFile.size)}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onRemoveFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  "hover:border-primary/50 hover:bg-muted/30"
                )}
              >
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium text-foreground">
                  Drag & drop your PDF here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  Supported format: PDF only
                </p>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          {/* Generate Button */}
          <Button 
            className="w-full" 
            size="lg"
            disabled={!canGenerate}
            onClick={onGenerate}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload & Generate Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
