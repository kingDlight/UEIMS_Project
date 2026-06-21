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
    @NotBlank(message = "Enterprise name is required")
    @Size(max = 255, message = "Enterprise name must not exceed 255 characters")
    private String companyName;

    @Size(max = 50, message = "Tax code must not exceed 50 characters")
    private String taxCode;

    @Size(max = 255, message = "Website URL must not exceed 255 characters")
    @Pattern(regexp = "^$|^(https?://)?[\\w.-]+\\.[a-zA-Z]{2,}.*$", message = "Website must be a valid URL")
    private String website;

    @Size(max = 100, message = "Industry must not exceed 100 characters")
    private String industry;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @NotBlank(message = "Address is required")
    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    @Size(max = 500, message = "Logo URL must not exceed 500 characters")
    private String logoUrl;

    @NotBlank(message = "Contact person is required")
    @Size(max = 255, message = "Contact person must not exceed 255 characters")
    private String contactPerson;

    @NotBlank(message = "Contact phone is required")
    @Size(max = 20, message = "Contact phone must not exceed 20 characters")
    @Pattern(regexp = "^[+0-9\\-\\s()]{6,20}$", message = "Contact phone has invalid format")
    private String contactPhone;

    @NotBlank(message = "Contact email is required")
    @Email(message = "Contact email must be a valid email address")
    @Size(max = 255, message = "Contact email must not exceed 255 characters")
    private String contactEmail;

    private String status;

    private String rejectionReason;
}
