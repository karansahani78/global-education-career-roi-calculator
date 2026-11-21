package com.roicalculator.dto.career;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareerStageDto {

    private String stage;          // Entry / Mid / Senior
    private String years;
    private BigDecimal avgSalary;
    private String roleFocus;
}
