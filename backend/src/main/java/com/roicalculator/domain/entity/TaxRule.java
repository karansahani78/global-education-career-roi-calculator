package com.roicalculator.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * TaxRule Entity
 * Tax brackets and rules by country
 */
@Entity
@Table(name = "tax_rules", indexes = {
    @Index(name = "idx_tax_rules_country", columnList = "country_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxRule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id", nullable = false)
    private Country country;

    @Column(name = "income_bracket_min", precision = 12, scale = 2)
    private BigDecimal incomeBracketMin;

    @Column(name = "income_bracket_max", precision = 12, scale = 2)
    private BigDecimal incomeBracketMax;

    @Column(name = "tax_rate", precision = 5, scale = 2, nullable = false)
    private BigDecimal taxRate; // Percentage

    @Column(name = "is_progressive")
    private Boolean isProgressive = true;

    @Column(nullable = false)
    private Integer year;

    @Override
    public String toString() {
        return "TaxRule{" +
                "id=" + getId() +
                ", country=" + (country != null ? country.getName() : "null") +
                ", taxRate=" + taxRate +
                ", year=" + year +
                '}';
    }
}

/**
 * LoanRule Entity
 * Education loan terms by country and loan type
 */
@Entity
@Table(name = "loan_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class LoanRule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id", nullable = false)
    private Country country;

    @Column(name = "loan_type", length = 100)
    private String loanType; // Federal, Private, Student, etc.

    @Column(name = "interest_rate_min", precision = 5, scale = 2)
    private BigDecimal interestRateMin;

    @Column(name = "interest_rate_max", precision = 5, scale = 2)
    private BigDecimal interestRateMax;

    @Column(name = "repayment_period_years")
    private Integer repaymentPeriodYears;

    @Column(name = "grace_period_months")
    private Integer gracePeriodMonths;

    @Column(name = "is_subsidized")
    private Boolean isSubsidized = false;

    @Override
    public String toString() {
        return "LoanRule{" +
                "id=" + getId() +
                ", country=" + (country != null ? country.getName() : "null") +
                ", loanType='" + loanType + '\'' +
                '}';
    }
}
