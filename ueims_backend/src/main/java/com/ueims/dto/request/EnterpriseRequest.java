package com.ueims.dto.request;

import lombok.Data;

@Data
public class EnterpriseRequest {
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
}
