package com.ueims.service.impl;

import com.ueims.model.entity.TrainingWarning;
import com.ueims.repository.TrainingWarningRepository;
import com.ueims.service.TrainingWarningService;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrainingWarningServiceImpl implements TrainingWarningService {
    private final TrainingWarningRepository repository;

    @Override
    public List<TrainingWarning> findAll() { return repository.findAll(); }

    @Override
    public TrainingWarning findById(UUID id) { return repository.findById(id).orElse(null); }

    @Override
    public TrainingWarning save(TrainingWarning entity) { return repository.save(entity); }

    @Override
    public void deleteById(UUID id) { repository.deleteById(id); }
}
