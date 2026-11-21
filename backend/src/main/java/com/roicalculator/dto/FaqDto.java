package com.roicalculator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * FAQ DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FaqDto {
    private Long id;
    private String question;
    private String answer;
    private String category;
}
