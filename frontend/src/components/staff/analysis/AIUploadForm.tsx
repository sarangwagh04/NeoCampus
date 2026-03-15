import { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Brain, Sparkles, FileText, X, Columns3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SparkleParticles } from "@/components/ui/sparkle-particles";


export interface AIMetadata {
  class: string;
  semester: string;
  branch: string;
  academicYear: string;
  examName: string;
}



interface AIUploadFormProps {
  onFileUpload: (file: File, columnNames: string, metadata: AIMetadata) => void;
  onBack: () => void;
  error: string | null;
}

const classOptions = ["F.E.", "S.E.", "T.E.", "B.E."];
const semesterOptions = ["First", "Second"];
const branchOptions = ["Computer Science & Design", "Information Technology", "E&TC", "Mechanical", "Civil", "Electrical"];
const yearOptions = ["2023-24", "2024-25", "2025-26"];
const examOptions = ["APR/MAY", "NOV/DEC"];


function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
export function AIUploadForm({ onFileUpload, onBack, error }: AIUploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [columnNames, setColumnNames] = useState("");
  const [metadata, setMetadata] = useState<AIMetadata>({
    class: "",
    semester: "",
    branch: "",
    academicYear: "",
    examName: "",
  });
  const updateMetadata = (field: keyof AIMetadata, value: string) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
  };
  const isMetadataComplete = metadata.class && metadata.semester && metadata.branch && metadata.academicYear && metadata.examName;

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setPreviewFile(file);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviewFile(file);
  };
  const handleUpload = () => {
    if (previewFile && isMetadataComplete) onFileUpload(previewFile, columnNames, metadata);
  };
  const removeFile = () => {
    setPreviewFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canProceed = previewFile && isMetadataComplete;


  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Method Selection
      </Button>
      <Card
        className={cn(
          "relative overflow-hidden border-2 border-violet-500/30 transition-all duration-500",
          "bg-gradient-to-br from-violet-50/80 via-background to-purple-50/80",
          "dark:from-violet-950/40 dark:via-background dark:to-purple-950/40",
          isHovering && "border-violet-500/50 shadow-xl shadow-violet-500/20"
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Background effects */}
        <SparkleParticles isActive={isHovering} />
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-violet-500/0 animate-[shimmer_3s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-violet-500/10 via-purple-500/20 to-violet-500/10 blur-xl -z-10 opacity-50" />


        {/* Floating sparkles */}
        <div className="absolute top-8 right-10 animate-pulse">
          <Sparkles className="h-3 w-3 text-violet-400/50" />
        </div>
        <div className="absolute bottom-12 left-8 animate-pulse" style={{ animationDelay: "0.7s" }}>
          <Sparkles className="h-2.5 w-2.5 text-purple-400/50" />
        </div>
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-500/30 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Brain className="h-6 w-6 text-violet-500" />
            </div>
            <div>
              <CardTitle className="text-lg bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
                AI-Powered Result Analysis
              </CardTitle>
              <CardDescription>
                Upload your result file — our AI will extract and analyze the data automatically
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 relative">
                    {/* Academic Metadata Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Class <span className="text-destructive">*</span></Label>
              <Select value={metadata.class} onValueChange={(v) => updateMetadata("class", v)}>
                <SelectTrigger className="bg-background border-violet-300/50 dark:border-violet-700/50">
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
              <Select value={metadata.semester} onValueChange={(v) => updateMetadata("semester", v)}>
                <SelectTrigger className="bg-background border-violet-300/50 dark:border-violet-700/50">
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
              <Select value={metadata.branch} onValueChange={(v) => updateMetadata("branch", v)}>
                <SelectTrigger className="bg-background border-violet-300/50 dark:border-violet-700/50">
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
              <Select value={metadata.academicYear} onValueChange={(v) => updateMetadata("academicYear", v)}>
                <SelectTrigger className="bg-background border-violet-300/50 dark:border-violet-700/50">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {yearOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Exam Name <span className="text-destructive">*</span></Label>
              <Select value={metadata.examName} onValueChange={(v) => updateMetadata("examName", v)}>
                <SelectTrigger className="bg-background border-violet-300/50 dark:border-violet-700/50">
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {examOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>


          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          {previewFile ? (
            <div className="space-y-4">
              <div
                className={cn(
                  "flex items-center gap-4 p-5 rounded-xl border-2 border-violet-300/50 dark:border-violet-700/50 transition-all duration-300",
                  "bg-gradient-to-r from-violet-50/50 to-purple-50/50 dark:from-violet-950/30 dark:to-purple-950/30"
                )}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{previewFile.name}</p>
                  <p className="text-sm text-muted-foreground">{formatFileSize(previewFile.size)}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={removeFile} className="text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Button
              className={cn(
                  "w-full transition-all duration-300",
                  canProceed
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.01]"
                    : "bg-muted text-muted-foreground"
                )}
                size="lg"
                onClick={handleUpload}
                disabled={!canProceed}
              >
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                Analyze with AI
                {canProceed ? "Analyze with AI" : "Fill all required fields to continue"}
              </Button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300",
                "group hover:scale-[1.01]",
                isDragging
                  ? "border-violet-500 bg-violet-500/10 scale-[1.02] shadow-xl shadow-violet-500/20"
                  : "border-violet-300/50 dark:border-violet-700/50 hover:border-violet-500/60 hover:bg-violet-500/5"
              )}
            >
              {/* Animated upload icon */}
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className={cn(
                  "absolute inset-0 rounded-full transition-all duration-500",
                  isDragging
                    ? "bg-violet-500/20 animate-ping"
                    : "bg-gradient-to-br from-violet-500/10 to-purple-500/10 group-hover:from-violet-500/20 group-hover:to-purple-500/20"
                )} />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                  <Upload className={cn(
                    "h-8 w-8 text-violet-500 transition-transform duration-500",
                    isDragging ? "scale-125 -translate-y-1" : "group-hover:-translate-y-1"
                  )} />
                </div>
              </div>
              <p className="font-semibold text-foreground text-lg">
                {isDragging ? "Drop your file here" : "Drag & drop your result file"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                or <span className="text-violet-500 font-medium underline underline-offset-2">click to browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Supported formats: PDF, Excel (.xlsx, .xls), CSV
              </p>
            </div>
          )}

          {/* Column Names Input */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Columns3 className="h-4 w-4 text-violet-500" />
              Column Names to Extract <span className="text-destructive">*</span>
            </Label>
            <Input
              value={columnNames}
              onChange={(e) => setColumnNames(e.target.value)}
              placeholder="e.g. Seat No, Name, Subject1, Subject2, Result, ..."
              className={cn(
                "border-violet-300/50 dark:border-violet-700/50 bg-background",
                "focus-visible:ring-violet-500/50 focus-visible:border-violet-500",
                "placeholder:text-muted-foreground/60 transition-all duration-300"
              )}
            />
            <p className="text-xs text-muted-foreground">
              Enter the column names from your PDF separated by commas. These will be used to extract and structure the data.
            </p>
          </div>


          {error && (
            <p className="text-sm text-destructive text-center animate-fade-in">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
