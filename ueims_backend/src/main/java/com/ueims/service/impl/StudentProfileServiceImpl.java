package com.ueims.service.impl;

import com.ueims.model.entity.StudentProfile;
import com.ueims.repository.StudentProfileRepository;
import com.ueims.service.StudentProfileService;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentProfileServiceImpl implements StudentProfileService {
    private final StudentProfileRepository repository;

    @Override
    public List<StudentProfile> findAll() { return repository.findAll(); }

    @Override
    public StudentProfile findById(UUID id) { return repository.findById(id).orElse(null); }

    @Override
    public StudentProfile save(StudentProfile entity) { return repository.save(entity); }

    @Override
    public void deleteById(UUID id) { repository.deleteById(id); }
}
