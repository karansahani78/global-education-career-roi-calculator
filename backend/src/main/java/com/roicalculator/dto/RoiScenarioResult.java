package com.roicalculator.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoiScenarioResult {

    private ScenarioType scenario;
    private BigDecimal roiPercentage;
    private BigDecimal netRoi;
    private BigDecimal breakEvenYears;
    private Integer confidenceScore; // 0–100
    private String insight;
}
