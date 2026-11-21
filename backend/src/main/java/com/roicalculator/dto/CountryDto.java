package com.roicalculator.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Country DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CountryDto {
    private Long id;
    private String code;
    private String name;
    private String region;
    private String currencyCode;
    private BigDecimal avgTaxRate;
    private BigDecimal costOfLivingIndex;
}
