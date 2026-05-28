package com.ueims.service;

import com.ueims.model.entity.Application;
import java.util.List;
import java.util.UUID;

public interface ApplicationService {
    List<Application> findAll();
    Application findById(UUID id);
    Application save(Application entity);
    void deleteById(UUID id);
}
