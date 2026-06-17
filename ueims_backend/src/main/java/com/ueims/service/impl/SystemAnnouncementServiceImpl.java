package com.ueims.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.dto.request.AnnouncementCreationRequest;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.SystemAnnouncement;
import com.ueims.model.entity.User;
import com.ueims.repository.SemesterRepository;
import com.ueims.repository.SystemAnnouncementRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.SystemAnnouncementService;
import com.ueims.service.websocket.AnnouncementBroadcaster;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SystemAnnouncementServiceImpl implements SystemAnnouncementService {
    SystemAnnouncementRepository repository;
    UserRepository userRepository;
    SemesterRepository semesterRepository;
    AnnouncementBroadcaster broadcaster;

    @Override
    public List<SystemAnnouncement> findAll() {
        return repository.findAll();
    }

    @Override
    public List<SystemAnnouncement> findActiveAnnouncements() {
        return repository.findByStatusOrderByCreatedAtDesc("PUBLISHED");
    }

    @Override
    public SystemAnnouncement findById(UUID id) {
        return repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
    }

    @Override
    @Transactional
    public SystemAnnouncement createAnnouncement(AnnouncementCreationRequest request) {
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
                .build();

        SystemAnnouncement saved = repository.save(announcement);
        broadcaster.broadcastCreated(saved);
        return saved;
    }

    @Override
    @Transactional
    public SystemAnnouncement updateAnnouncement(UUID id, AnnouncementCreationRequest request) {
        SystemAnnouncement announcement = findById(id);

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
        return saved;
    }

    @Override
    @Transactional
    public SystemAnnouncement updateStatus(UUID id, String status) {
        SystemAnnouncement announcement = findById(id);
        announcement.setStatus(status);
        if ("PUBLISHED".equals(status)) {
            announcement.setPublishedAt(LocalDateTime.now());
        }
        SystemAnnouncement saved = repository.save(announcement);
        if ("PUBLISHED".equals(status)) {
            broadcaster.broadcastPublished(saved);
        } else if ("ARCHIVED".equals(status)) {
            broadcaster.broadcastArchived(saved);
        } else {
            broadcaster.broadcastUpdated(saved);
        }
        return saved;
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
        broadcaster.broadcastDeleted(id);
    }
}
