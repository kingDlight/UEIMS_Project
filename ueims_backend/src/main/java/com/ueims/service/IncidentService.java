package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.Incident;

public interface IncidentService {
    List<Incident> findAll();

    Incident findById(UUID id);

    Incident save(Incident entity);

    Incident createIncident(com.ueims.dto.request.IncidentRequest request);

    Incident updateIncident(UUID id, com.ueims.dto.request.IncidentRequest request);

    void deleteById(UUID id);

    Incident reportIncident(com.ueims.dto.request.IncidentReportRequest request);

    Incident resolveIncident(UUID incidentId, com.ueims.dto.request.IncidentResolveRequest request);
}
