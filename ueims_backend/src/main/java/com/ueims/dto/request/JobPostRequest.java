package com.ueims.dto.request;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class JobPostRequest {
    @NotNull(message = "Semester is mandatory")
    private SemesterRef semester;

    @NotBlank(message = "Title is mandatory")
    private String title;

    @NotBlank(message = "Description is mandatory")
    private String description;

    private String requirements;
    private String benefits;
    private String requiredSkills;

    @NotNull(message = "Positions count is mandatory")
    private Integer positionsCount;

    @NotNull(message = "Application deadline is mandatory")
    @Future(message = "Application deadline must be in the future")
    private LocalDate applicationDeadline;

    private String status;

    @Data
    public static class SemesterRef {
        private UUID semesterId;
    }
}
