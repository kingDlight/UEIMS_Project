package com.ueims.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.Data;

@Data
public class EnterpriseRequest {
    // UC-36 Normal Flow step 4: validate input data formatting
    // UC-36 Exception 36.0.E1: "Enterprise Name, Address, or Contact Person" are mandatory
    @NotBlank(message = "FIELD_REQUIRED")
    @Size(max = 255, message = "ENTERPRISE_NAME_INVALID_LENGTH")
    private String companyName;

    @Size(max = 50, message = "TAX_CODE_INVALID_LENGTH")
    private String taxCode;

    @Size(max = 255, message = "WEBSITE_INVALID_LENGTH")
    @Pattern(regexp = "^$|^(https?://)?[\\w.-]+\\.[a-zA-Z]{2,}.*$", message = "Website must be a valid URL")
    private String website;

    @Size(max = 100, message = "INDUSTRY_INVALID_LENGTH")
    private String industry;

    @Size(max = 5000, message = "DESCRIPTION_INVALID_LENGTH")
    private String description;

    @NotBlank(message = "FIELD_REQUIRED")
    @Size(max = 500, message = "ADDRESS_INVALID_LENGTH")
    private String address;

    @Size(max = 500, message = "LOGO_URL_INVALID_LENGTH")
    private String logoUrl;

    @NotBlank(message = "FIELD_REQUIRED")
    @Size(max = 255, message = "CONTACT_PERSON_INVALID_LENGTH")
    private String contactPerson;

    @NotBlank(message = "FIELD_REQUIRED")
    @Size(max = 20, message = "CONTACT_PHONE_INVALID_LENGTH")
    @Pattern(regexp = "^[+0-9\\-\\s()]{6,20}$", message = "Contact phone has invalid format")
    private String contactPhone;

    @NotBlank(message = "FIELD_REQUIRED")
    @Email(message = "Contact email must be a valid email address")
    @Size(max = 255, message = "CONTACT_EMAIL_INVALID_LENGTH")
    private String contactEmail;

    private String status;

    private String rejectionReason;
}
