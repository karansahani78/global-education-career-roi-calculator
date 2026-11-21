package com.roicalculator.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import com.roicalculator.domain.entity.RoiCalculation;
import com.roicalculator.repository.RoiCalculationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class RoiReportService {

    private final RoiCalculationRepository roiCalculationRepository;

    public byte[] generateRoiPdf(String uuid) {

        RoiCalculation r = roiCalculationRepository.findByUuid(uuid)
                .orElseThrow(() -> new IllegalArgumentException("ROI calculation not found"));

        ByteArrayOutputStream output = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 48, 48);

        try {
            PdfWriter.getInstance(document, output);
            document.open();

            Font title = new Font(Font.HELVETICA, 18, Font.BOLD);
            Font section = new Font(Font.HELVETICA, 14, Font.BOLD);
            Font body = new Font(Font.HELVETICA, 11);

            DateTimeFormatter formatter =
                    DateTimeFormatter.ofPattern("dd MMM yyyy");

            /* =======================
               HEADER
               ======================= */
            document.add(new Paragraph("Education ROI Analysis Report", title));
            document.add(new Paragraph(
                    "Generated on: " + r.getCalculatedAt().format(formatter), body));
            document.add(Chunk.NEWLINE);

            /* =======================
               EDUCATION DETAILS
               ======================= */
            document.add(new Paragraph("Education Details", section));
            document.add(new Paragraph("Country: " + r.getCountry().getName(), body));
            document.add(new Paragraph("Major: " + r.getMajor().getName(), body));
            document.add(new Paragraph("Degree Level: " + r.getDegreeLevel().getName(), body));
            document.add(Chunk.NEWLINE);

            /* =======================
               COST SUMMARY
               ======================= */
            document.add(new Paragraph("Investment Summary", section));
            document.add(new Paragraph("Annual Tuition: " + safe(r.getTuitionAnnual()), body));
            document.add(new Paragraph("Annual Living Cost: " + safe(r.getLivingCostAnnual()), body));
            document.add(new Paragraph("Other Annual Costs: " + safe(r.getOtherCostsAnnual()), body));
            document.add(new Paragraph("Total Education Cost: " + safe(r.getTotalEducationCost()), body));
            document.add(new Paragraph("Opportunity Cost: " + safe(r.getTotalOpportunityCost()), body));
            document.add(new Paragraph("Total Investment: " + safe(r.getTotalInvestment()), body));
            document.add(Chunk.NEWLINE);

            /* =======================
               ROI RESULTS
               ======================= */
            document.add(new Paragraph("ROI Results", section));
            document.add(new Paragraph("Net ROI: " + safe(r.getNetRoi()), body));
            document.add(new Paragraph("ROI Percentage: " + r.getRoiPercentage() + "%", body));
            document.add(new Paragraph("Break-even Years: " + r.getBreakEvenYears(), body));
            document.add(new Paragraph("Verdict: " + determineVerdict(r.getRoiPercentage()), body));
            document.add(Chunk.NEWLINE);

            /* =======================
               FOOTER
               ======================= */
            document.add(new Paragraph(
                    "This report is generated automatically based on user inputs and market data.",
                    body
            ));
            document.add(Chunk.NEWLINE);
            document.add(new Paragraph(
                    "© Education ROI Calculator",
                    new Font(Font.HELVETICA, 9, Font.ITALIC)
            ));

            document.close();
            return output.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate ROI PDF", e);
        }
    }

    /* =======================
       HELPERS
       ======================= */

    private String safe(Object value) {
        return value == null ? "-" : value.toString();
    }

    private String determineVerdict(BigDecimal roiPercentage) {
        if (roiPercentage.compareTo(BigDecimal.valueOf(200)) >= 0) {
            return "Excellent";
        } else if (roiPercentage.compareTo(BigDecimal.valueOf(100)) >= 0) {
            return "Good";
        } else if (roiPercentage.compareTo(BigDecimal.ZERO) >= 0) {
            return "Fair";
        } else {
            return "Poor";
        }
    }
}
