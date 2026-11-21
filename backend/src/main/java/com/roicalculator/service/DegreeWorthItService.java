package com.roicalculator.service;

import com.roicalculator.dto.*;
import com.roicalculator.dto.career.*;
import com.roicalculator.dto.insight.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DegreeWorthItService {

    private final RoiCalculationService roiService;
    private final RoiSimulationService simulationService;
    private final DecisionConfidenceService confidenceService;
    private final CareerIntelligenceService careerService;

    public DegreeWorthItResponse generate(
            RoiCalculationRequest baseRequest,
            String userIp,
            String userAgent
    ) {

        // ✅ ENRICH REQUEST WITH SAFE + CORRECT TYPES
        RoiCalculationRequest enriched = RoiCalculationRequest.builder()
                .majorId(baseRequest.getMajorId())
                .countryCode(baseRequest.getCountryCode())
                .currencyCode(baseRequest.getCurrencyCode())
                .degreeLevelId(
                        baseRequest.getDegreeLevelId() != null
                                ? baseRequest.getDegreeLevelId()
                                : 1L
                )
                .durationYears(
                        baseRequest.getDurationYears() != null
                                ? baseRequest.getDurationYears()
                                : BigDecimal.valueOf(4)
                )
                .expectedSalaryAfter(
                        baseRequest.getExpectedSalaryAfter() != null
                                ? baseRequest.getExpectedSalaryAfter()
                                : BigDecimal.valueOf(60000)
                )
                .tuitionAnnual(BigDecimal.valueOf(12000))
                .livingCostAnnual(BigDecimal.valueOf(8000))
                .otherCostsAnnual(BigDecimal.valueOf(2000))
                .taxRate(BigDecimal.valueOf(20))
                .inflationRate(BigDecimal.valueOf(3))
                .calculationYears(30)
                .build();

        // ✅ CORE ROI
        RoiCalculationResponse roi =
                roiService.calculateRoi(enriched, userIp, userAgent);

        // ✅ GET MAJOR NAME FROM ROI RESPONSE (NO NEW DEPENDENCIES)
        String majorName = roi.getInputSummary().getMajor();
        String countryCode = enriched.getCountryCode();

        String majorSlug = majorName
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        // ✅ DECISION CONFIDENCE
        DecisionConfidenceResponse confidence =
                confidenceService.evaluate(roi);

        // ✅ SIMULATION (NPE FIXED)
        RoiSimulationResponse simulation =
                simulationService.simulate(
                        RoiSimulationRequest.builder()
                                .baseRequest(enriched)
                                .salaryVariationPercent(10)
                                .costVariationPercent(10)
                                .build(),
                        userIp,
                        userAgent
                );

        RoiScenarioResult conservative = getScenario(simulation, ScenarioType.CONSERVATIVE);
        RoiScenarioResult expected = getScenario(simulation, ScenarioType.EXPECTED);
        RoiScenarioResult optimistic = getScenario(simulation, ScenarioType.OPTIMISTIC);

        // ✅ CAREER INTELLIGENCE
        CareerIntelligenceResponse career =
                careerService.analyze(
                        CareerIntelligenceRequest.builder()
                                .majorId(enriched.getMajorId())
                                .countryCode(countryCode)
                                .degreeLevelId(enriched.getDegreeLevelId())
                                .expectedSalaryAfter(enriched.getExpectedSalaryAfter())
                                .durationYears(enriched.getDurationYears())
                                .roiPercentage(expected.getRoiPercentage())
                                .build()
                );

        String verdict =
                confidence.getConfidenceScore() >= 75 ? "Worth It" :
                        confidence.getConfidenceScore() >= 45 ? "Depends" :
                                "Not Worth It";

        return DegreeWorthItResponse.builder()
                .pageTitle(
                        "Is " + majorName + " worth it in " + countryCode + "?"
                )
                .metaDescription(
                        "ROI, salary outcomes, and career outlook for "
                                + majorName + " in " + countryCode
                )
                .canonicalUrl(
                        "/is-" + majorSlug + "-worth-it-in-" + countryCode.toLowerCase()
                )
                .verdict(verdict)
                .confidenceLevel(confidence.getConfidenceLevel())
                .confidenceScore(confidence.getConfidenceScore())
                .expectedRoi(expected.getRoiPercentage())
                .conservativeRoi(conservative.getRoiPercentage())
                .optimisticRoi(optimistic.getRoiPercentage())
                .breakEvenYears(expected.getBreakEvenYears())
                .marketOutlook(career.getMarketOutlook())
                .employmentSummary(career.getInsight())
                .expectedSalary(enriched.getExpectedSalaryAfter())
                .keyInsights(List.of(
                        "ROI remains positive under realistic assumptions",
                        "Downside risk is limited under conservative scenarios",
                        "Upside potential improves with market conditions"
                ))
                .finalConclusion(confidence.getSummary())
                .build();
    }

    private RoiScenarioResult getScenario(
            RoiSimulationResponse simulation,
            ScenarioType type
    ) {
        return simulation.getScenarios().stream()
                .filter(s -> s.getScenario() == type)
                .findFirst()
                .orElseThrow(() ->
                        new IllegalStateException("Missing scenario: " + type)
                );
    }
}
