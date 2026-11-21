package com.roicalculator.service;

import com.roicalculator.dto.ComparisonRequest;
import com.roicalculator.dto.ComparisonResponse;
import com.roicalculator.dto.RoiCalculationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComparisonService {

    private final RoiCalculationService roiCalculationService;

    public ComparisonResponse compare(ComparisonRequest request) {

        // Calculate both options using existing ROI engine
        RoiCalculationResponse optionA =
                roiCalculationService.calculateRoi(request.getOptionA(), null, "comparison");

        RoiCalculationResponse optionB =
                roiCalculationService.calculateRoi(request.getOptionB(), null, "comparison");

        // Extract values safely
        BigDecimal roiA = optionA.getRoiResults().getNetRoi();
        BigDecimal roiB = optionB.getRoiResults().getNetRoi();

        BigDecimal costA = optionA.getCostBreakdown().getTotalInvestment();
        BigDecimal costB = optionB.getCostBreakdown().getTotalInvestment();

        BigDecimal breakEvenA = optionA.getRoiResults().getBreakEvenYears();
        BigDecimal breakEvenB = optionB.getRoiResults().getBreakEvenYears();

        // Determine winner
        String winner;
        if (roiA.compareTo(roiB) > 0) {
            winner = "A";
        } else if (roiA.compareTo(roiB) < 0) {
            winner = "B";
        } else {
            winner = "TIE";
        }

        // Key differences
        List<String> keyDifferences = new ArrayList<>();
        keyDifferences.add("ROI Difference: " + roiA.subtract(roiB));
        keyDifferences.add("Cost Difference: " + costA.subtract(costB));
        keyDifferences.add("Break-even Difference: " + breakEvenA.subtract(breakEvenB));

        ComparisonResponse.ComparisonSummary summary =
                ComparisonResponse.ComparisonSummary.builder()
                        .winner(winner)
                        .roiDifference(roiA.subtract(roiB))
                        .costDifference(costA.subtract(costB))
                        .breakEvenDifference(breakEvenA.subtract(breakEvenB))
                        .keyDifferences(keyDifferences)
                        .build();

        return ComparisonResponse.builder()
                .uuid(UUID.randomUUID().toString())
                .optionA(optionA)
                .optionB(optionB)
                .summary(summary)
                .build();
    }
}
