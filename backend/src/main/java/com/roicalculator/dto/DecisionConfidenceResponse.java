package com.roicalculator.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DecisionConfidenceResponse {

    private Integer confidenceScore;
    private ConfidenceLevel confidenceLevel;

    private List<String> positives;
    private List<String> risks;
    private String summary;
}
