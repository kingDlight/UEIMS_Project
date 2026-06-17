package com.ueims.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import com.ueims.model.entity.Semester;
import com.ueims.model.entity.SystemAnnouncement;
import com.ueims.model.entity.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemAnnouncementDTO {
    private UUID announcementId;
    private UUID semesterId;
    private String title;
    private String content;
    private String status;
    private UUID createdById;
    private String createdByFullName;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String type;
    private String audience;
    private String targetRole;

    public static SystemAnnouncementDTO from(SystemAnnouncement a) {
        if (a == null) return null;
        Semester sem = a.getSemester();
        User creator = a.getCreatedBy();
        return SystemAnnouncementDTO.builder()
                .announcementId(a.getAnnouncementId())
                .semesterId(sem != null ? sem.getSemesterId() : null)
                .title(a.getTitle())
                .content(a.getContent())
                .status(a.getStatus())
                .createdById(creator != null ? creator.getUserId() : null)
                .createdByFullName(creator != null ? creator.getFullName() : null)
                .publishedAt(a.getPublishedAt())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .type(a.getType())
                .audience(a.getAudience())
                .targetRole(a.getTargetRole())
                .build();
    }
}
