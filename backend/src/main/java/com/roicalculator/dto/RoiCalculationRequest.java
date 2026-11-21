package com.roicalculator.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * ROI Calculation Request DTO
 * Input from user for ROI calculation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RoiCalculationRequest {

    // Education Parameters
    @NotNull(message = "Country code is required")
    private String countryCode;

    private Long universityId;
    
    @NotNull(message = "Major is required")
    private Long majorId;
    
    @NotNull(message = "Degree level is required")
    private Long degreeLevelId;

    // Cost Inputs
    @NotNull(message = "Annual tuition is required")
    @Positive(message = "Tuition must be positive")
    private BigDecimal tuitionAnnual;

    @Positive(message = "Living cost must be positive")
    private BigDecimal livingCostAnnual;

    @PositiveOrZero(message = "Other costs cannot be negative")
    private BigDecimal otherCostsAnnual = BigDecimal.ZERO;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be positive")
    private BigDecimal durationYears;

    // Loan Inputs (optional)
    @PositiveOrZero(message = "Loan amount cannot be negative")
    private BigDecimal loanAmount = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Interest rate must be between 0 and 100")
    @DecimalMax(value = "100.0", message = "Interest rate must be between 0 and 100")
    private BigDecimal interestRate = BigDecimal.ZERO;

    @PositiveOrZero(message = "Loan term cannot be negative")
    private Integer loanTermYears = 10;

    // Income Inputs
    @PositiveOrZero(message = "Part-time income cannot be negative")
    private BigDecimal partTimeIncomeAnnual = BigDecimal.ZERO;

    @NotNull(message = "Expected salary after graduation is required")
    @Positive(message = "Expected salary must be positive")
    private BigDecimal expectedSalaryAfter;

    @PositiveOrZero(message = "Current salary cannot be negative")
    private BigDecimal currentSalary = BigDecimal.ZERO;

    // Calculation Parameters
    @DecimalMin(value = "0.0", message = "Inflation rate must be between 0 and 100")
    @DecimalMax(value = "100.0", message = "Inflation rate must be between 0 and 100")
    private BigDecimal inflationRate = BigDecimal.valueOf(3.0);

    @DecimalMin(value = "0.0", message = "Tax rate must be between 0 and 100")
    @DecimalMax(value = "100.0", message = "Tax rate must be between 0 and 100")
    private BigDecimal taxRate;

    @Min(value = 1, message = "Calculation years must be at least 1")
    @Max(value = 50, message = "Calculation years cannot exceed 50")
    private Integer calculationYears = 10;

    @NotNull(message = "Currency code is required")
    @Pattern(regexp = "[A-Z]{3}", message = "Invalid currency code")
    private String currencyCode;

    // Metadata
    private String userCountryCode;
}

