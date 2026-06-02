package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.dto.request.AnnouncementCreationRequest;
import com.ueims.model.entity.SystemAnnouncement;

public interface SystemAnnouncementService {
    List<SystemAnnouncement> findAll();

    List<SystemAnnouncement> findActiveAnnouncements();

    SystemAnnouncement findById(UUID id);

    SystemAnnouncement createAnnouncement(AnnouncementCreationRequest request);

    SystemAnnouncement updateStatus(UUID id, String status);

    void deleteById(UUID id);
}
