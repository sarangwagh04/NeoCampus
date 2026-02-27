// useStudyMaterials.ts

import { useState, useEffect, useMemo } from "react";
import api from "@/api/axios";

export interface FileAttachment {
  id: number;
  name: string;
  type: string;
  size?: string;
  url: string;
}

export interface StudyMaterial {
  id: number;
  title: string;
  subjectId?: string;
  subjectName?: string;
  subjectCode?: string;
  uploadedBy: string;
  uploadedAt: string;
  staffMessage?: string;
  referenceLinks: string[];
  files: FileAttachment[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export type SortOption = "latest" | "subject";

export function useStudyMaterials() {

  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [searchQuery, setSearchQuery] = useState("");

  // ===============================
  // FETCH NOTICES FROM BACKEND
  // ===============================

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await api.get("/notices/");

        const mapped = res.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          subjectId: item.subject_code || "public",
          subjectName: item.subject_name || "Public Notice",
          subjectCode: item.subject_code || "PUBLIC",
          uploadedBy: item.uploaded_by,
          uploadedAt: item.created_at,
          staffMessage: item.brief_message,

          referenceLinks: item.links
            ? item.links.map((l: any) => l.url)
            : [],

          files: item.files
            ? item.files.map((f: any) => ({
                id: f.id,
                name: f.file.split("/").pop(),
                type: f.file.split(".").pop(),
                url: f.file.startsWith("http")
                  ? f.file
                  : `${import.meta.env.VITE_API_BASE_URL}${f.file}`,
              }))
            : [],
        }));

        setMaterials(mapped);

      } catch (err) {
        console.error("Failed to fetch materials");
      }
    };

    fetchMaterials();
  }, []);

  // ===============================
  // BUILD SUBJECT LIST DYNAMICALLY
  // ===============================

  const subjects: Subject[] = useMemo(() => {

    const uniqueSubjects = new Map<string, Subject>();

    materials.forEach((m) => {
      if (m.subjectCode && m.subjectCode !== "PUBLIC") {
        uniqueSubjects.set(m.subjectCode, {
          id: m.subjectCode,
          name: m.subjectName || "",
          code: m.subjectCode,
        });
      }
    });

    return [
      { id: "all", name: "All Subjects", code: "ALL" },
      ...Array.from(uniqueSubjects.values()),
    ];

  }, [materials]);

  // ===============================
  // FILTERING + SORTING
  // ===============================

  const filteredMaterials = useMemo(() => {

    let filtered = [...materials];

    if (selectedSubject !== "all") {
      filtered = filtered.filter(
        (m) => m.subjectCode === selectedSubject
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.subjectName?.toLowerCase().includes(query) ||
          m.uploadedBy.toLowerCase().includes(query)
      );
    }

    if (sortBy === "latest") {
      filtered.sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() -
          new Date(a.uploadedAt).getTime()
      );
    }

    if (sortBy === "subject") {
      filtered.sort((a, b) =>
        (a.subjectName || "").localeCompare(b.subjectName || "")
      );
    }

    return filtered;

  }, [materials, selectedSubject, sortBy, searchQuery]);

  return {
    materials: filteredMaterials,
    subjects,
    selectedSubject,
    setSelectedSubject,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
  };
}