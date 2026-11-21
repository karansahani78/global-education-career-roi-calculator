package com.roicalculator.dto.career;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareerIntelligenceResponse {

    // Employment likelihood
    private Map<String, BigDecimal> employmentProbability;

    // Salary confidence band
    private SalaryBand salaryBand;

    // Career growth
    private List<CareerStageDto> careerPath;

    // Market signal
    private String marketOutlook; // Strong / Moderate / Risky

    // Plain-English insight
    private String insight;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalaryBand {
        private BigDecimal conservative;
        private BigDecimal expected;
        private BigDecimal optimistic;
    }
}
