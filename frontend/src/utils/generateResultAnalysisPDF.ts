import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { AnalysisReport } from "@/hooks/useResultAnalysis";

export function generateResultAnalysisPDF(report: AnalysisReport): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 20;

  // Helper function for centered text
  const centerText = (text: string, y: number, fontSize: number = 12, fontStyle: "normal" | "bold" = "normal") => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  // Helper function for left-aligned text
  const leftText = (text: string, y: number, fontSize: number = 11, fontStyle: "normal" | "bold" = "normal") => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    doc.text(text, margin, y);
  };

  // ==================== HEADER SECTION ====================
  // College Name (Bold, Centered)
  centerText(report.collegeName.toUpperCase(), yPos, 14, "bold");
  yPos += 12;

  // Reference and Date line
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Ref :- ${report.referenceNumber}`, margin, yPos);
  doc.text(`Date:- ${report.date}`, pageWidth - margin - 50, yPos);
  yPos += 10;

  // To line
  leftText("To,", yPos);
  yPos += 6;
  leftText("The Principal,", yPos);
  yPos += 6;
  leftText(report.collegeName.split(",")[0] + ".", yPos);
  yPos += 12;

  // Subject line (Bold, Underlined)
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  const subjectText = "Subject :- Subject wise Result Analysis.";
  centerText(subjectText, yPos, 12, "bold");
  // Underline
  const subjectWidth = doc.getTextWidth(subjectText);
  doc.line((pageWidth - subjectWidth) / 2, yPos + 1, (pageWidth + subjectWidth) / 2, yPos + 1);
  yPos += 10;

  // Exam details line
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const examDetails = `Total students of ${report.term.toUpperCase()} TERM for EXAM ${report.exam} (Academic year ${report.academicYear})`;
  centerText(examDetails, yPos, 10);
  yPos += 6;

  // Subject sequence note
  doc.setFont("helvetica", "italic");
  centerText("* (Subject Sequence as per mark sheet)", yPos, 9);
  yPos += 6;

  // Class and Branch
  doc.setFont("helvetica", "bold");
  centerText(`for Class: ${report.classAndBranch}`, yPos, 10, "bold");
  yPos += 10;

  // ==================== SUBJECT-WISE RESULT TABLE ====================
  autoTable(doc, {
    startY: yPos,
    head: [[
      "Sr.\nNo",
      "Name of the Subject",
      "Exam\nHead\n(TH/PR/\nOR/TW)",
      "No. of\nCandidate\nAppeared",
      "No. of\nCandidate\nPassed",
      "No. of\nCandidate\nFail",
      "% of\nPassing",
      "Name of the Teacher"
    ]],
    body: report.subjectResults.map(subject => [
      subject.srNo.toString(),
      subject.subjectName,
      subject.examHead,
      subject.appeared.toString(),
      subject.passed.toString(),
      subject.failed.toString(),
      `${subject.passingPercentage.toFixed(2)}%`,
      subject.teacherName
    ]),
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2,
      halign: "center",
      valign: "middle",
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 40, halign: "left" },
      2: { cellWidth: 18 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 18 },
      6: { cellWidth: 18 },
      7: { cellWidth: 36, halign: "left" },
    },
    margin: { left: margin, right: margin },
  });

  // Get the final Y position after the table
  yPos = (doc as any).lastAutoTable.finalY + 10;

  // ==================== CLASS TOPPERS SECTION ====================
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  leftText("CLASS TOPPERS :", yPos, 11, "bold");
  yPos += 6;

  autoTable(doc, {
    startY: yPos,
    head: [[
      "Topper",
      "Name of the Toppers",
      "Total SGPA"
    ]],
    body: report.toppers.map(topper => [
      topper.rank.toString(),
      topper.name,
      topper.sgpa.toFixed(2)
    ]),
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 3,
      halign: "center",
      valign: "middle",
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 80, halign: "left" },
      2: { cellWidth: 35 },
    },
    margin: { left: margin, right: margin },
    tableWidth: 140,
  });

  yPos = (doc as any).lastAutoTable.finalY + 20;

  // ==================== SIGNATURE SECTION ====================
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("H.O.D.", pageWidth - margin - 20, yPos);
  yPos += 15;

  // ==================== NOTE SECTION ====================
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  leftText("Note :- Pl. submit above data to EXAM. SECTION.", yPos, 9, "bold");

  // Save the PDF
  const fileName = `Result_Analysis_${report.classAndBranch.replace(/[^a-zA-Z0-9]/g, "_")}_${report.academicYear.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  doc.save(fileName);
}
