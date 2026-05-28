package com.ueims.service;

import com.ueims.model.entity.SystemAnnouncement;
import java.util.List;
import java.util.UUID;

public interface SystemAnnouncementService {
    List<SystemAnnouncement> findAll();
    SystemAnnouncement findById(UUID id);
    SystemAnnouncement save(SystemAnnouncement entity);
    void deleteById(UUID id);
}
