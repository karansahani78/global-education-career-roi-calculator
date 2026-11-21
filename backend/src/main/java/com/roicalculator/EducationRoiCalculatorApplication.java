package com.roicalculator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main Application Entry Point
 * 
 * Global Education & Career ROI Calculator
 * Production-Ready Backend for Million-Dollar SaaS
 * 
 * Features:
 * - Multi-currency ROI calculations
 * - Global country/university/major support
 * - Programmatic SEO engine
 * - Monetization-ready (AdSense, Affiliates, Leads)
 * - High-performance caching
 * - RESTful API architecture
 * 
 * @author ROI Calculator Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableCaching
@EnableJpaAuditing
@EnableAsync
@EnableScheduling
public class EducationRoiCalculatorApplication {
    public static void main(String[] args) {
        SpringApplication.run(EducationRoiCalculatorApplication.class, args);
        System.out.println("""
            
            ╔══════════════════════════════════════════════════════════╗
            ║                                                          ║
            ║        🎓 EDUCATION ROI CALCULATOR BACKEND 🚀           ║
            ║                                                          ║
            ║        Status: Running                                   ║
            ║        Port: 8080                                        ║
            ║        API: http://localhost:8080/api/v1                ║
            ║        Docs: http://localhost:8080/swagger-ui.html      ║
            ║                                                          ║
            ║        Ready for millions of users! 💰                  ║
            ║                                                          ║
            ╚══════════════════════════════════════════════════════════╝
            """);
    }
}
