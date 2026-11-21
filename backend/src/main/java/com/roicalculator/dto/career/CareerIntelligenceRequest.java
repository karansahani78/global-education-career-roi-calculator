package com.roicalculator.dto.career;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareerIntelligenceRequest {

    private Long majorId;
    private String countryCode;
    private Long degreeLevelId;

    // from ROI calculation
    private BigDecimal expectedSalaryAfter;
    private BigDecimal durationYears;
    private BigDecimal roiPercentage;
}
