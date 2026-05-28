package com.ueims.service.impl;

import com.ueims.model.entity.FinalReport;
import com.ueims.repository.FinalReportRepository;
import com.ueims.service.FinalReportService;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FinalReportServiceImpl implements FinalReportService {
    private final FinalReportRepository repository;

    @Override
    public List<FinalReport> findAll() { return repository.findAll(); }

    @Override
    public FinalReport findById(UUID id) { return repository.findById(id).orElse(null); }

    @Override
    public FinalReport save(FinalReport entity) { return repository.save(entity); }

    @Override
    public void deleteById(UUID id) { repository.deleteById(id); }
}
