package com.ueims.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.ueims.model.entity.EnterpriseEvaluation;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties({
    "assignment",
    "enterprise",
    "semester",
    "jobPost",
    "items",
    "createdAt",
    "updatedAt",
    "createdBy",
    "updatedBy"
})
public class EnterpriseEvaluationDTO extends EnterpriseEvaluation {
    private java.util.UUID assignmentId;
}
