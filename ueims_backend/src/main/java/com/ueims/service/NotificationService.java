package com.ueims.service;

import com.ueims.model.entity.Notification;
import java.util.List;
import java.util.UUID;

public interface NotificationService {
    List<Notification> findAll();
    Notification findById(UUID id);
    Notification save(Notification entity);
    void deleteById(UUID id);
}
