package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.dto.request.AnnouncementCreationRequest;
import com.ueims.dto.response.SystemAnnouncementDTO;

public interface SystemAnnouncementService {
    List<SystemAnnouncementDTO> findAll();

    List<SystemAnnouncementDTO> findActiveAnnouncements();

    SystemAnnouncementDTO findById(UUID id);

    SystemAnnouncementDTO createAnnouncement(AnnouncementCreationRequest request);

    SystemAnnouncementDTO updateAnnouncement(UUID id, AnnouncementCreationRequest request);

    SystemAnnouncementDTO updateStatus(UUID id, String status);

    void deleteById(UUID id);
}
