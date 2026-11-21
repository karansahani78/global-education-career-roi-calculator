package com.roicalculator.service;

import com.roicalculator.dto.*;
import com.roicalculator.dto.ConfidenceLevel;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class DecisionConfidenceService {

    public DecisionConfidenceResponse evaluate(RoiCalculationResponse roi) {

        BigDecimal roiPct = roi.getRoiResults().getRoiPercentage();
        BigDecimal breakEven = roi.getRoiResults().getBreakEvenYears();

        int score = 50; // neutral baseline
        List<String> positives = new ArrayList<>();
        List<String> risks = new ArrayList<>();

        // ROI impact
        if (roiPct.compareTo(BigDecimal.valueOf(150)) >= 0) {
            score += 25;
            positives.add("Very high return on investment");
        } else if (roiPct.compareTo(BigDecimal.valueOf(50)) >= 0) {
            score += 10;
            positives.add("Positive long-term ROI");
        } else {
            score -= 15;
            risks.add("Low or marginal ROI");
        }

        // Break-even impact
        if (breakEven.compareTo(BigDecimal.valueOf(5)) <= 0) {
            score += 15;
            positives.add("Quick break-even period");
        } else if (breakEven.compareTo(BigDecimal.valueOf(10)) > 0) {
            score -= 10;
            risks.add("Long time required to recover investment");
        }

        // Verdict alignment
        String verdict = roi.getRoiResults().getVerdict();
        if ("Excellent".equalsIgnoreCase(verdict)) {
            score += 10;
        } else if ("Poor".equalsIgnoreCase(verdict)) {
            score -= 20;
            risks.add("Overall ROI outlook is weak");
        }

        // Clamp score
        score = Math.max(0, Math.min(100, score));

        // ✅ ENUM-BASED confidence level (single source of truth)
        ConfidenceLevel level = mapScoreToLevel(score);

        String summary =
                switch (level) {
                    case VeryHigh ->
                            "This is an exceptional education decision with strong upside and predictability.";
                    case High ->
                            "This is a strong education decision with high confidence and solid returns.";
                    case Moderate ->
                            "This decision is viable but depends on execution and market conditions.";
                    case Low ->
                            "This path carries elevated financial risk and requires careful planning.";
                    case VeryLow ->
                            "This decision has poor financial fundamentals and should be reconsidered.";
                };

        return DecisionConfidenceResponse.builder()
                .confidenceScore(score)
                .confidenceLevel(level) // ✅ enum, not string
                .positives(positives)
                .risks(risks)
                .summary(summary)
                .build();
    }

    // 🔒 Centralized, testable, frontend-aligned mapping
    private ConfidenceLevel mapScoreToLevel(int score) {
        if (score >= 85) return ConfidenceLevel.VeryHigh;
        if (score >= 70) return ConfidenceLevel.High;
        if (score >= 45) return ConfidenceLevel.Moderate;
        if (score >= 25) return ConfidenceLevel.Low;
        return ConfidenceLevel.VeryLow;
    }
}
