package com.roicalculator.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.roicalculator.domain.entity.Faq;
import com.roicalculator.dto.ApiResponse;
import com.roicalculator.dto.FaqDto;
import com.roicalculator.dto.RoiCalculationRequest;
import com.roicalculator.dto.SeoPageDto;
import com.roicalculator.repository.FaqRepository;
import com.roicalculator.repository.SeoPageRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * SEO Controller
 * APIs for programmatic SEO pages
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/seo")
@RequiredArgsConstructor
@Tag(name = "SEO", description = "Programmatic SEO page APIs")
public class SeoController {

    private final SeoPageRepository seoPageRepository;
    private final FaqRepository faqRepository;
    private final ObjectMapper objectMapper;

    /**
     * Get SEO page data by slug
     * GET /api/v1/seo/pages/{slug}
     */
    @GetMapping("/pages/{slug}")
    @Operation(summary = "Get SEO Page", description = "Retrieve SEO page data by slug for programmatic SEO")
    public ResponseEntity<ApiResponse<SeoPageDto>> getSeoPage(@PathVariable String slug) {
        try {
            var seoPage = seoPageRepository.findBySlug(slug)
                    .orElseThrow(() -> new IllegalArgumentException("SEO page not found"));

            List<FaqDto> faqs = faqRepository
                    .findBySeoPageIdOrderByDisplayOrderAsc(seoPage.getId())
                    .stream()
                    .map(this::toFaqDto)
                    .toList();

            SeoPageDto dto = SeoPageDto.builder()
                    .slug(seoPage.getSlug())
                    .pageType(seoPage.getPageType())
                    .metaTitle(seoPage.getMetaTitle())
                    .metaDescription(seoPage.getMetaDescription())
                    .h1Title(seoPage.getH1Title())
                    .canonicalUrl(seoPage.getCanonicalUrl())
                    .defaultParams(parseDefaultParams(seoPage.getDefaultParams()))
                    .faqs(faqs.isEmpty() ? null : faqs)
                    .build();

            return ResponseEntity.ok(ApiResponse.success(dto));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching SEO page", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching SEO page"));
        }
    }

    /**
     * Get all published SEO pages (for sitemap generation)
     * GET /api/v1/seo/pages
     */
    @GetMapping("/pages")
    @Operation(summary = "Get All SEO Pages", description = "Retrieve all published SEO pages")
    public ResponseEntity<ApiResponse<List<SeoPageDto>>> getAllSeoPages() {
        try {
            var pages = seoPageRepository.findByIsPublishedTrue();

            var dtos = pages.stream()
                    .map(page -> SeoPageDto.builder()
                            .slug(page.getSlug())
                            .pageType(page.getPageType())
                            .metaTitle(page.getMetaTitle())
                            .build())
                    .toList();

            return ResponseEntity.ok(ApiResponse.success(dtos));

        } catch (Exception e) {
            log.error("Error fetching SEO pages", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching SEO pages"));
        }
    }

    private FaqDto toFaqDto(Faq faq) {
        return FaqDto.builder()
                .id(faq.getId())
                .question(faq.getQuestion())
                .answer(faq.getAnswer())
                .category(faq.getCategory())
                .build();
    }

    /**
     * Parse the seeded JSON prefill payload into the calculator request shape.
     * Invalid or empty payloads simply yield no prefill rather than failing the page.
     */
    private RoiCalculationRequest parseDefaultParams(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, RoiCalculationRequest.class);
        } catch (Exception e) {
            log.warn("Could not parse defaultParams for SEO page: {}", e.getMessage());
            return null;
        }
    }
}
