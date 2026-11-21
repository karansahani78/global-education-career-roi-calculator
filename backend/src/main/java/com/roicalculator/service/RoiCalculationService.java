package com.roicalculator.service;

import com.roicalculator.domain.entity.*;
import com.roicalculator.dto.*;
import com.roicalculator.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoiCalculationService {
    @Value("${app.public-base-url}")
    private String publicBaseUrl;

    private final RoiCalculationRepository roiCalculationRepository;
    private final CountryRepository countryRepository;
    private final UniversityRepository universityRepository;
    private final MajorRepository majorRepository;
    private final DegreeLevelRepository degreeLevelRepository;
    private final CurrencyRepository currencyRepository;

    private static final MathContext MC = new MathContext(10, RoundingMode.HALF_UP);
    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    /* =========================================================
       ENTRY POINT
       ========================================================= */

    @Transactional
    public RoiCalculationResponse calculateRoi(
            RoiCalculationRequest r,
            String userIp,
            String userAgent
    ) {

        Country country = countryRepository.findByCode(r.getCountryCode())
                .orElseThrow(() -> new IllegalArgumentException("Country not found"));

        Major major = majorRepository.findById(r.getMajorId())
                .orElseThrow(() -> new IllegalArgumentException("Major not found"));

        DegreeLevel degreeLevel = degreeLevelRepository.findById(r.getDegreeLevelId())
                .orElseThrow(() -> new IllegalArgumentException("Degree level not found"));

        University university = r.getUniversityId() != null
                ? universityRepository.findById(r.getUniversityId()).orElse(null)
                : null;

        Currency currency = currencyRepository.findByCode(r.getCurrencyCode())
                .orElseThrow(() -> new IllegalArgumentException("Currency not found"));

        RoiCalculationResponse.CostBreakdown costs = calculateCosts(r);
        RoiCalculationResponse.IncomeProjection income = calculateIncome(r);
        RoiCalculationResponse.RoiResults roi = calculateRoiMetrics(costs, income, r);
        List<RoiCalculationResponse.YearlyBreakdown> yearly =
                calculateYearlyBreakdown(r);

        RoiCalculation saved = roiCalculationRepository.save(
                buildRoiCalculation(r, country, university, major, degreeLevel,
                        costs, roi, userIp, userAgent)
        );

        return RoiCalculationResponse.builder()
                .uuid(saved.getUuid())
                .shareableUrl(publicBaseUrl + "/share/" + saved.getUuid())
                .inputSummary(buildInputSummary(country, university, major, degreeLevel, r, currency))
                .costBreakdown(costs)
                .incomeProjection(income)
                .roiResults(roi)
                .yearlyBreakdown(yearly)
                .recommendations(generateRecommendations(roi))
                .build();
    }

    /* =========================================================
       COSTS
       ========================================================= */

    private RoiCalculationResponse.CostBreakdown calculateCosts(RoiCalculationRequest r) {

        BigDecimal tuition =
                r.getTuitionAnnual().multiply(r.getDurationYears());

        BigDecimal living =
                nz(r.getLivingCostAnnual()).multiply(r.getDurationYears());

        BigDecimal other =
                nz(r.getOtherCostsAnnual()).multiply(r.getDurationYears());

        BigDecimal educationCost =
                tuition.add(living).add(other);

        BigDecimal opportunityCost =
                nz(r.getCurrentSalary()).multiply(r.getDurationYears());

        BigDecimal loanInterest = BigDecimal.ZERO;
        if (nz(r.getLoanAmount()).compareTo(BigDecimal.ZERO) > 0) {
            loanInterest = calculateCompoundInterest(
                    r.getLoanAmount(),
                    r.getInterestRate(),
                    r.getLoanTermYears()
            );
        }

        BigDecimal totalInvestment =
                educationCost.add(opportunityCost).add(loanInterest);

        return RoiCalculationResponse.CostBreakdown.builder()
                .tuitionTotal(round(tuition))
                .livingCostTotal(round(living))
                .otherCostsTotal(round(other))
                .loanInterest(round(loanInterest))
                .totalEducationCost(round(educationCost))
                .opportunityCost(round(opportunityCost))
                .totalInvestment(round(totalInvestment))
                .build();
    }

    /* =========================================================
       INCOME (NO DOUBLE COUNTING)
       ========================================================= */

    private RoiCalculationResponse.IncomeProjection calculateIncome(RoiCalculationRequest r) {

        BigDecimal partTimeIncome =
                nz(r.getPartTimeIncomeAnnual()).multiply(r.getDurationYears());

        BigDecimal withDegree =
                calculateLifetimeEarnings(
                        r.getExpectedSalaryAfter(),
                        r.getCalculationYears(),
                        r.getDurationYears().intValue(),
                        r.getInflationRate(),
                        r.getTaxRate()
                );

        BigDecimal withoutDegree =
                nz(r.getCurrentSalary()).compareTo(BigDecimal.ZERO) > 0
                        ? calculateLifetimeEarnings(
                        r.getCurrentSalary(),
                        r.getCalculationYears() + r.getDurationYears().intValue(),
                        0,
                        r.getInflationRate(),
                        r.getTaxRate()
                )
                        : BigDecimal.ZERO;

        BigDecimal additional =
                withDegree.subtract(withoutDegree).add(partTimeIncome);

        return RoiCalculationResponse.IncomeProjection.builder()
                .partTimeIncomeTotal(round(partTimeIncome))
                .lifetimeEarnings(round(withDegree))
                .lifetimeEarningsWithoutDegree(round(withoutDegree))
                .additionalLifetimeEarnings(round(additional))
                .build();
    }

    /* =========================================================
       ROI METRICS
       ========================================================= */

    private RoiCalculationResponse.RoiResults calculateRoiMetrics(
            RoiCalculationResponse.CostBreakdown costs,
            RoiCalculationResponse.IncomeProjection income,
            RoiCalculationRequest r
    ) {

        BigDecimal netRoi =
                income.getAdditionalLifetimeEarnings()
                        .subtract(costs.getTotalInvestment());

        BigDecimal roiPct = BigDecimal.ZERO;
        if (costs.getTotalInvestment().compareTo(BigDecimal.ZERO) > 0) {
            roiPct = netRoi
                    .divide(costs.getTotalInvestment(), MC)
                    .multiply(HUNDRED);
        }

        BigDecimal breakEven = calculateBreakEvenPoint(r);

        BigDecimal annualized = BigDecimal.ZERO;
        if (netRoi.compareTo(BigDecimal.ZERO) > 0 && r.getCalculationYears() > 0) {
            double ratio =
                    income.getAdditionalLifetimeEarnings()
                            .divide(costs.getTotalInvestment(), MC)
                            .add(BigDecimal.ONE)
                            .doubleValue();

            double cagr =
                    Math.pow(ratio, 1.0 / r.getCalculationYears()) - 1;

            annualized =
                    BigDecimal.valueOf(cagr).multiply(HUNDRED);
        }

        return RoiCalculationResponse.RoiResults.builder()
                .netRoi(round(netRoi))
                .roiPercentage(round(roiPct))
                .breakEvenYears(round(breakEven))
                .annualizedReturn(round(annualized))
                .verdict(determineVerdict(roiPct))
                .build();
    }

    /* =========================================================
       YEARLY BREAKDOWN (SOURCE OF TRUTH)
       ========================================================= */

    private List<RoiCalculationResponse.YearlyBreakdown>
    calculateYearlyBreakdown(RoiCalculationRequest r) {

        List<RoiCalculationResponse.YearlyBreakdown> list = new ArrayList<>();

        BigDecimal cumulativeInvestment = BigDecimal.ZERO;
        BigDecimal cumulativeEarnings = BigDecimal.ZERO;
        BigDecimal salary = r.getExpectedSalaryAfter();
        int studyYears = r.getDurationYears().intValue();

        // Study years
        for (int y = 1; y <= studyYears; y++) {

            BigDecimal yearInvestment =
                    r.getTuitionAnnual()
                            .add(nz(r.getLivingCostAnnual()))
                            .add(nz(r.getOtherCostsAnnual()))
                            .add(nz(r.getCurrentSalary()));

            cumulativeInvestment =
                    cumulativeInvestment.add(yearInvestment);

            cumulativeEarnings =
                    cumulativeEarnings.add(nz(r.getPartTimeIncomeAnnual()));

            list.add(RoiCalculationResponse.YearlyBreakdown.builder()
                    .year(y)
                    .cumulativeInvestment(round(cumulativeInvestment))
                    .cumulativeEarnings(round(cumulativeEarnings))
                    .netPosition(round(cumulativeEarnings.subtract(cumulativeInvestment)))
                    .build());
        }

        // Post-graduation
        for (int y = 1; y <= r.getCalculationYears(); y++) {

            salary = salary.multiply(
                    BigDecimal.ONE.add(
                            r.getInflationRate().divide(HUNDRED, MC)
                    )
            );

            BigDecimal netSalary =
                    salary.multiply(
                            BigDecimal.ONE.subtract(
                                    r.getTaxRate().divide(HUNDRED, MC)
                            )
                    );

            cumulativeEarnings =
                    cumulativeEarnings.add(netSalary);

            list.add(RoiCalculationResponse.YearlyBreakdown.builder()
                    .year(studyYears + y)
                    .cumulativeInvestment(round(cumulativeInvestment))
                    .cumulativeEarnings(round(cumulativeEarnings))
                    .netPosition(round(cumulativeEarnings.subtract(cumulativeInvestment)))
                    .build());
        }

        return list;
    }

    /* =========================================================
       BREAK-EVEN (INCREMENTAL MODEL)
       ========================================================= */

    private BigDecimal calculateBreakEvenPoint(RoiCalculationRequest r) {

        BigDecimal cumulativeDiff = BigDecimal.ZERO;
        BigDecimal withDegree = r.getExpectedSalaryAfter();
        BigDecimal withoutDegree = nz(r.getCurrentSalary());
        int studyYears = r.getDurationYears().intValue();

        BigDecimal studyCost =
                r.getTuitionAnnual()
                        .add(nz(r.getLivingCostAnnual()))
                        .add(nz(r.getOtherCostsAnnual()))
                        .multiply(r.getDurationYears());

        cumulativeDiff = cumulativeDiff.subtract(studyCost);

        for (int y = 1; y <= r.getCalculationYears(); y++) {

            withDegree = withDegree.multiply(
                    BigDecimal.ONE.add(
                            r.getInflationRate().divide(HUNDRED, MC)
                    )
            );

            withoutDegree = withoutDegree.multiply(
                    BigDecimal.ONE.add(
                            r.getInflationRate().divide(HUNDRED, MC)
                    )
            );

            BigDecimal netWith =
                    withDegree.multiply(
                            BigDecimal.ONE.subtract(
                                    r.getTaxRate().divide(HUNDRED, MC)
                            )
                    );

            BigDecimal netWithout =
                    withoutDegree.multiply(
                            BigDecimal.ONE.subtract(
                                    r.getTaxRate().divide(HUNDRED, MC)
                            )
                    );

            cumulativeDiff =
                    cumulativeDiff.add(netWith.subtract(netWithout));

            if (cumulativeDiff.compareTo(BigDecimal.ZERO) >= 0) {
                return BigDecimal.valueOf(studyYears + y);
            }
        }

        return BigDecimal.valueOf(studyYears + r.getCalculationYears());
    }

    /* =========================================================
       HELPERS
       ========================================================= */

    private BigDecimal calculateLifetimeEarnings(
            BigDecimal salary,
            int years,
            int delayYears,
            BigDecimal inflation,
            BigDecimal tax
    ) {
        BigDecimal total = BigDecimal.ZERO;
        BigDecimal current = salary;

        for (int y = 0; y < years; y++) {
            if (y < delayYears) continue;

            current = current.multiply(
                    BigDecimal.ONE.add(inflation.divide(HUNDRED, MC))
            );

            total = total.add(
                    current.multiply(
                            BigDecimal.ONE.subtract(
                                    tax.divide(HUNDRED, MC)
                            )
                    )
            );
        }
        return total;
    }

    private BigDecimal calculateCompoundInterest(
            BigDecimal principal,
            BigDecimal rate,
            Integer years
    ) {
        BigDecimal r = rate.divide(HUNDRED, MC);
        return principal
                .multiply(BigDecimal.ONE.add(r).pow(years, MC))
                .subtract(principal);
    }

    private BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private BigDecimal round(BigDecimal v) {
        return v.setScale(2, RoundingMode.HALF_UP);
    }

    private String determineVerdict(BigDecimal roi) {
        if (roi.compareTo(BigDecimal.valueOf(200)) >= 0) return "Excellent";
        if (roi.compareTo(BigDecimal.valueOf(100)) >= 0) return "Good";
        if (roi.compareTo(BigDecimal.ZERO) >= 0) return "Fair";
        return "Poor";
    }

    private List<String> generateRecommendations(
            RoiCalculationResponse.RoiResults r
    ) {
        List<String> list = new ArrayList<>();
        if (r.getRoiPercentage().compareTo(BigDecimal.valueOf(150)) >= 0)
            list.add("Strong long-term financial return.");
        if (r.getBreakEvenYears().compareTo(BigDecimal.valueOf(10)) > 0)
            list.add("Long break-even period — plan long-term.");
        return list;
    }

    private RoiCalculation buildRoiCalculation(
            RoiCalculationRequest r,
            Country country,
            University university,
            Major major,
            DegreeLevel degreeLevel,
            RoiCalculationResponse.CostBreakdown costs,
            RoiCalculationResponse.RoiResults roi,
            String userIp,
            String userAgent
    ) {
        return RoiCalculation.builder()
                .uuid(UUID.randomUUID().toString())
                .country(country)
                .university(university)
                .major(major)
                .degreeLevel(degreeLevel)
                .tuitionAnnual(r.getTuitionAnnual())
                .livingCostAnnual(r.getLivingCostAnnual())
                .otherCostsAnnual(r.getOtherCostsAnnual())
                .durationYears(r.getDurationYears())
                .loanAmount(r.getLoanAmount())
                .interestRate(r.getInterestRate())
                .loanTermYears(r.getLoanTermYears())
                .partTimeIncomeAnnual(r.getPartTimeIncomeAnnual())
                .expectedSalaryAfter(r.getExpectedSalaryAfter())
                .currentSalary(r.getCurrentSalary())
                .inflationRate(r.getInflationRate())
                .taxRate(r.getTaxRate())
                .calculationYears(r.getCalculationYears())
                .currencyCode(r.getCurrencyCode())
                .totalEducationCost(costs.getTotalEducationCost())
                .totalOpportunityCost(costs.getOpportunityCost())
                .totalInvestment(costs.getTotalInvestment())
                .breakEvenYears(roi.getBreakEvenYears())
                .netRoi(roi.getNetRoi())
                .roiPercentage(roi.getRoiPercentage())
                .annualizedReturn(roi.getAnnualizedReturn())
                .userIp(userIp)
                .userAgent(userAgent)
                .calculatedAt(LocalDateTime.now())
                .build();
    }

    private RoiCalculationResponse.InputSummary buildInputSummary(
            Country country,
            University university,
            Major major,
            DegreeLevel degreeLevel,
            RoiCalculationRequest r,
            Currency currency
    ) {
        return RoiCalculationResponse.InputSummary.builder()
                .country(country.getName())
                .university(university != null ? university.getName() : "Not specified")
                .major(major.getName())
                .degreeLevel(degreeLevel.getName())
                .durationYears(r.getDurationYears())
                .currencyCode(currency.getCode())
                .currencySymbol(currency.getSymbol())
                .build();
    }
    /* =========================================================
   FETCH BY UUID (CONTROLLER DEPENDENCY)
   ========================================================= */

    @Transactional(readOnly = true)
    public RoiCalculation getCalculationByUuid(String uuid) {
        return roiCalculationRepository.findByUuid(uuid)
                .orElseThrow(() ->
                        new IllegalArgumentException("Calculation not found"));
    }
    /* =========================================================
   REBUILD RESPONSE FROM STORED ENTITY (SHARE LINK)
   ========================================================= */
    @Transactional(readOnly = true)
    public RoiCalculationResponse buildResponseFromEntity(RoiCalculation c) {

        // Rebuild Cost Breakdown
        RoiCalculationResponse.CostBreakdown costs =
                RoiCalculationResponse.CostBreakdown.builder()
                        .tuitionTotal(c.getTuitionAnnual()
                                .multiply(c.getDurationYears()))
                        .livingCostTotal(nz(c.getLivingCostAnnual())
                                .multiply(c.getDurationYears()))
                        .otherCostsTotal(nz(c.getOtherCostsAnnual())
                                .multiply(c.getDurationYears()))
                        .loanInterest(BigDecimal.ZERO) // already included in totalInvestment
                        .totalEducationCost(c.getTotalEducationCost())
                        .opportunityCost(c.getTotalOpportunityCost())
                        .totalInvestment(c.getTotalInvestment())
                        .build();

        // Rebuild Income Projection
        RoiCalculationResponse.IncomeProjection income =
                RoiCalculationResponse.IncomeProjection.builder()
                        .lifetimeEarnings(BigDecimal.ZERO) // optional: can be recalculated later
                        .lifetimeEarningsWithoutDegree(BigDecimal.ZERO)
                        .additionalLifetimeEarnings(
                                c.getNetRoi().add(c.getTotalInvestment())
                        )
                        .build();

        // Rebuild ROI Results
        RoiCalculationResponse.RoiResults roi =
                RoiCalculationResponse.RoiResults.builder()
                        .netRoi(c.getNetRoi())
                        .roiPercentage(c.getRoiPercentage())
                        .breakEvenYears(c.getBreakEvenYears())
                        .annualizedReturn(c.getAnnualizedReturn())
                        .verdict(determineVerdict(c.getRoiPercentage()))
                        .build();

        // Rebuild Input Summary
        RoiCalculationResponse.InputSummary inputSummary =
                RoiCalculationResponse.InputSummary.builder()
                        .country(c.getCountry().getName())
                        .university(
                                c.getUniversity() != null
                                        ? c.getUniversity().getName()
                                        : "Not specified"
                        )
                        .major(c.getMajor().getName())
                        .degreeLevel(c.getDegreeLevel().getName())
                        .durationYears(c.getDurationYears())
                        .currencyCode(c.getCurrencyCode())
                        .currencySymbol(
                                currencyRepository.findByCode(c.getCurrencyCode())
                                        .map(Currency::getSymbol)
                                        .orElse("")
                        )
                        .build();

        // Yearly breakdown is SOURCE-OF-TRUTH → recalc safely
        List<RoiCalculationResponse.YearlyBreakdown> yearly =
                calculateYearlyBreakdown(
                        RoiCalculationRequest.builder()
                                .tuitionAnnual(c.getTuitionAnnual())
                                .livingCostAnnual(c.getLivingCostAnnual())
                                .otherCostsAnnual(c.getOtherCostsAnnual())
                                .currentSalary(c.getCurrentSalary())
                                .expectedSalaryAfter(c.getExpectedSalaryAfter())
                                .partTimeIncomeAnnual(c.getPartTimeIncomeAnnual())
                                .durationYears(c.getDurationYears())
                                .inflationRate(c.getInflationRate())
                                .taxRate(c.getTaxRate())
                                .calculationYears(c.getCalculationYears())
                                .build()
                );

        return RoiCalculationResponse.builder()
                .uuid(c.getUuid())
                .shareableUrl(publicBaseUrl + "/share/" + c.getUuid())
                .inputSummary(inputSummary)
                .costBreakdown(costs)
                .incomeProjection(income)
                .roiResults(roi)
                .yearlyBreakdown(yearly)
                .recommendations(generateRecommendations(roi))
                .build();
    }

}
