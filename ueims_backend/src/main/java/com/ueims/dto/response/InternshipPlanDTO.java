package com.ueims.dto.response;

import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.ueims.model.entity.InternshipPlan;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties({"enterprise", "semester", "jobPost", "items", "createdAt", "updatedAt", "createdBy", "updatedBy"})
public class InternshipPlanDTO extends InternshipPlan {
    private UUID enterpriseId;
    private String enterpriseName;
    private UUID semesterId;
    private String semesterCode;
    private UUID jobPostId;
    private String jobPostTitle;
    private List<InternshipPlanItemDTO> tasks;
}