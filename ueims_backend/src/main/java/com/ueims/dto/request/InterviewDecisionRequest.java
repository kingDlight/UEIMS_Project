package com.ueims.dto.request;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewDecisionRequest {
    private String result; // PASS or FAIL
    private UUID decidedBy;
}
