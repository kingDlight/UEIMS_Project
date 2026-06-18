package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.dto.request.IncidentReportRequest;
import com.ueims.dto.request.IncidentRequest;
import com.ueims.dto.request.IncidentResolveRequest;
import com.ueims.dto.response.IncidentResponse;
import com.ueims.model.entity.Incident;

public interface IncidentService {
    List<Incident> findAll();

    Incident findById(UUID id);

    Incident save(Incident entity);

    Incident createIncident(IncidentRequest request);

    Incident updateIncident(UUID id, IncidentRequest request);

    void deleteById(UUID id);

    IncidentResponse reportIncident(IncidentReportRequest request);

    Incident resolveIncident(UUID incidentId, IncidentResolveRequest request);
}
