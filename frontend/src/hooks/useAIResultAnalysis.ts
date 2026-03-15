import { useState, useCallback } from "react";
import type { AnalysisReport, SubjectResult, ClassSummary, Topper } from "./useResultAnalysis";
import type { AIMetadata } from "@/components/staff/analysis/AIUploadForm";
import { set } from "date-fns";

export type AIStep =
  | "upload"
  | "processing-upload"
  | "column-select"
  | "value-mapping"
  | "field-mapping"
  | "generating"
  | "report";

export interface ParsedColumn {
  name: string;
  sampleValues: string[];
}

export interface ParsedData {
  columns: ParsedColumn[];
  rows: Record<string, string>[];
  totalRows: number;
}

export interface ValueMapping {
  value: string;
  count: number;
  status: "pass" | "fail" | null;
}

export interface FieldMapping {
  key: string;
  label: string;
  description: string;
  required: boolean;
  mappedColumn: string | null;
}

/*
========================================================
UPDATED REPORT FIELDS FOR CSV BASED ARCHITECTURE
========================================================
*/
const REPORT_FIELDS: Omit<FieldMapping, "mappedColumn">[] = [
  {
    key: "studentName",
    label: "Student Name",
    description: "Column containing student names",
    required: true
  },
  {
    key: "subjectName",
    label: "Subject Name",
    description: "Column containing subject names",
    required: true
  },
  {
    key: "rankColumn",
    label: "Ranking Column",
    description: "Column used to rank students (SGPA, Total Marks, CGPA, etc.)",
    required: true
  },
  {
    key: "thHead",
    label: "Theory Head (Optional)",
    description: "Column representing exam head (TH / PR)",
    required: false
  }
];

/*
========================================================
REPORT GENERATION ENGINE
UPDATED TO USE FIELD MAPPINGS
========================================================
*/
const generateReportFromMapping = (
  parsedData: ParsedData,
  criteriaColumn: string,
  valueMappings: ValueMapping[],
  metadata?: AIMetadata,
  fieldMappings?: FieldMapping[] // 🔁 NEW: receive field mappings
): AnalysisReport => {

  const rows = parsedData.rows;
  const totalStudents = rows.length;

  const passValues = valueMappings
    .filter(m => m.status === "pass")
    .map(m => m.value);

  /*
  ========================================================
  🔁 NEW: Extract mapped columns from fieldMappings
  ========================================================
  */

  const studentNameColumn =
    fieldMappings?.find(f => f.key === "studentName")?.mappedColumn || "Student Name";

  const subjectNameColumn =
    fieldMappings?.find(f => f.key === "subjectName")?.mappedColumn || "Subject Name";

  const rankColumn =
    fieldMappings?.find(f => f.key === "rankColumn")?.mappedColumn || "SGPA";

  const thHeadColumn =
    fieldMappings?.find(f => f.key === "thHead")?.mappedColumn || null;

  /*
  ========================================================
  SUBJECT LIST FROM CSV
  ========================================================
  */

  const subjectSet = new Set<string>();

  rows.forEach(r => {
    const subject = r[subjectNameColumn];
    if (subject && subject !== "-") subjectSet.add(subject);
  });

  const subjects = Array.from(subjectSet);

  /*
  ========================================================
  SUBJECT ANALYSIS
  ========================================================
  */

  const subjectResults: SubjectResult[] = subjects.map((subject, idx) => {

    const subjectRows = rows.filter(r => r[subjectNameColumn] === subject);

    const appeared = subjectRows.length;

    let passed = 0;

    subjectRows.forEach(r => {
      if (passValues.includes(r[criteriaColumn])) passed++;
    });

    const failed = appeared - passed;

    const passingPercentage = appeared
      ? (passed / appeared) * 100
      : 0;

    /*
    🔁 NEW: determine exam head if column mapped
    */

    let examHead: "TH" | "PR" | "OR" | "TW" = "TH";

    if (thHeadColumn) {
      const val = subjectRows[0]?.[thHeadColumn];
      if (val && ["PR", "OR", "TW"].includes(val)) {
        examHead = val as any;
      }
    }

    return {
      srNo: idx + 1,
      subjectName: subject,
      examHead,
      appeared,
      passed,
      failed,
      passingPercentage,
      teacherName: "-"
    };
  });

  /*
  ========================================================
  CLASS SUMMARY
  ========================================================
  */

  let totalPass = 0;

  rows.forEach(r => {
    if (passValues.includes(r[criteriaColumn])) {
      totalPass++;
    }
  });

  const classSummary: ClassSummary[] = [
    {
      className: metadata?.class || "Not Defined",
      appeared: totalStudents,
      firstClassDistinction: 0,
      firstClass: 0,
      higherSecondClass: 0,
      secondClass: 0,
      passClass: totalPass,
      totalPass,
      remark:
        totalPass / totalStudents >= 0.8
          ? "Good"
          : totalPass / totalStudents >= 0.6
          ? "Satisfactory"
          : "Needs Improvement"
    }
  ];

  /*
  ========================================================
  TOPPER CALCULATION USING MAPPED RANK COLUMN
  ========================================================
  */

  const sortedRows = [...rows]
    .filter(r => passValues.includes(r[criteriaColumn]))
    .sort(
      (a, b) =>
        parseFloat(b[rankColumn] || "0") -
        parseFloat(a[rankColumn] || "0")
    );

  const toppers: Topper[] = sortedRows.slice(0, 3).map((r, idx) => ({
    rank: idx + 1,
    name: r[studentNameColumn],
    sgpa: parseFloat(r[rankColumn] || "0")
  }));

  const classAndBranch = metadata
    ? `${metadata.class} - ${metadata.branch}`
    : "Not Defined";

  return {
    collegeName: "Dr. Vithalrao Vikhe Patil College of Engineering, Viladghat",
    referenceNumber: `RCOEM/EXAM/${new Date().getFullYear()}/${Math.floor(
      Math.random() * 1000
    )}`,
    date: new Date().toLocaleDateString("en-IN"),
    term: metadata?.semester || "Second",
    exam: metadata?.examName || "APR/MAY",
    academicYear: metadata?.academicYear || "2024-25",
    classAndBranch,
    subjectResults,
    classSummary,
    toppers
  };
};

