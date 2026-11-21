package com.roicalculator.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.*;

/**
 * Lead Entity
 * Lead capture for email marketing and partnerships
 */
@Entity
@Table(name = "leads", indexes = {
        @Index(name = "idx_leads_email", columnList = "email"),
        @Index(name = "idx_leads_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class Lead extends BaseEntity {

    @Column(length = 255, nullable = false)
    private String email;

    @Column(length = 200)
    private String name;

    @Column(name = "country_code", length = 3)
    private String countryCode;

    @Column(name = "interested_in", length = 500)
    private String interestedIn; // Major, country, degree they're interested in

    @Column(length = 100)
    private String source; // Which page/form they submitted from

    @Column(columnDefinition = "jsonb")
    private String metadata; // JSON with calculation params, preferences, etc.

    @Column(length = 50)
    private String status = "new"; // new, contacted, converted, unsubscribed

    @Column(name = "phone", length = 20)
    private String phone;

    @Override
    public String toString() {
        return "Lead{" +
                "id=" + getId() +
                ", email='" + email + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}
