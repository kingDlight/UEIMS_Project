package com.ueims.service.impl;

import com.ueims.model.entity.Semester;
import com.ueims.repository.SemesterRepository;
import com.ueims.service.SemesterService;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SemesterServiceImpl implements SemesterService {
    private final SemesterRepository repository;

    @Override
    public List<Semester> findAll() { return repository.findAll(); }

    @Override
    public Semester findById(UUID id) { return repository.findById(id).orElse(null); }

    @Override
    public Semester save(Semester entity) { return repository.save(entity); }

    @Override
    public void deleteById(UUID id) { repository.deleteById(id); }
}
