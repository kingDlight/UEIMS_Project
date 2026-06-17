package com.ueims.dto.response;

import com.ueims.model.entity.EnterpriseEvaluation;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class EnterpriseEvaluationDTO extends EnterpriseEvaluation {
    private java.util.UUID assignmentId;
}
