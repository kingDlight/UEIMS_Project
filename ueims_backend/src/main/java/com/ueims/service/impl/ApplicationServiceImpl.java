package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.Application;
import com.ueims.repository.ApplicationRepository;
import com.ueims.service.ApplicationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {
    private final ApplicationRepository repository;

    @Override
    public List<Application> findAll() {
        return repository.findAll();
    }

    @Override
    public Application findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public Application save(Application entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
