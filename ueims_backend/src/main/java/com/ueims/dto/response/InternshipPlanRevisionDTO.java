package com.ueims.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import com.ueims.model.entity.InternshipPlanRevision;

import lombok.Data;

@Data
public class InternshipPlanRevisionDTO {
    private UUID revisionId;
    private UUID planId;
    private UUID actorId;
    private String actorName;
    private String actorRole;
    private String action;
    private String note;
    private String fromStatus;
    private String toStatus;
    private LocalDateTime createdAt;

    public static InternshipPlanRevisionDTO from(InternshipPlanRevision r, String actorName) {
        InternshipPlanRevisionDTO d = new InternshipPlanRevisionDTO();
        d.revisionId = r.getRevisionId();
        d.planId = r.getPlanId();
        d.actorId = r.getActorId();
        d.actorName = actorName;
        d.actorRole = r.getActorRole();
        d.action = r.getAction();
        d.note = r.getNote();
        d.fromStatus = r.getFromStatus();
        d.toStatus = r.getToStatus();
        d.createdAt = r.getCreatedAt();
        return d;
    }
}
