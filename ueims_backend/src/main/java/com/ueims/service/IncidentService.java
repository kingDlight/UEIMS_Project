package com.ueims.service;

import com.ueims.model.entity.Incident;
import java.util.List;
import java.util.UUID;

public interface IncidentService {
    List<Incident> findAll();
    Incident findById(UUID id);
    Incident save(Incident entity);
    void deleteById(UUID id);
}
