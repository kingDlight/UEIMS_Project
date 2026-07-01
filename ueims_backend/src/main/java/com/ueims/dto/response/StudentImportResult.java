package com.ueims.dto.response;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentImportResult {
    /** Total data rows parsed from the file (excludes header). */
    private int totalRows;

    /** Newly created {@code users} + {@code student_profiles} entries. */
    private int created;

    /** Existing students whose info was overwritten in place. */
    private int updated;

    /** Rows that were skipped because the (studentCode, semester) pair already had an eligible record. */
    private int skipped;

    /** Rows that failed validation/persistence, with the original Excel row number. */
    @Builder.Default
    private List<RowError> errors = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RowError {
        private int row;
        private String studentCode;
        private String reason;
    }
}
