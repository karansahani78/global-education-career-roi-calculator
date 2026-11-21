package com.roicalculator.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * RoiCalculation Entity
 * Stores user ROI calculation requests and results
 * Critical for analytics, SEO, and user history
 */
@Entity
@Table(name = "roi_calculations", indexes = {
    @Index(name = "idx_roi_calc_uuid", columnList = "uuid"),
    @Index(name = "idx_roi_calc_country", columnList = "country_id"),
    @Index(name = "idx_roi_calc_major", columnList = "major_id"),
    @Index(name = "idx_roi_calc_date", columnList = "calculated_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoiCalculation extends BaseEntity {

    @Column(length = 36, unique = true, nullable = false)
    private String uuid; // Shareable link identifier

    // ===== Education Parameters =====
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id")
    private Country country;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id")
    private University university;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "major_id")
    private Major major;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "degree_level_id")
    private DegreeLevel degreeLevel;

    // ===== Cost Inputs =====
    @Column(name = "tuition_annual", precision = 12, scale = 2)
    private BigDecimal tuitionAnnual;

    @Column(name = "living_cost_annual", precision = 12, scale = 2)
    private BigDecimal livingCostAnnual;

    @Column(name = "other_costs_annual", precision = 12, scale = 2)
    private BigDecimal otherCostsAnnual;

    @Column(name = "duration_years", precision = 3, scale = 1)
    private BigDecimal durationYears;

    // ===== Loan Inputs =====
    @Column(name = "loan_amount", precision = 12, scale = 2)
    private BigDecimal loanAmount;

    @Column(name = "interest_rate", precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(name = "loan_term_years")
    private Integer loanTermYears;

    // ===== Income Inputs =====
    @Column(name = "part_time_income_annual", precision = 12, scale = 2)
    private BigDecimal partTimeIncomeAnnual;

    @Column(name = "expected_salary_after", precision = 12, scale = 2)
    private BigDecimal expectedSalaryAfter;

    @Column(name = "current_salary", precision = 12, scale = 2)
    private BigDecimal currentSalary; // Opportunity cost

    // ===== Calculation Parameters =====
    @Column(name = "inflation_rate", precision = 5, scale = 2)
    private BigDecimal inflationRate;

    @Column(name = "tax_rate", precision = 5, scale = 2)
    private BigDecimal taxRate;

    @Column(name = "calculation_years")
    private Integer calculationYears; // Years to project ROI

    @Column(name = "currency_code", length = 3, nullable = false)
    private String currencyCode;

    // ===== Calculated Results (stored for performance) =====
    @Column(name = "total_education_cost", precision = 12, scale = 2)
    private BigDecimal totalEducationCost;

    @Column(name = "total_opportunity_cost", precision = 12, scale = 2)
    private BigDecimal totalOpportunityCost;

    @Column(name = "total_investment", precision = 12, scale = 2)
    private BigDecimal totalInvestment;

    @Column(name = "break_even_years", precision = 5, scale = 2)
    private BigDecimal breakEvenYears;

    @Column(name = "net_roi", precision = 12, scale = 2)
    private BigDecimal netRoi;

    @Column(name = "roi_percentage", precision = 8, scale = 2)
    private BigDecimal roiPercentage;

    @Column(name = "lifetime_earnings", precision = 15, scale = 2)
    private BigDecimal lifetimeEarnings;

    // ===== Metadata =====
    @Column(name = "user_ip", length = 45)
    private String userIp;

    @Column(name = "user_country_code", length = 3)
    private String userCountryCode;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt;

    @Column(name = "is_comparison")
    private Boolean isComparison = false;

    @PrePersist
    protected void onCreate() {
        super.onCreate();
        if (uuid == null) {
            uuid = UUID.randomUUID().toString();
        }
        if (calculatedAt == null) {
            calculatedAt = LocalDateTime.now();
        }
    }

    @Override
    public String toString() {
        return "RoiCalculation{" +
                "id=" + getId() +
                ", uuid='" + uuid + '\'' +
                ", country=" + (country != null ? country.getName() : "null") +
                ", major=" + (major != null ? major.getName() : "null") +
                ", netRoi=" + netRoi +
                ", roiPercentage=" + roiPercentage +
                '}';
    }
    @Column(name = "annualized_return", precision = 8, scale = 2)
    private BigDecimal annualizedReturn;

}
