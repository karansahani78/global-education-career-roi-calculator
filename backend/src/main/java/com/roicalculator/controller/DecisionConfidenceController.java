package com.roicalculator.controller;

import com.roicalculator.dto.*;
import com.roicalculator.service.DecisionConfidenceService;
import com.roicalculator.service.RoiCalculationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/decision/confidence")
@RequiredArgsConstructor
public class DecisionConfidenceController {

    private final RoiCalculationService roiCalculationService;
    private final DecisionConfidenceService confidenceService;

    @PostMapping
    public ApiResponse<DecisionConfidenceResponse> evaluate(
            @RequestBody RoiCalculationRequest request,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            @RequestHeader(value = "X-Forwarded-For", required = false) String userIp
    ) {
        RoiCalculationResponse roi =
                roiCalculationService.calculateRoi(request, userIp, userAgent);

        return ApiResponse.success(
                confidenceService.evaluate(roi)
        );
    }
}