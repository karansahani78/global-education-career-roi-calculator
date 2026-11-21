package com.roicalculator.controller;

import com.roicalculator.dto.ApiResponse;
import com.roicalculator.dto.career.*;
import com.roicalculator.service.CareerIntelligenceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/career/intelligence")
@RequiredArgsConstructor
@Tag(name = "Career Intelligence", description = "Post-ROI career outcome analysis")
public class CareerIntelligenceController {

    private final CareerIntelligenceService service;

    @PostMapping
    public ApiResponse<CareerIntelligenceResponse> analyze(
            @RequestBody CareerIntelligenceRequest request
    ) {
        return ApiResponse.success(service.analyze(request));
    }
}
