package com.ueims.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Data;

@Data
public class EnterpriseDTO {
    private UUID enterpriseId;
    private String companyName;
    private String taxCode;
    private String website;
    private String industry;
    private String description;
    private String address;
    private String logoUrl;
    private String contactPerson;
    private String contactPhone;
    private String contactEmail;
    private String status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
