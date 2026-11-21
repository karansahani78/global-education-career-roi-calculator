package com.roicalculator.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoiSimulationResponse {

    private String uuid;
    private List<RoiScenarioResult> scenarios;
    private String summaryInsight;
}
