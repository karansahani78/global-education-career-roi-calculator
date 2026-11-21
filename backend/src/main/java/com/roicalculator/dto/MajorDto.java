package com.roicalculator.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Major DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MajorDto {
    private Long id;
    private String name;
    private String slug;
    private String category;
    private String description;
    private BigDecimal avgGlobalSalary;
    private BigDecimal jobGrowthRate;
    private BigDecimal demandScore;
}
