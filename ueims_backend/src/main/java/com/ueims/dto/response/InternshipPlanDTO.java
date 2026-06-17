package com.ueims.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.ueims.model.entity.InternshipPlan;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties({"assignment", "items", "createdAt", "updatedAt", "createdBy", "updatedBy"})
public class InternshipPlanDTO extends InternshipPlan {
    private String enterpriseName;
    private String startDate;
    private List<InternshipPlanItemDTO> tasks;
}
