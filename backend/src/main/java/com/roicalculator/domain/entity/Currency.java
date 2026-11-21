package com.roicalculator.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Currency Entity
 * Stores currency exchange rates
 */
@Entity
@Table(name = "currencies", indexes = {
    @Index(name = "idx_currencies_code", columnList = "code")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Currency extends BaseEntity {

    @Column(length = 3, unique = true, nullable = false)
    private String code; // ISO 4217 (USD, EUR, GBP, JPY, etc.)

    @Column(length = 50, nullable = false)
    private String name; // US Dollar, Euro, British Pound, etc.

    @Column(length = 10)
    private String symbol; // $, €, £, ¥, etc.

    @Column(name = "exchange_rate_to_usd", precision = 15, scale = 6, nullable = false)
    private BigDecimal exchangeRateToUsd; // Exchange rate to USD base

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @Override
    public String toString() {
        return "Currency{" +
                "id=" + getId() +
                ", code='" + code + '\'' +
                ", name='" + name + '\'' +
                ", symbol='" + symbol + '\'' +
                '}';
    }
}