export function useAIResultAnalysis() {

  const [step, setStep] = useState<AIStep>("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [columnNames, setColumnNames] = useState<string>("");

  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

  const [valueMappings, setValueMappings] = useState<ValueMapping[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);

  const [report, setReport] = useState<AnalysisReport | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<AIMetadata | null>(null);

  /*
  ========================================================
  FILE UPLOAD HANDLER
  ========================================================
  */

  const handleFileUpload = useCallback(async (file: File, columns: string, meta: AIMetadata) => {

    setUploadedFile(file);
    setColumnNames(columns);
    setMetadata(meta);

    setError(null);
    setStep("processing-upload");

    try {

      const formData = new FormData();
      formData.append("file", file);

      if (columns.trim() !== "") {
        formData.append("column_names", columns);
      }

      const response = await fetch("/api/result-analysis/ai-extract/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to process file");
      }

      const data = await response.json();

      if (data.warning) {
        console.warn("[AI WARNING]", data.warning);
      }

      const columnsFromAPI: string[] = data.columns || [];
      const rowsFromAPI: Record<string, string>[] = data.rows || [];

      const uniqueColumns = [...new Set(columnsFromAPI)];

      const parsed: ParsedData = {
        columns: uniqueColumns.map((c: string) => ({
          name: c,
          sampleValues: rowsFromAPI.slice(0, 5).map((r: any) => r[c]),
        })),
        rows: rowsFromAPI,
        totalRows: data.total_rows || rowsFromAPI.length,
      };

      setParsedData(parsed);

      setStep("column-select");

    } catch (err: any) {

      console.error("AI upload error:", err);

      setError(
        err?.message || "Failed to process the file. Please try again."
      );

      setStep("upload");
    }

  }, []);

  /*
  ========================================================
  COLUMN SELECT
  ========================================================
  */

  const handleColumnSelect = useCallback((columnName: string) => {

    if (!parsedData) return;

    setSelectedColumn(columnName);

    const valueCounts: Record<string, number> = {};

    parsedData.rows.forEach(row => {
      const val = row[columnName] || "N/A";
      valueCounts[val] = (valueCounts[val] || 0) + 1;
    });

    const mappings: ValueMapping[] = Object.entries(valueCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({
        value,
        count,
        status: null
      }));

    setValueMappings(mappings);

    setStep("value-mapping");

  }, [parsedData]);

  const updateValueMapping = useCallback((value: string, status: "pass" | "fail" | null) => {
    setValueMappings(prev =>
      prev.map(m => (m.value === value ? { ...m, status } : m))
    );
  }, []);

  const allMapped =
    valueMappings.length > 0 &&
    valueMappings.every(m => m.status !== null);

  /*
  ========================================================
  FIELD MAPPING INITIALIZATION
  ========================================================
  */

  const proceedToFieldMapping = useCallback(() => {

    if (!parsedData || !selectedColumn) return;

    const availableCols = parsedData.columns.map(c => c.name);

    const mappings: FieldMapping[] = REPORT_FIELDS.map(field => {

      let autoMapped: string | null = null;

      for (const col of availableCols) {

        const lower = col.toLowerCase();

        /*
        🔁 UPDATED AUTO MATCH RULES
        */

        if (field.key === "studentName" && lower.includes("name") && !lower.includes("subject"))
          autoMapped = col;

        if (field.key === "subjectName" && lower.includes("subject"))
          autoMapped = col;

        if (
          field.key === "rankColumn" &&
          (lower.includes("sgpa") || lower.includes("cgpa") || lower.includes("total") || lower.includes("percentage"))
        )
          autoMapped = col;

        if (field.key === "thHead" && lower.includes("th"))
          autoMapped = col;
      }

      return {
        ...field,
        mappedColumn: autoMapped
      };

    });

    setFieldMappings(mappings);

    setStep("field-mapping");

  }, [parsedData, selectedColumn]);

  const updateFieldMapping = useCallback((fieldKey: string, columnName: string | null) => {

    setFieldMappings(prev =>
      prev.map(f =>
        f.key === fieldKey ? { ...f, mappedColumn: columnName } : f
      )
    );

  }, []);

  const allRequiredFieldsMapped =
    fieldMappings
      .filter(f => f.required)
      .every(f => f.mappedColumn !== null);

  /*
  ========================================================
  GENERATE REPORT
  ========================================================
  */

  const generateReport = useCallback(async () => {

    if (!parsedData || !selectedColumn) return;

    setStep("generating");

    await new Promise(resolve => setTimeout(resolve, 4000));

    try {

      const generatedReport = generateReportFromMapping(
        parsedData,
        selectedColumn,
        valueMappings,
        metadata || undefined,
        fieldMappings // 🔁 NEW: pass mappings to report generator
      );

      setReport(generatedReport);

      setStep("report");

    } catch {

      setError("Failed to generate report.");

      setStep("field-mapping");
    }

  }, [parsedData, selectedColumn, valueMappings, metadata, fieldMappings]);

  /*
  ========================================================
  RESET
  ========================================================
  */

  const resetAll = useCallback(() => {

    setStep("upload");
    setUploadedFile(null);
    setColumnNames("");

    setMetadata(null);

    setParsedData(null);
    setSelectedColumn(null);

    setValueMappings([]);
    setFieldMappings([]);

    setReport(null);
    setError(null);

  }, []);

  /*
  ========================================================
  BACK NAVIGATION
  ========================================================
  */

  const goBack = useCallback(() => {

    switch (step) {

      case "column-select":
        setStep("upload");
        setUploadedFile(null);
        setParsedData(null);
        break;

      case "value-mapping":
        setSelectedColumn(null);
        setValueMappings([]);
        setStep("column-select");
        break;

      case "field-mapping":
        setFieldMappings([]);
        setStep("value-mapping");
        break;

      default:
        break;
    }

  }, [step]);

  return {
    step,
    uploadedFile,
    parsedData,
    selectedColumn,
    valueMappings,
    fieldMappings,
    report,
    error,
    allMapped,
    allRequiredFieldsMapped,
    handleFileUpload,
    handleColumnSelect,
    updateValueMapping,
    proceedToFieldMapping,
    updateFieldMapping,
    generateReport,
    resetAll,
    goBack,
  };
}