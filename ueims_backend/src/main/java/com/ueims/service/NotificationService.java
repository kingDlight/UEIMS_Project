package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.Notification;

public interface NotificationService {
    List<Notification> findAll();

    Notification findById(UUID id);

    Notification save(Notification entity);

    void deleteById(UUID id);
}
