package com.ueims.model.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.*;

@Entity
@Table(name = "placement_applications")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlacementApplication extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "application_id")
    private UUID applicationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enterprise_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Enterprise enterprise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Semester semester;

    /**
     * Workflow status:
     *   PENDING_APPROVAL → APPROVED  (TM duyệt)
     *   PENDING_APPROVAL → REJECTED  (TM bác, kèm rejection_reason)
     *   PENDING_APPROVAL → WITHDRAWN (SV tự rút)
     */
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING_APPROVAL";

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    /**
     * Self-Replace workflow: application này yêu cầu thay thế assignment ACTIVE hiện tại.
     * Khi TM approve:
     *   - assignment cũ → TERMINATED (reason = "Replaced by new placement")
     *   - assignment mới → ACTIVE
     */
    @Column(name = "is_replacement", nullable = false)
    @Builder.Default
    private Boolean isReplacement = false;

    /** Application APPROVED trước đó mà application này thay thế (chỉ có khi isReplacement = true). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "replaces_application_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private PlacementApplication replacesApplication;
}
