package com.roicalculator.controller;

import com.roicalculator.dto.*;
import com.roicalculator.service.RoiSimulationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/roi/simulate")
@RequiredArgsConstructor
public class RoiSimulationController {

    private final RoiSimulationService simulationService;

    @PostMapping
    public ResponseEntity<ApiResponse<RoiSimulationResponse>> simulate(
            @Valid @RequestBody RoiSimulationRequest request,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            @RequestHeader(value = "X-Forwarded-For", required = false) String userIp
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "ROI simulation completed",
                        simulationService.simulate(request, userIp, userAgent)
                )
        );
    }
}
