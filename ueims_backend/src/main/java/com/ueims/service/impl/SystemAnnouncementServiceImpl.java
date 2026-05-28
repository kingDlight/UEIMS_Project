package com.ueims.service.impl;

import com.ueims.model.entity.SystemAnnouncement;
import com.ueims.repository.SystemAnnouncementRepository;
import com.ueims.service.SystemAnnouncementService;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SystemAnnouncementServiceImpl implements SystemAnnouncementService {
    private final SystemAnnouncementRepository repository;

    @Override
    public List<SystemAnnouncement> findAll() { return repository.findAll(); }

    @Override
    public SystemAnnouncement findById(UUID id) { return repository.findById(id).orElse(null); }

    @Override
    public SystemAnnouncement save(SystemAnnouncement entity) { return repository.save(entity); }

    @Override
    public void deleteById(UUID id) { repository.deleteById(id); }
}
