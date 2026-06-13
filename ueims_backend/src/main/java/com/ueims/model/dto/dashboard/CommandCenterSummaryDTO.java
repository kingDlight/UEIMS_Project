package com.ueims.model.dto.dashboard;

import java.util.List;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CommandCenterSummaryDTO {
    private List<IncidentSummary> activeIncidents;
    private int totalActiveIncidents;

    private List<PendingEnterpriseSummary> pendingEnterprises;
    private int totalPendingEnterprises;

    private WeeklyReportSummary weeklyReports;
    private PipelineSummary pipeline;

    @Data
    @Builder
    public static class IncidentSummary {
        private UUID id;
        private String name;
        private String studentId;
        private String enterprise;
        private String severity;
        private String type;
        private int daysAgo;
    }

    @Data
    @Builder
    public static class PendingEnterpriseSummary {
        private UUID id;
        private String name;
        private int daysWaiting;
        private String sector;
    }

    @Data
    @Builder
    public static class WeeklyReportSummary {
        private int week;
        private int submitted;
        private int pending;
        private int late;
        private int notStarted;
        private List<LateStudentSummary> students;
    }

    @Data
    @Builder
    public static class LateStudentSummary {
        private String name;
        private int daysOverdue;
        private String status;
    }

    @Data
    @Builder
    public static class PipelineSummary {
        private int eligible;
        private int applied;
        private int interviewed;
        private int placed;
    }
}
