import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import api from "@/api/axios";

export interface AttendanceReportFilters {
  branch: string;
  minPercentage?: number;
  maxPercentage?: number;
}

const fetchAttendanceData = async (filters: AttendanceReportFilters) => {
  const payload: any = {
    branch: filters.branch,
  };

  if (filters.minPercentage !== undefined)
    payload.min_percentage = filters.minPercentage;

  if (filters.maxPercentage !== undefined)
    payload.max_percentage = filters.maxPercentage;

  const res = await api.post("/attendance/report/", payload);
  return res.data;
};

export const generateAttendanceReportPDF = async (
  filters: AttendanceReportFilters
) => {
  const students = await fetchAttendanceData(filters);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("NeoCampus - Attendance Report", pageWidth / 2, 15, {
    align: "center",
  });

  if (!students || students.length === 0) {
    doc.setFontSize(12);
    doc.text("No attendance data available.", 14, 30);
    doc.save(`Attendance_Report_${filters.branch}.pdf`);
    return;
  }

  const subjectCodes =
    students[0]?.subjects?.map((s: any) => s.code) || [];

  autoTable(doc, {
    startY: 30,
    head: [["Roll No.", "Name", ...subjectCodes, "Total", "Overall %"]],
    body: students.map((s: any) => [
      s.rollNumber,
      s.name,
      ...(s.subjects?.map(
        (subj: any) => `${subj.attended}/${subj.total}`
      ) || []),
      `${s.totalAttended}/${s.totalLectures}`,
      `${s.overallPercentage}%`,
    ]),
    theme: "grid",
  });

  doc.save(`Attendance_Report_${filters.branch}.pdf`);
};

export const generateAttendanceReportExcel = async (
  filters: AttendanceReportFilters
) => {
  const students = await fetchAttendanceData(filters);
  const wb = XLSX.utils.book_new();

  if (students.length === 0) return;

  const subjectCodes = students[0].subjects.map((s: any) => s.code);

  const sheetData = [
    ["Roll No.", "Name", ...subjectCodes, "Total", "Overall %"],
    ...students.map((s: any) => [
      s.rollNumber,
      s.name,
      ...s.subjects.map((subj: any) => `${subj.attended}/${subj.total}`),
      `${s.totalAttended}/${s.totalLectures}`,
      `${s.overallPercentage}%`,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");

  XLSX.writeFile(wb, `Attendance_Report_${filters.branch}.xlsx`);
};