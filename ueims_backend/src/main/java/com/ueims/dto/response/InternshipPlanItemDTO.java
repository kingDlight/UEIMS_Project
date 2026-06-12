package com.ueims.dto.response;

import java.time.LocalDate;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode
@JsonIgnoreProperties({"plan", "createdAt", "updatedAt", "createdBy", "updatedBy"})
public class InternshipPlanItemDTO {
    private UUID planItemId;
    private Integer weekNumber;
    private String taskDescription;
    private LocalDate targetDate;
    private String status;
    private Integer orderIndex;
}
