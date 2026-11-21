package com.roicalculator.controller;

import com.roicalculator.domain.entity.RoiCalculation;
import com.roicalculator.dto.*;
import com.roicalculator.service.RoiCalculationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * ROI Calculation Controller
 * Main API endpoint for ROI calculations
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/roi")
@RequiredArgsConstructor
@Tag(name = "ROI Calculator", description = "Education and Career ROI Calculation APIs")
public class RoiCalculatorController {

    private final RoiCalculationService roiCalculationService;

    /**
     * Calculate ROI
     * POST /api/v1/roi/calculate
     */
    @PostMapping("/calculate")
    @Operation(summary = "Calculate Education ROI", description = "Calculate return on investment for education based on provided parameters")
    public ResponseEntity<ApiResponse<RoiCalculationResponse>> calculateRoi(
            @Valid @RequestBody RoiCalculationRequest request,
            HttpServletRequest httpRequest) {

        log.info("ROI calculation request received for country: {}, major: {}",
                request.getCountryCode(), request.getMajorId());

        try {
            String userIp = getClientIp(httpRequest);
            String userAgent = httpRequest.getHeader("User-Agent");

            RoiCalculationResponse response =
                    roiCalculationService.calculateRoi(request, userIp, userAgent);

            return ResponseEntity.ok(ApiResponse.success("ROI calculated successfully", response));

        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error calculating ROI", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while calculating ROI"));
        }
    }

    /**
     * Get calculation by UUID (shareable link)
     * GET /api/v1/roi/share/{uuid}
     */
    @GetMapping("/share/{uuid}")
    public ResponseEntity<ApiResponse<RoiCalculationResponse>> getCalculationByUuid(
            @PathVariable String uuid) {

        log.info("Fetching calculation by UUID: {}", uuid);

        try {
            RoiCalculation calculation =
                    roiCalculationService.getCalculationByUuid(uuid);

            RoiCalculationResponse response =
                    roiCalculationService.buildResponseFromEntity(calculation);

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Calculation not found"));
        } catch (Exception e) {
            log.error("Error fetching calculation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while fetching calculation"));
        }
    }

    /**
     * Quick ROI estimate (lighter calculation)
     * POST /api/v1/roi/quick-estimate
     */
    @PostMapping("/quick-estimate")
    @Operation(summary = "Quick ROI Estimate", description = "Get a quick ROI estimate with minimal inputs")
    public ResponseEntity<ApiResponse<Object>> quickEstimate(
            @RequestBody @Valid RoiCalculationRequest request) {

        log.info("Quick estimate request for major: {}", request.getMajorId());

        try {
            return ResponseEntity.ok(ApiResponse.success("Quick estimate completed", null));
        } catch (Exception e) {
            log.error("Error in quick estimate", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred"));
        }
    }

    /**
     * Helper to extract client IP address
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
