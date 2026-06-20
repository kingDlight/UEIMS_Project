package com.ueims.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.dto.request.AnnouncementCreationRequest;
import com.ueims.dto.request.BroadcastNotificationRequest;
import com.ueims.dto.response.SystemAnnouncementDTO;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.SystemAnnouncement;
import com.ueims.model.entity.User;
import com.ueims.repository.SemesterRepository;
import com.ueims.repository.SystemAnnouncementRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.NotificationService;
import com.ueims.service.SystemAnnouncementService;
import com.ueims.service.websocket.AnnouncementBroadcaster;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SystemAnnouncementServiceImpl implements SystemAnnouncementService {
    SystemAnnouncementRepository repository;
    UserRepository userRepository;
    SemesterRepository semesterRepository;
    AnnouncementBroadcaster broadcaster;
    NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public List<SystemAnnouncementDTO> findAll() {
        return repository.findAll().stream().map(SystemAnnouncementDTO::from).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SystemAnnouncementDTO> findActiveAnnouncements() {
        return repository.findByStatusOrderByCreatedAtDesc("PUBLISHED").stream()
                .map(SystemAnnouncementDTO::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SystemAnnouncementDTO findById(UUID id) {
        return SystemAnnouncementDTO.from(
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION)));
    }

    @Override
    @Transactional
    public SystemAnnouncementDTO createAnnouncement(AnnouncementCreationRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser =
                userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Semester semester = null;
        if (request.getSemesterId() != null) {
            semester = semesterRepository.findById(request.getSemesterId()).orElse(null);
        }

        SystemAnnouncement announcement = SystemAnnouncement.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .status("DRAFT")
                .createdBy(currentUser)
                .semester(semester)
                .type(request.getType())
                .audience(request.getAudience())
                .targetRole(request.getTargetRole())
                .build();

        SystemAnnouncement saved = repository.save(announcement);
        broadcaster.broadcastCreated(saved);
        return SystemAnnouncementDTO.from(saved);
    }

    @Override
    @Transactional
    public SystemAnnouncementDTO updateAnnouncement(UUID id, AnnouncementCreationRequest request) {
        SystemAnnouncement announcement =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());

        if (request.getSemesterId() != null) {
            Semester semester =
                    semesterRepository.findById(request.getSemesterId()).orElse(null);
            announcement.setSemester(semester);
        } else {
            announcement.setSemester(null);
        }

        SystemAnnouncement saved = repository.save(announcement);
        broadcaster.broadcastUpdated(saved);
        return SystemAnnouncementDTO.from(saved);
    }

    @Override
    @Transactional
    public SystemAnnouncementDTO updateStatus(UUID id, String status) {
        SystemAnnouncement announcement =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
        boolean wasPublished = "PUBLISHED".equalsIgnoreCase(announcement.getStatus());
        announcement.setStatus(status);
        if ("PUBLISHED".equals(status)) {
            announcement.setPublishedAt(LocalDateTime.now());
        }
        SystemAnnouncement saved = repository.save(announcement);
        if ("PUBLISHED".equals(status)) {
            broadcaster.broadcastPublished(saved);
            // Side-effect: fan-out a WebSocket bell to matching recipients.
            // One source of truth — the announcement IS the notification.
            // Skip for SEMESTER scope: NotificationService.broadcast() does not yet
            // support per-semester targeting, so we only persist + log a warning.
            if (!wasPublished && !"SEMESTER".equalsIgnoreCase(saved.getAudience())) {
                try {
                    BroadcastNotificationRequest bell = BroadcastNotificationRequest.builder()
                            .title(saved.getTitle())
                            .message(saved.getContent())
                            .type(saved.getType() != null ? saved.getType() : "SYSTEM_ANNOUNCEMENT")
                            .targetRole(saved.getTargetRole())
                            .referenceEntity("SYSTEM_ANNOUNCEMENT")
                            .referenceId(saved.getAnnouncementId())
                            .build();
                    int sent = notificationService.broadcast(bell);
                    log.info(
                            "[Announcement] published {} bell-pushed to {} recipient(s)",
                            saved.getAnnouncementId(),
                            sent);
                } catch (Exception ex) {
                    log.warn("[Announcement] published but bell broadcast failed: {}", ex.getMessage());
                }
            } else if ("SEMESTER".equalsIgnoreCase(saved.getAudience())) {
                log.info(
                        "[Announcement] {} scope=SEMESTER — bell skipped (no per-semester route yet)",
                        saved.getAnnouncementId());
            }
        } else if ("ARCHIVED".equals(status)) {
            broadcaster.broadcastArchived(saved);
        } else {
            broadcaster.broadcastUpdated(saved);
        }
        return SystemAnnouncementDTO.from(saved);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
        broadcaster.broadcastDeleted(id);
    }
}
