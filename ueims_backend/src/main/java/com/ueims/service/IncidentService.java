package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.Incident;

public interface IncidentService {
    List<Incident> findAll();

    Incident findById(UUID id);

    Incident save(Incident entity);

    void deleteById(UUID id);

    Incident reportIncident(com.ueims.dto.request.IncidentReportRequest request);

    Incident resolveIncident(UUID incidentId, com.ueims.dto.request.IncidentResolveRequest request);
}
