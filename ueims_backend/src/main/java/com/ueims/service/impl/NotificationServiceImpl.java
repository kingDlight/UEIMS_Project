package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.Notification;
import com.ueims.repository.NotificationRepository;
import com.ueims.service.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository repository;

    @Override
    public List<Notification> findAll() {
        return repository.findAll();
    }

    @Override
    public Notification findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public Notification save(Notification entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    @Override
    public List<Notification> getMyNotifications(String email) {
        return repository.findByRecipient_EmailOrderByCreatedAtDesc(email);
    }

    @Override
    public Notification markAsRead(UUID id, String email) {
        Notification notification = repository
                .findByNotificationIdAndRecipient_Email(id, email)
                .orElseThrow(() -> new com.ueims.exception.ResourceNotFoundException("Notification not found"));
        notification.setIsRead(true);
        return repository.save(notification);
    }
}
