package com.roicalculator.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * ROI Calculation Response DTO
 * Detailed calculation results
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RoiCalculationResponse {

    private String uuid; // Shareable link ID
    private String shareableUrl;

    // Input Summary
    private InputSummary inputSummary;

    // Cost Breakdown
    private CostBreakdown costBreakdown;

    // Income Projection
    private IncomeProjection incomeProjection;

    // ROI Results
    private RoiResults roiResults;

    // Year-by-Year Breakdown
    private List<YearlyBreakdown> yearlyBreakdown;

    // Recommendations
    private List<String> recommendations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InputSummary {
        private String country;
        private String university;
        private String major;
        private String degreeLevel;
        private BigDecimal durationYears;
        private String currencyCode;
        private String currencySymbol;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CostBreakdown {
        private BigDecimal tuitionTotal;
        private BigDecimal livingCostTotal;
        private BigDecimal otherCostsTotal;
        private BigDecimal loanInterest;
        private BigDecimal totalEducationCost;
        private BigDecimal opportunityCost;
        private BigDecimal totalInvestment;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IncomeProjection {
        private BigDecimal partTimeIncomeTotal;
        private BigDecimal lifetimeEarnings;
        private BigDecimal lifetimeEarningsWithoutDegree;
        private BigDecimal additionalLifetimeEarnings;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoiResults {
        private BigDecimal netRoi;
        private BigDecimal roiPercentage;
        private BigDecimal breakEvenYears;
        private BigDecimal annualizedReturn;
        private String verdict; // Excellent, Good, Fair, Poor
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class YearlyBreakdown {
        private Integer year;
        private BigDecimal cumulativeInvestment;
        private BigDecimal cumulativeEarnings;
        private BigDecimal netPosition;
    }
}
