// useStaffStudyMaterials.ts

import { useState, useEffect } from "react";
import api from "@/api/axios";

export interface Notice {
  id: number;
  title: string;
  subject_code?: string;
  created_at: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
}

export function useStaffStudyMaterials() {

  const [assignedSubjects, setAssignedSubjects] = useState<Subject[]>([]);
  const [batchOptions, setBatchOptions] = useState<string[]>([]);
  const [uploadHistory, setUploadHistory] = useState<Notice[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // ==============================
  // FETCH SUBJECTS
  // ==============================

  useEffect(() => {
    api.get("/notices/subjects/")
      .then(res => setAssignedSubjects(res.data))
      .catch(() => console.error("Failed to load subjects"));
  }, []);

  // ==============================
  // FETCH BATCHES
  // ==============================

  useEffect(() => {
    api.get("/notices/batches/")
      .then(res => setBatchOptions(res.data))
      .catch(() => console.error("Failed to load batches"));
  }, []);

  // ==============================
  // FETCH NOTICES (UPLOAD HISTORY)
  // ==============================

  const fetchNotices = async () => {
    try {
      const res = await api.get("/notices/");
      setUploadHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch notices");
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // ==============================
  // UPLOAD NOTICE
  // ==============================

  const uploadMaterial = async (data: {
    academicContext: {
      subjectId?: string;
      batchId?: string;
      is_public: boolean;
    };
    title: string;
    staffMessage: string;
    referenceLinks: string[];
    files: File[];
  }) => {

    setIsUploading(true);

    try {

      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("brief_message", data.staffMessage);
      formData.append("is_public", String(data.academicContext.is_public));
      formData.append("uploaded_by", localStorage.getItem("name") || "Staff");

      if (!data.academicContext.is_public) {
        formData.append("subject_id", data.academicContext.subjectId || "");
        formData.append("batch_id", data.academicContext.batchId || "");
      }

      data.referenceLinks.forEach((link) => {
        formData.append("links", link);
      });

      data.files.forEach((file) => {
        formData.append("files", file);
      });

      await api.post("/notices/", formData);

      // ✅ Refresh upload history after success
      await fetchNotices();

      setIsUploading(false);
      return { success: true };

    } catch (error: any) {
      setIsUploading(false);
      return {
        success: false,
        error: error.response?.data?.detail || "Upload failed",
      };
    }
  };

  return {
    assignedSubjects,
    batchOptions,
    uploadHistory,   // ✅ NOW DEFINED
    isUploading,
    uploadMaterial,
  };
}