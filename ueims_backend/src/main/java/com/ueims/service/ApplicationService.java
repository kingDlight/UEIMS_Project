package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.Application;

public interface ApplicationService {
    List<Application> findAll();

    Application findById(UUID id);

    Application save(Application entity);

    void deleteById(UUID id);
}
