// StudyMaterialUploadForm.tsx

import { useState, useRef, useCallback } from "react";
import { Upload, BookOpen, MessageSquare, Link2, Paperclip, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUploadPreview } from "./FileUploadPreview";
import { ReferenceLinkInput } from "./ReferenceLinkInput";
import { useStaffStudyMaterials, StudyMaterialDraft } from "@/hooks/useStaffStudyMaterials";

interface StudyMaterialUploadFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

export function StudyMaterialUploadForm({ onSuccess, onError }: StudyMaterialUploadFormProps) {
  const {
    assignedSubjects,
    batchOptions, // ✅ using batch instead of class/semester/year
    isUploading,
    uploadMaterial,
  } = useStaffStudyMaterials();

  // ==============================
  // ✅ UPDATED ACADEMIC CONTEXT ONLY
  // ==============================

  const [subjectId, setSubjectId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  // ==============================
  // MATERIAL DETAILS (UNCHANGED)
  // ==============================

  const [title, setTitle] = useState("");
  const [staffMessage, setStaffMessage] = useState("");

  const [referenceLinks, setReferenceLinks] = useState<string[]>([]); // ✅ FIXED SYNTAX
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Context validation updated
  const isContextComplete = isPublic || (subjectId && batchId);

  const isFormValid =
    isContextComplete &&
    title.trim() &&
    (files.length > 0 || referenceLinks.length > 0);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles).filter((file) => {
      if (file.size > 20 * 1024 * 1024) {
        onError(`File "${file.name}" exceeds 20MB limit`);
        return false;
      }
      return true;
    });

    setFiles((prev) => [...prev, ...newFiles]);
  }, [onError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddLink = (link: string) => {
    setReferenceLinks((prev) => [...prev, link]);
  };

  const handleRemoveLink = (index: number) => {
    setReferenceLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    const draft: StudyMaterialDraft = {
      academicContext: {
        subjectId: isPublic ? undefined : subjectId,
        batchId: isPublic ? undefined : batchId,
        is_public: isPublic,
      },
      title,
      staffMessage,
      referenceLinks,
      files,
    };

    const result = await uploadMaterial(draft);

    if (result.success) {
      resetForm();
      onSuccess();
    } else {
      onError(result.error || "Failed to publish notice");
    }
  };

  const resetForm = () => {
    setSubjectId("");
    setBatchId("");
    setIsPublic(false);
    setTitle("");
    setStaffMessage("");
    setReferenceLinks([]);
    setFiles([]);
  };

  return (
    <div className="space-y-6">

      {/* ==============================
          SECTION A: ACADEMIC CONTEXT (ONLY THIS MODIFIED)
      ============================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-primary" />
            Notice Context
          </CardTitle>
          <CardDescription>
            Select subject & batch OR make it public
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="flex items-center space-x-2 col-span-full">
            <Checkbox
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(!!checked)}
            />
            <Label>Make this notice public (visible on homepage)</Label>
          </div>

          <div className="space-y-2">
            <Label>Subject Code</Label>
            <Select
              value={subjectId}
              onValueChange={setSubjectId}
              disabled={isPublic}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {assignedSubjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.code} - {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Batch ID</Label>
            <Select
              value={batchId}
              onValueChange={setBatchId}
              disabled={isPublic}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {batchOptions.map((batch) => (
                  <SelectItem key={batch} value={batch}>
                    {batch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </CardContent>
      </Card>

      {/* ==============================
          BELOW SECTIONS ARE 100% ORIGINAL
      ============================== */}

      {/* Material Details */}
      {/* Section B: Material Details */}
      <Card className={!isContextComplete ? "opacity-60 pointer-events-none" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-primary" />
            Notice Details
          </CardTitle>
          <CardDescription>
            Add title and instructions for students
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Unit-2 Notes - Trees & Graphs"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground text-right">
              {title.length}/100
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Staff Message / Instructions</Label>
            <Textarea
              id="message"
              placeholder="e.g., Please go through these notes before next lecture. Focus on traversal algorithms."
              value={staffMessage}
              onChange={(e) => setStaffMessage(e.target.value)}
              maxLength={1000}
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">
              {staffMessage.length}/1000
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reference Links */}
      <Card className={!isContextComplete ? "opacity-60 pointer-events-none" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="h-5 w-5 text-primary" />
            Reference Links
          </CardTitle>
          <CardDescription>
            Add external resources for students (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReferenceLinkInput
            links={referenceLinks}
            onAdd={handleAddLink}
            onRemove={handleRemoveLink}
          />
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card className={!isContextComplete ? "opacity-60 pointer-events-none" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Paperclip className="h-5 w-5 text-primary" />
            Attachments
          </CardTitle>
          <CardDescription>
            Upload files for students to download (PDF, PPT, DOC, ZIP, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${isDragOver 
                ? "border-primary bg-primary/5" 
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
              }
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground mb-1">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum file size: 20MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          {/* File preview */}
          <FileUploadPreview files={files} onRemove={handleRemoveFile} />
        </CardContent>
      </Card>

      {/* Publish Button */}
      <div className="flex justify-end">
        <Button
          onClick={handlePublish}
          disabled={!isFormValid || isUploading}
          className="gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload & Publish
            </>
          )}
        </Button>
      </div>
    </div>
  );
}