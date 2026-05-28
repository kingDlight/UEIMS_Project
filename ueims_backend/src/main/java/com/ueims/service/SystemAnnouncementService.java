package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.SystemAnnouncement;

public interface SystemAnnouncementService {
    List<SystemAnnouncement> findAll();

    SystemAnnouncement findById(UUID id);

    SystemAnnouncement save(SystemAnnouncement entity);

    void deleteById(UUID id);
}
