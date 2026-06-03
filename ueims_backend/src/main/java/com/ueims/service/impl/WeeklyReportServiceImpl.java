package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.dto.request.WeeklyReportRequest;
import com.ueims.model.entity.WeeklyReport;
import com.ueims.repository.WeeklyReportRepository;
import com.ueims.service.WeeklyReportService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WeeklyReportServiceImpl implements WeeklyReportService {
    private final WeeklyReportRepository repository;

    @Override
    public List<WeeklyReport> findAll() {
        return repository.findAll();
    }

    @Override
    public WeeklyReport findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public WeeklyReport save(WeeklyReport entity) {
        return repository.save(entity);
    }

    @Override
    public WeeklyReport updateReport(UUID id, WeeklyReportRequest request) {
        WeeklyReport existing = repository.findById(id).orElse(null);
        if (existing == null) return null;
        if (request.getTasksCompleted() != null) existing.setTasksCompleted(request.getTasksCompleted());
        if (request.getIssuesChallenges() != null) existing.setIssuesChallenges(request.getIssuesChallenges());
        if (request.getLessonsLearned() != null) existing.setLessonsLearned(request.getLessonsLearned());
        if (request.getPlanNextWeek() != null) existing.setPlanNextWeek(request.getPlanNextWeek());
        if (request.getAttachmentUrls() != null) existing.setAttachmentUrls(request.getAttachmentUrls());
        if (request.getStatus() != null) existing.setStatus(request.getStatus());
        return repository.save(existing);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
