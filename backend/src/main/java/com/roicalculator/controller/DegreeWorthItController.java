package com.roicalculator.controller;

import com.roicalculator.dto.*;
import com.roicalculator.dto.insight.DegreeWorthItResponse;
import com.roicalculator.service.DegreeWorthItService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/insights")
@RequiredArgsConstructor
public class DegreeWorthItController {

    private final DegreeWorthItService service;

    @GetMapping("/degree-worth-it")
    public ApiResponse<DegreeWorthItResponse> getInsight(
            @RequestParam Long majorId,
            @RequestParam String countryCode,
            @RequestParam String currencyCode,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            @RequestHeader(value = "X-Forwarded-For", required = false) String userIp
    ) {

        // Minimal, clean request
        RoiCalculationRequest req = RoiCalculationRequest.builder()
                .majorId(majorId)
                .countryCode(countryCode)
                .currencyCode(currencyCode)
                .degreeLevelId(1L) // default (safe)
                // durationYears intentionally omitted → service decides default
                .build();

        return ApiResponse.success(
                service.generate(req, userIp, userAgent)
        );
    }
}