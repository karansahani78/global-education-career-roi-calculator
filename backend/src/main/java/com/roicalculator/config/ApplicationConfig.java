package com.roicalculator.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class ApplicationConfig {

    @Bean
    public CorsFilter corsFilter() {

        CorsConfiguration config = new CorsConfiguration();

        /*
         * ===============================
         * CORS CORE SETTINGS
         * ===============================
         */
        config.setAllowCredentials(true);

        /*
         * ===============================
         * ALLOWED ORIGIN PATTERNS
         * ===============================
         * ✔ localhost
         * ✔ LAN IPs (192.168.x.x, 10.x.x.x)
         * ✔ Vercel (prod + preview)
         * ✔ Lovable
         * ✔ ngrok
         * ✔ Future SaaS domains
         */
        config.setAllowedOriginPatterns(List.of(
                // Localhost
                "http://localhost:*",

                // LAN / Local Network
                "http://192.168.*.*:*",
                "http://10.*.*.*:*",

                // Vercel
                "https://*.vercel.app",
                "https://vercel.app",

                // Lovable
                "https://*.lovable.app",
                "https://*.lovableproject.com",

                // ngrok
                "https://*.ngrok-free.app"
        ));

        /*
         * ===============================
         * HTTP METHODS
         * ===============================
         */
        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS"
        ));

        /*
         * ===============================
         * HEADERS
         * ===============================
         */
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("*"));

        /*
         * ===============================
         * PREFLIGHT CACHE
         * ===============================
         */
        config.setMaxAge(3600L);

        /*
         * ===============================
         * APPLY TO ALL ENDPOINTS
         * ===============================
         */
        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
