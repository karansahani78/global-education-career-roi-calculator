package com.roicalculator.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Comparison Response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ComparisonResponse {
    private String uuid;
    private RoiCalculationResponse optionA;
    private RoiCalculationResponse optionB;
    private ComparisonSummary summary;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComparisonSummary {
        private String winner; // A, B, or TIE
        private BigDecimal roiDifference;
        private BigDecimal costDifference;
        private BigDecimal breakEvenDifference;
        private List<String> keyDifferences;
    }
}
