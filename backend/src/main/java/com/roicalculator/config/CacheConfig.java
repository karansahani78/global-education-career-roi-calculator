package com.roicalculator.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cache Configuration
 */
@Configuration
class CacheConfig {

    @Bean
    public org.springframework.cache.CacheManager cacheManager() {
        return new org.springframework.cache.concurrent.ConcurrentMapCacheManager(
                "countries",
                "majors",
                "universities",
                "currencies",
                "seo-pages"
        );
    }
}
