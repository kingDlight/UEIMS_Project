package com.ueims.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileUpdateRequest {
    private String major;
    private String skills;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private String bio;
}
