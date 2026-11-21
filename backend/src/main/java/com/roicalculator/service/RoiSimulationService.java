package com.roicalculator.service;

import com.roicalculator.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoiSimulationService {

    private final RoiCalculationService roiCalculationService;

    public RoiSimulationResponse simulate(
            RoiSimulationRequest request,
            String userIp,
            String userAgent
    ) {
        RoiCalculationRequest base = request.getBaseRequest();

        RoiCalculationResponse expected =
                roiCalculationService.calculateRoi(base, userIp, userAgent);

        RoiCalculationResponse conservative =
                roiCalculationService.calculateRoi(
                        adjustedRequest(base, -request.getSalaryVariationPercent(), request.getCostVariationPercent()),
                        userIp, userAgent
                );

        RoiCalculationResponse optimistic =
                roiCalculationService.calculateRoi(
                        adjustedRequest(base, request.getSalaryVariationPercent(), -request.getCostVariationPercent()),
                        userIp, userAgent
                );

        return RoiSimulationResponse.builder()
                .uuid(UUID.randomUUID().toString())
                .scenarios(List.of(
                        buildScenario(ScenarioType.CONSERVATIVE, conservative, "Lower salary growth and higher costs"),
                        buildScenario(ScenarioType.EXPECTED, expected, "Most realistic outcome based on current data"),
                        buildScenario(ScenarioType.OPTIMISTIC, optimistic, "Strong job market and controlled costs")
                ))
                .summaryInsight(generateSummary(conservative, expected, optimistic))
                .build();
    }

    private RoiCalculationRequest adjustedRequest(
            RoiCalculationRequest r,
            int salaryPct,
            int costPct
    ) {
        return RoiCalculationRequest.builder()
                .countryCode(r.getCountryCode())
                .universityId(r.getUniversityId())
                .majorId(r.getMajorId())
                .degreeLevelId(r.getDegreeLevelId())
                .durationYears(r.getDurationYears())
                .currencyCode(r.getCurrencyCode())

                .tuitionAnnual(scale(r.getTuitionAnnual(), costPct))
                .livingCostAnnual(scale(r.getLivingCostAnnual(), costPct))
                .otherCostsAnnual(scale(r.getOtherCostsAnnual(), costPct))

                .expectedSalaryAfter(scale(r.getExpectedSalaryAfter(), salaryPct))
                .currentSalary(r.getCurrentSalary())

                .inflationRate(r.getInflationRate())
                .taxRate(r.getTaxRate())
                .calculationYears(r.getCalculationYears())
                .build();
    }

    private RoiScenarioResult buildScenario(
            ScenarioType type,
            RoiCalculationResponse r,
            String insight
    ) {
        return RoiScenarioResult.builder()
                .scenario(type)
                .roiPercentage(r.getRoiResults().getRoiPercentage())
                .netRoi(r.getRoiResults().getNetRoi())
                .breakEvenYears(r.getRoiResults().getBreakEvenYears())
                .confidenceScore(confidence(type))
                .insight(insight)
                .build();
    }

    private Integer confidence(ScenarioType type) {
        return switch (type) {
            case CONSERVATIVE -> 65;
            case EXPECTED -> 80;
            case OPTIMISTIC -> 90;
        };
    }

    private String generateSummary(
            RoiCalculationResponse c,
            RoiCalculationResponse e,
            RoiCalculationResponse o
    ) {
        if (e.getRoiResults().getRoiPercentage().compareTo(BigDecimal.valueOf(100)) > 0) {
            return "This education path shows strong ROI potential with manageable downside risk.";
        }
        return "ROI is sensitive to salary growth and cost control. Consider alternatives or optimization.";
    }

    private BigDecimal scale(BigDecimal value, int percent) {
        if (value == null) return BigDecimal.ZERO;
        return value.multiply(
                BigDecimal.ONE.add(BigDecimal.valueOf(percent).divide(BigDecimal.valueOf(100)))
        );
    }
}
