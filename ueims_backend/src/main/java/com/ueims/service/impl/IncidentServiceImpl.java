package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.Incident;
import com.ueims.repository.IncidentRepository;
import com.ueims.service.IncidentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IncidentServiceImpl implements IncidentService {
    private final IncidentRepository repository;

    @Override
    public List<Incident> findAll() {
        return repository.findAll();
    }

    @Override
    public Incident findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public Incident save(Incident entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
