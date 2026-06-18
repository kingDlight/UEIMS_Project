package com.ueims.dto.response;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.ueims.model.entity.Interview;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties({ "application", "decidedBy", "createdAt", "updatedAt", "createdBy", "updatedBy" })
public class InterviewDTO extends Interview {
    private String enterpriseName;
    private String jobTitle;
    private UUID applicationId;
}
