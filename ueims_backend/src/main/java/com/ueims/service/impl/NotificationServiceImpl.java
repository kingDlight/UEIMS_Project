package com.ueims.service.impl;

import com.ueims.model.entity.Notification;
import com.ueims.repository.NotificationRepository;
import com.ueims.service.NotificationService;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository repository;

    @Override
    public List<Notification> findAll() { return repository.findAll(); }

    @Override
    public Notification findById(UUID id) { return repository.findById(id).orElse(null); }

    @Override
    public Notification save(Notification entity) { return repository.save(entity); }

    @Override
    public void deleteById(UUID id) { repository.deleteById(id); }
}
