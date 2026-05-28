package com.ueims.service.impl;

import com.ueims.model.entity.WeeklyReport;
import com.ueims.repository.WeeklyReportRepository;
import com.ueims.service.WeeklyReportService;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WeeklyReportServiceImpl implements WeeklyReportService {
    private final WeeklyReportRepository repository;

    @Override
    public List<WeeklyReport> findAll() { return repository.findAll(); }

    @Override
    public WeeklyReport findById(UUID id) { return repository.findById(id).orElse(null); }

    @Override
    public WeeklyReport save(WeeklyReport entity) { return repository.save(entity); }

    @Override
    public void deleteById(UUID id) { repository.deleteById(id); }
}
