package com.ueims.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.ueims.model.entity.FinalReport;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties({"assignment", "createdAt", "updatedAt", "createdBy", "updatedBy"})
public class FinalReportDTO extends FinalReport {
    private String fileName;
}
