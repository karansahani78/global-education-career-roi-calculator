package com.roicalculator.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * University DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UniversityDto {
    private Long id;
    private String name;
    private String slug;
    private CountryDto country;
    private String city;
    private String type;
    private Integer ranking;
    private BigDecimal avgTuitionAnnual;
    private String currencyCode;
}
