package com.roicalculator.controller;

import com.roicalculator.dto.ApiResponse;
import com.roicalculator.dto.ComparisonRequest;
import com.roicalculator.dto.ComparisonResponse;
import com.roicalculator.service.ComparisonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/compare")
@RequiredArgsConstructor
@Tag(name = "ROI Comparison", description = "Compare two education ROI calculations")
public class ComparisonController {

    private final ComparisonService comparisonService;

    @PostMapping
    @Operation(
            summary = "Compare Two Education Options",
            description = "Compare ROI results side-by-side for two education choices"
    )
    public ResponseEntity<ApiResponse<ComparisonResponse>> compare(
            @Valid @RequestBody ComparisonRequest request) {

        log.info("Comparison request received. Type: {}", request.getComparisonType());

        ComparisonResponse response = comparisonService.compare(request);

        return ResponseEntity.ok(
                ApiResponse.success("Comparison completed successfully", response)
        );
    }
}
