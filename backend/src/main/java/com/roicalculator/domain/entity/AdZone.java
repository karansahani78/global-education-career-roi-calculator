package com.roicalculator.domain.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * AdZone Entity
 * Ad placement zones for AdSense and custom ads
 */
@Entity
@Table(name = "ad_zones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdZone extends BaseEntity {

    @Column(name = "zone_name", length = 100, unique = true, nullable = false)
    private String zoneName; // header, sidebar, below_calculator, footer, in_content

    @Column(name = "zone_type", length = 50)
    private String zoneType; // adsense, custom, affiliate, sponsored

    @Column(name = "page_type", length = 50)
    private String pageType; // Which pages this appears on: all, home, calculator, seo_page

    @Column(name = "priority")
    private Integer priority = 1;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "ad_unit_id", length = 200)
    private String adUnitId; // AdSense ad unit ID or custom identifier

    @Override
    public String toString() {
        return "AdZone{" +
                "id=" + getId() +
                ", zoneName='" + zoneName + '\'' +
                ", zoneType='" + zoneType + '\'' +
                '}';
    }
}

