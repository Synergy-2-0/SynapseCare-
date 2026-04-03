package com.healthcare.prescription.service;

import com.healthcare.prescription.entity.Prescription;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class PrescriptionPdfService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' hh:mm a");

    public byte[] generatePrescriptionPdf(Prescription prescription) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter writer = PdfWriter.getInstance(document, baos);

            document.open();

            // Add header with logo placeholder
            addHeader(document, prescription);

            // Add horizontal line
            addHorizontalLine(document);

            // Add patient information
            addPatientInfo(document, prescription);

            // Add prescription date
            addPrescriptionDate(document, prescription);

            // Add diagnosis if present
            if (prescription.getDiagnosis() != null && !prescription.getDiagnosis().isEmpty()) {
                addDiagnosis(document, prescription);
            }

            // Add prescription symbol (Rx)
            addRxSymbol(document);

            // Add medication details
            addMedicationDetails(document, prescription);

            // Add follow-up notes if present
            if (prescription.getFollowUpNotes() != null && !prescription.getFollowUpNotes().isEmpty()) {
                addFollowUpNotes(document, prescription);
            }

            // Add footer with signature
            addFooter(document, prescription);

            document.close();

            log.info("Generated PDF for prescription ID: {}", prescription.getId());
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate PDF for prescription {}: {}", prescription.getId(), e.getMessage());
            throw new RuntimeException("Failed to generate prescription PDF", e);
        }
    }

    private void addHeader(Document document, Prescription prescription) throws DocumentException {
        // Clinic/Hospital name
        Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD, new Color(0, 102, 204));
        Paragraph clinicName = new Paragraph("SynapsCare Medical Center", titleFont);
        clinicName.setAlignment(Element.ALIGN_CENTER);
        document.add(clinicName);

        // Doctor info
        Font doctorFont = new Font(Font.HELVETICA, 12, Font.NORMAL, new Color(51, 51, 51));
        String doctorInfo = String.format("Doctor ID: %d",
                prescription.getDoctorId());
        Paragraph doctorPara = new Paragraph(doctorInfo, doctorFont);
        doctorPara.setAlignment(Element.ALIGN_CENTER);
        document.add(doctorPara);

        document.add(Chunk.NEWLINE);
    }

    private void addHorizontalLine(Document document) throws DocumentException {
        LineSeparator line = new LineSeparator();
        line.setLineColor(new Color(0, 102, 204));
        line.setLineWidth(2f);
        document.add(new Chunk(line));
        document.add(Chunk.NEWLINE);
    }

    private void addPatientInfo(Document document, Prescription prescription) throws DocumentException {
        Font labelFont = new Font(Font.HELVETICA, 10, Font.BOLD, new Color(102, 102, 102));
        Font valueFont = new Font(Font.HELVETICA, 12, Font.NORMAL, Color.BLACK);

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1, 1});

        // Patient Name
        PdfPCell labelCell = new PdfPCell(new Phrase("Patient ID:", labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPaddingBottom(5);
        table.addCell(labelCell);

        String patientName = String.valueOf(prescription.getPatientId());
        PdfPCell valueCell = new PdfPCell(new Phrase(patientName, valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPaddingBottom(5);
        table.addCell(valueCell);

        // Age/Gender
        labelCell = new PdfPCell(new Phrase("", labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPaddingBottom(5);
        table.addCell(labelCell);

        valueCell = new PdfPCell(new Phrase("", valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPaddingBottom(5);
        table.addCell(valueCell);

        document.add(table);
        document.add(Chunk.NEWLINE);
    }

    private void addPrescriptionDate(Document document, Prescription prescription) throws DocumentException {
        Font dateFont = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(102, 102, 102));
        String dateStr = prescription.getCreatedDate() != null
                ? "Date: " + prescription.getCreatedDate().format(DATE_TIME_FORMATTER)
                : "Date: N/A";
        Paragraph datePara = new Paragraph(dateStr, dateFont);
        datePara.setAlignment(Element.ALIGN_RIGHT);
        document.add(datePara);
        document.add(Chunk.NEWLINE);
    }

    private void addDiagnosis(Document document, Prescription prescription) throws DocumentException {
        Font labelFont = new Font(Font.HELVETICA, 11, Font.BOLD, new Color(51, 51, 51));
        Font valueFont = new Font(Font.HELVETICA, 11, Font.NORMAL, Color.BLACK);

        Paragraph diagLabel = new Paragraph("Diagnosis:", labelFont);
        document.add(diagLabel);

        String diagnosisText = prescription.getDiagnosis();
        if (prescription.getDiagnosisCode() != null && !prescription.getDiagnosisCode().isEmpty()) {
            diagnosisText += " (" + prescription.getDiagnosisCode() + ")";
        }
        Paragraph diagValue = new Paragraph(diagnosisText, valueFont);
        diagValue.setIndentationLeft(20);
        document.add(diagValue);
        document.add(Chunk.NEWLINE);
    }

    private void addRxSymbol(Document document) throws DocumentException {
        Font rxFont = new Font(Font.HELVETICA, 28, Font.BOLD, new Color(0, 102, 204));
        Paragraph rxPara = new Paragraph("Rx", rxFont);
        document.add(rxPara);
        document.add(Chunk.NEWLINE);
    }

    private void addMedicationDetails(Document document, Prescription prescription) throws DocumentException {
        // Create medication table
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3, 2, 2, 3});

        Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
        Font cellFont = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.BLACK);

        // Header row
        Color headerBg = new Color(0, 102, 204);
        String[] headers = {"Medicine", "Dosage", "Duration", "Instructions"};
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
            cell.setBackgroundColor(headerBg);
            cell.setPadding(8);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }

        // Data row
        Color altBg = new Color(245, 245, 245);
        PdfPCell cell = new PdfPCell(new Phrase(prescription.getMedicineName(), cellFont));
        cell.setPadding(8);
        cell.setBackgroundColor(altBg);
        table.addCell(cell);

        cell = new PdfPCell(new Phrase(prescription.getDosage(), cellFont));
        cell.setPadding(8);
        cell.setBackgroundColor(altBg);
        table.addCell(cell);

        cell = new PdfPCell(new Phrase(prescription.getDuration(), cellFont));
        cell.setPadding(8);
        cell.setBackgroundColor(altBg);
        table.addCell(cell);

        cell = new PdfPCell(new Phrase(prescription.getInstructions(), cellFont));
        cell.setPadding(8);
        cell.setBackgroundColor(altBg);
        table.addCell(cell);

        document.add(table);
        document.add(Chunk.NEWLINE);
    }

    private void addFollowUpNotes(Document document, Prescription prescription) throws DocumentException {
        Font labelFont = new Font(Font.HELVETICA, 11, Font.BOLD, new Color(51, 51, 51));
        Font noteFont = new Font(Font.HELVETICA, 10, Font.ITALIC, new Color(102, 102, 102));

        Paragraph noteLabel = new Paragraph("Follow-up Notes:", labelFont);
        document.add(noteLabel);

        Paragraph noteValue = new Paragraph(prescription.getFollowUpNotes(), noteFont);
        noteValue.setIndentationLeft(20);
        document.add(noteValue);
        document.add(Chunk.NEWLINE);
    }

    private void addFooter(Document document, Prescription prescription) throws DocumentException {
        document.add(Chunk.NEWLINE);
        document.add(Chunk.NEWLINE);

        // Signature area
        PdfPTable sigTable = new PdfPTable(2);
        sigTable.setWidthPercentage(100);
        sigTable.setWidths(new float[]{1, 1});

        Font sigFont = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(102, 102, 102));

        // Left side - empty for stamp
        PdfPCell leftCell = new PdfPCell(new Phrase("", sigFont));
        leftCell.setBorder(Rectangle.NO_BORDER);
        sigTable.addCell(leftCell);

        // Right side - signature line
        String doctorName = "Doctor ID: " + prescription.getDoctorId();
        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph sigLine = new Paragraph("_________________________", sigFont);
        sigLine.setAlignment(Element.ALIGN_CENTER);
        rightCell.addElement(sigLine);

        Paragraph sigName = new Paragraph(doctorName, sigFont);
        sigName.setAlignment(Element.ALIGN_CENTER);
        rightCell.addElement(sigName);

        sigTable.addCell(rightCell);
        document.add(sigTable);

        // Disclaimer
        document.add(Chunk.NEWLINE);
        Font disclaimerFont = new Font(Font.HELVETICA, 8, Font.ITALIC, new Color(153, 153, 153));
        Paragraph disclaimer = new Paragraph(
                "This prescription is digitally generated by SynapsCare Healthcare Platform. " +
                        "Please consult your physician if you have any questions about this prescription.",
                disclaimerFont);
        disclaimer.setAlignment(Element.ALIGN_CENTER);
        document.add(disclaimer);
    }
}
