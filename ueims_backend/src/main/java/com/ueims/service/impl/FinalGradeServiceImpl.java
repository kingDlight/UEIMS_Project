package com.ueims.service.impl;

import com.ueims.model.entity.FinalGrade;
import com.ueims.repository.FinalGradeRepository;
import com.ueims.service.FinalGradeService;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FinalGradeServiceImpl implements FinalGradeService {
    private final FinalGradeRepository repository;

    @Override
    public List<FinalGrade> findAll() { return repository.findAll(); }

    @Override
    public FinalGrade findById(UUID id) { return repository.findById(id).orElse(null); }

    @Override
    public FinalGrade save(FinalGrade entity) { return repository.save(entity); }

    @Override
    public void deleteById(UUID id) { repository.deleteById(id); }
}
