package com.roicalculator.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * SEO Page DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SeoPageDto {
    private String slug;
    private String pageType;
    private String metaTitle;
    private String metaDescription;
    private String h1Title;
    private String canonicalUrl;
    private RoiCalculationRequest defaultParams;
    private List<FaqDto> faqs;
}
