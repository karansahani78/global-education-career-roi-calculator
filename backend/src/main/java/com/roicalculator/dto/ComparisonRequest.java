package com.roicalculator.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Comparison Request DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComparisonRequest {
    @NotNull(message = "First option is required")
    private RoiCalculationRequest optionA;

    @NotNull(message = "Second option is required")
    private RoiCalculationRequest optionB;

    private String comparisonType; // country, degree, university, major
}
