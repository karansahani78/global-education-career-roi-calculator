package com.roicalculator.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoiSimulationRequest {

    @NotNull
    private RoiCalculationRequest baseRequest;

    // % adjustments
    private Integer salaryVariationPercent = 10;   // ±10%
    private Integer costVariationPercent = 10;     // ±10%
}
