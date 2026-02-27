import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SubjectResult } from "@/hooks/useStudentResults";

interface MarksheetData {
  studentName: string;
  collegeId: string;
  branch: string;
  semester: number;
  subjects: SubjectResult[];
  sgpa: number;
  totalCredits: number;
  earnedCredits: number;
  result: "PASS" | "FAIL";
}

export function generateMarksheetPDF(data: MarksheetData): void {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 15;

  // Helper functions
  const centerText = (text: string, y: number, fontSize: number = 12, fontStyle: "normal" | "bold" = "normal") => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  // Border
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, pageWidth - 20, 277);
  doc.rect(12, 12, pageWidth - 24, 273);

  // College Header
  centerText("DR. VITHALRAO VIKHE PATIL COLLEGE OF ENGG.", yPos + 5, 16, "bold");
  centerText("(Affiliated to Pune University)", yPos + 12, 10, "normal");
  centerText("Recognized by NAAC, A+ Grade", yPos + 18, 9, "normal");

  // Horizontal line
  yPos += 25;
  doc.setLineWidth(0.3);
  doc.line(15, yPos, pageWidth - 15, yPos);

  // Marksheet Title
  yPos += 8;
  centerText("PROVISIONAL GRADE CARD", yPos, 14, "bold");

  // Student Details Section
  yPos += 18;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const leftCol = 20;
  const rightCol = pageWidth / 2 + 10;
  const labelWidth = 35;

  // Left column
  doc.setFont("helvetica", "bold");
  doc.text("Name:", leftCol, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(data.studentName, leftCol + labelWidth, yPos);

  doc.setFont("helvetica", "bold");
  doc.text("Branch:", leftCol, yPos + 8);
  doc.setFont("helvetica", "normal");
  doc.text(data.branch, leftCol + labelWidth, yPos + 8);

  // Right column
  doc.setFont("helvetica", "bold");
  doc.text("College ID:", rightCol, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(data.collegeId, rightCol + labelWidth, yPos);

  doc.setFont("helvetica", "bold");
  doc.text("Semester:", rightCol, yPos + 8);
  doc.setFont("helvetica", "normal");
  doc.text(String(data.semester), rightCol + labelWidth, yPos + 8);

  // Subject Results Table
  yPos += 25;

  const tableData = data.subjects.map((subject) => [
    subject.code,
    subject.name,
    String(subject.credits),
    String(subject.internalMarks),
    String(subject.externalMarks),
    String(subject.totalMarks),
    String(subject.maxMarks),
    subject.grade,
    subject.status,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Code", "Subject Name", "Cr", "Int", "Ext", "Total", "Max", "Grade", "Status"]],
    body: tableData,
    margin: { left: 15, right: 15 },
    styles: {
      fontSize: 9,
      cellPadding: 2,
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      fillColor: [51, 51, 51],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 55, halign: "left" },
      2: { cellWidth: 12 },
      3: { cellWidth: 15 },
      4: { cellWidth: 15 },
      5: { cellWidth: 18 },
      6: { cellWidth: 15 },
      7: { cellWidth: 18 },
      8: { cellWidth: 18 },
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Get Y position after table
  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Summary Section
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.2);
  doc.roundedRect(15, yPos, pageWidth - 30, 35, 2, 2);

  yPos += 8;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  centerText("RESULT SUMMARY", yPos, 11, "bold");

  yPos += 10;
  const summaryLeftCol = 25;
  const summaryRightCol = pageWidth / 2 + 15;
  const summaryLabelWidth = 45;

  doc.setFontSize(10);

  // Row 1
  doc.setFont("helvetica", "bold");
  doc.text("Total Credits:", summaryLeftCol, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(String(data.totalCredits), summaryLeftCol + summaryLabelWidth, yPos);

  doc.setFont("helvetica", "bold");
  doc.text("Credits Earned:", summaryRightCol, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(String(data.earnedCredits), summaryRightCol + summaryLabelWidth, yPos);

  // Row 2
  yPos += 8;

  doc.setFont("helvetica", "bold");
  doc.text("SGPA:", summaryLeftCol, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(data.sgpa.toFixed(2), summaryLeftCol + summaryLabelWidth, yPos);

  doc.setFont("helvetica", "bold");
  doc.text("Result:", summaryRightCol, yPos);
  doc.setTextColor(data.result === "PASS" ? 0 : 200, data.result === "PASS" ? 128 : 0, 0);
  doc.text(data.result, summaryRightCol + summaryLabelWidth, yPos);
  doc.setTextColor(0, 0, 0);

  // Signature Section
  yPos += 35;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  doc.text("Date: " + new Date().toLocaleDateString("en-IN"), 20, yPos);

  doc.text("Controller of Examinations", pageWidth - 60, yPos);
  doc.line(pageWidth - 70, yPos - 10, pageWidth - 20, yPos - 10);

  // Footer
  yPos = 275;
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  centerText("This is a computer-generated document.", yPos, 7, "normal");
  centerText(`Document ID: ITM/${data.semester}/${data.collegeId}`, yPos + 4, 7, "normal");

  // Save the PDF
  const fileName = `Marksheet_Sem${data.semester}_${data.collegeId}.pdf`;
  doc.save(fileName);
}
