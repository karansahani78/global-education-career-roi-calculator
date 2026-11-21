package com.roicalculator.service;

import com.roicalculator.dto.career.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class CareerIntelligenceService {

    public CareerIntelligenceResponse analyze(CareerIntelligenceRequest req) {

        BigDecimal baseSalary = req.getExpectedSalaryAfter();
        BigDecimal roi = req.getRoiPercentage();

        // -------- Market Outlook --------
        String outlook;
        if (roi.compareTo(BigDecimal.valueOf(150)) >= 0) {
            outlook = "Strong Market Signal";
        } else if (roi.compareTo(BigDecimal.valueOf(50)) >= 0) {
            outlook = "Moderate Market Signal";
        } else {
            outlook = "Higher Risk Market";
        }

        // -------- Market Risk --------
        String marketRisk = calculateMarketRisk(roi);

        // -------- Executive Insight --------
        String insight = generateExecutiveInsight(outlook, marketRisk, roi);

        return CareerIntelligenceResponse.builder()
                // Employment probability
                .employmentProbability(Map.of(
                        "3_months", BigDecimal.valueOf(0.40),
                        "6_months", BigDecimal.valueOf(0.70),
                        "12_months", BigDecimal.valueOf(0.88)
                ))

                // Salary confidence band
                .salaryBand(
                        CareerIntelligenceResponse.SalaryBand.builder()
                                .conservative(baseSalary.multiply(BigDecimal.valueOf(0.85)))
                                .expected(baseSalary)
                                .optimistic(baseSalary.multiply(BigDecimal.valueOf(1.30)))
                                .build()
                )

                // Career path (TECHNICAL by default – frontend can extend later)
                .careerPath(
                        buildCareerPath(baseSalary, "TECHNICAL")
                )

                // Market outlook + risk combined
                .marketOutlook(outlook + " • " + marketRisk)

                // Executive-level insight
                .insight(insight)

                .build();
    }

    // ===============================
    // Helper Methods (Private)
    // ===============================

    private String calculateMarketRisk(BigDecimal roi) {
        if (roi.compareTo(BigDecimal.valueOf(150)) >= 0) {
            return "Low Risk / High Confidence";
        }
        if (roi.compareTo(BigDecimal.valueOf(60)) >= 0) {
            return "Moderate Risk / Market Timing Sensitive";
        }
        return "High Risk / Outcome Depends on Execution";
    }

    private List<CareerStageDto> buildCareerPath(
            BigDecimal baseSalary,
            String track // TECHNICAL | MANAGEMENT | ENTREPRENEURIAL
    ) {
        BigDecimal multiplier;

        switch (track) {
            case "MANAGEMENT" -> multiplier = BigDecimal.valueOf(1.6);
            case "ENTREPRENEURIAL" -> multiplier = BigDecimal.valueOf(2.1);
            default -> multiplier = BigDecimal.valueOf(1.4); // TECHNICAL
        }

        return List.of(
                CareerStageDto.builder()
                        .stage("Entry Level")
                        .years("0–2")
                        .avgSalary(baseSalary)
                        .roleFocus("Skill building, domain exposure")
                        .build(),

                CareerStageDto.builder()
                        .stage("Mid Level")
                        .years("3–5")
                        .avgSalary(baseSalary.multiply(multiplier))
                        .roleFocus(
                                track.equals("MANAGEMENT")
                                        ? "Team ownership, people management"
                                        : "Specialization, deep expertise"
                        )
                        .build(),

                CareerStageDto.builder()
                        .stage("Senior Level")
                        .years("6–8")
                        .avgSalary(baseSalary.multiply(multiplier.add(BigDecimal.valueOf(0.4))))
                        .roleFocus(
                                track.equals("ENTREPRENEURIAL")
                                        ? "Business leadership, equity-driven roles"
                                        : "Leadership, strategy"
                        )
                        .build()
        );
    }

    private String generateExecutiveInsight(
            String outlook,
            String risk,
            BigDecimal roi
    ) {
        return switch (risk) {
            case "Low Risk / High Confidence" ->
                    "This career path offers strong predictability with high upside and long-term stability.";
            case "Moderate Risk / Market Timing Sensitive" ->
                    "Outcomes depend on specialization, early career choices, and market timing.";
            default ->
                    "This path carries execution risk. Success depends heavily on skill differentiation and location.";
        };
    }
}
