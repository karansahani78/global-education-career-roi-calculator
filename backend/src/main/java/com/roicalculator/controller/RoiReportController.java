package com.roicalculator.controller;

import com.roicalculator.service.RoiReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class RoiReportController {

    private final RoiReportService roiReportService;

    /**
     * Download ROI analysis PDF
     */
    @GetMapping("/roi/pdf/{uuid}")
    public ResponseEntity<byte[]> downloadRoiPdf(@PathVariable String uuid) {

        byte[] pdf = roiReportService.generateRoiPdf(uuid);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=roi-report-" + uuid + ".pdf"
                )
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
