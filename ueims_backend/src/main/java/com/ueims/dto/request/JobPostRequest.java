package com.ueims.dto.request;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

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

    // FIX 049: positionsCount is the runtime open-positions count. Zero is a
    // valid value (post fully booked — the trigger-derived invariant guarantees
    // it cannot drop below the number of students who already hold a slot).
    @NotNull(message = "Positions count is mandatory")
    @PositiveOrZero(message = "Positions count must be zero or positive")
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
