package com.roicalculator.controller;

import com.roicalculator.dto.ApiResponse;
import com.roicalculator.dto.CountryDto;
import com.roicalculator.dto.MajorDto;
import com.roicalculator.dto.UniversityDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Data Controller
 * APIs for fetching reference data (countries, majors, universities, etc.)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/data")
@RequiredArgsConstructor
@Tag(name = "Reference Data", description = "APIs for countries, majors, universities, and other reference data")
public class DataController {

    private final com.roicalculator.repository.CountryRepository countryRepository;
    private final com.roicalculator.repository.MajorRepository majorRepository;
    private final com.roicalculator.repository.UniversityRepository universityRepository;
    private final com.roicalculator.repository.DegreeLevelRepository degreeLevelRepository;
    private final com.roicalculator.repository.CurrencyRepository currencyRepository;

    /**
     * Get all countries
     */
    @GetMapping("/countries")
    @Operation(summary = "Get All Countries", description = "Retrieve list of all supported countries")
    public ResponseEntity<ApiResponse<List<CountryDto>>> getAllCountries() {
        try {
            var countries = countryRepository.findByIsActiveTrue();
            var dtos = countries.stream()
                    .map(this::convertToDto)
                    .toList();
            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (Exception e) {
            log.error("Error fetching countries", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching countries"));
        }
    }

    /**
     * Get country by code
     */
    @GetMapping("/countries/{code}")
    @Operation(summary = "Get Country by Code", description = "Retrieve country details by ISO code")
    public ResponseEntity<ApiResponse<CountryDto>> getCountryByCode(@PathVariable String code) {
        try {
            var country = countryRepository.findByCode(code)
                    .orElseThrow(() -> new IllegalArgumentException("Country not found"));
            return ResponseEntity.ok(ApiResponse.success(convertToDto(country)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching country", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching country"));
        }
    }

    /**
     * Get all majors
     */
    @GetMapping("/majors")
    @Operation(summary = "Get All Majors", description = "Retrieve list of all academic majors/fields")
    public ResponseEntity<ApiResponse<List<MajorDto>>> getAllMajors(
            @RequestParam(required = false) String category) {
        try {
            var majors = category != null
                    ? majorRepository.findByCategory(category)
                    : majorRepository.findByIsActiveTrue();

            var dtos = majors.stream()
                    .map(this::convertToDto)
                    .toList();

            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (Exception e) {
            log.error("Error fetching majors", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching majors"));
        }
    }

    /**
     * Get major by slug
     */
    @GetMapping("/majors/{slug}")
    @Operation(summary = "Get Major by Slug", description = "Retrieve major details by slug")
    public ResponseEntity<ApiResponse<MajorDto>> getMajorBySlug(@PathVariable String slug) {
        try {
            var major = majorRepository.findBySlug(slug)
                    .orElseThrow(() -> new IllegalArgumentException("Major not found"));
            return ResponseEntity.ok(ApiResponse.success(convertToDto(major)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching major", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching major"));
        }
    }

    /**
     * Get all degree levels
     */
    @GetMapping("/degree-levels")
    @Operation(summary = "Get All Degree Levels", description = "Retrieve list of all degree levels")
    public ResponseEntity<ApiResponse<List<?>>> getAllDegreeLevels() {
        try {
            var levels = degreeLevelRepository.findAllByOrderByEducationLevelAsc();
            return ResponseEntity.ok(ApiResponse.success(levels));
        } catch (Exception e) {
            log.error("Error fetching degree levels", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching degree levels"));
        }
    }

    /**
     * Get universities
     */
    @GetMapping("/universities")
    @Operation(summary = "Get Universities", description = "Retrieve universities by country")
    public ResponseEntity<ApiResponse<List<UniversityDto>>> getUniversities(
            @RequestParam(required = false) Long countryId) {
        try {
            var universities = countryId != null
                    ? universityRepository.findByCountryIdAndIsActiveTrue(countryId)
                    : universityRepository.findAll();

            var dtos = universities.stream()
                    .map(this::convertToDto)
                    .toList();

            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (Exception e) {
            log.error("Error fetching universities", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching universities"));
        }
    }

    /**
     * Get all currencies
     */
    @GetMapping("/currencies")
    @Operation(summary = "Get All Currencies", description = "Retrieve list of supported currencies")
    public ResponseEntity<ApiResponse<List<?>>> getAllCurrencies() {
        try {
            var currencies = currencyRepository.findAllByOrderByNameAsc();
            return ResponseEntity.ok(ApiResponse.success(currencies));
        } catch (Exception e) {
            log.error("Error fetching currencies", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching currencies"));
        }
    }

    /* =======================
       DTO CONVERTERS
       ======================= */

    private CountryDto convertToDto(com.roicalculator.domain.entity.Country country) {
        return CountryDto.builder()
                .id(country.getId())
                .code(country.getCode())
                .name(country.getName())
                .region(country.getRegion())
                .currencyCode(country.getCurrencyCode())
                .avgTaxRate(country.getAvgTaxRate())
                .costOfLivingIndex(country.getCostOfLivingIndex())
                .build();
    }

    private MajorDto convertToDto(com.roicalculator.domain.entity.Major major) {
        return MajorDto.builder()
                .id(major.getId())
                .name(major.getName())
                .slug(major.getSlug())
                .category(major.getCategory())
                .description(major.getDescription())
                .avgGlobalSalary(major.getAvgGlobalSalary())
                .jobGrowthRate(major.getJobGrowthRate())
                .demandScore(major.getDemandScore())
                .build();
    }

    private UniversityDto convertToDto(com.roicalculator.domain.entity.University university) {
        return UniversityDto.builder()
                .id(university.getId())
                .name(university.getName())
                .slug(university.getSlug())
                .city(university.getCity())
                .type(university.getType())
                .ranking(university.getRanking())
                .avgTuitionAnnual(university.getAvgTuitionAnnual())
                .currencyCode(university.getCurrencyCode())
                .build();
    }
}
