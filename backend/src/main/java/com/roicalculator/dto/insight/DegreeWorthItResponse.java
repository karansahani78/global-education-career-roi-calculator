package com.roicalculator.dto.insight;

import com.roicalculator.dto.ConfidenceLevel;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DegreeWorthItResponse {

    // SEO
    private String pageTitle;
    private String metaDescription;
    private String canonicalUrl;

    // Verdict
    private String verdict; // Worth It / Depends / Not Worth It
    private ConfidenceLevel confidenceLevel;
    private Integer confidenceScore;

    // ROI Snapshot
    private BigDecimal expectedRoi;
    private BigDecimal conservativeRoi;
    private BigDecimal optimisticRoi;
    private BigDecimal breakEvenYears;

    // Career Outlook
    private String marketOutlook;
    private String employmentSummary;
    private BigDecimal expectedSalary;

    // SEO-friendly explanation
    private List<String> keyInsights;
    private String finalConclusion;
}
