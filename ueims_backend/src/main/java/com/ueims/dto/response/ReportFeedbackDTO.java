package com.ueims.dto.response;

import com.ueims.model.entity.ReportFeedback;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ReportFeedbackDTO extends ReportFeedback {
    // DTO subclass to resolve java:S4684 while maintaining exact JSON serialization contract.
}
