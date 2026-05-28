package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.FinalGrade;

public interface FinalGradeService {
    List<FinalGrade> findAll();

    FinalGrade findById(UUID id);

    FinalGrade save(FinalGrade entity);

    void deleteById(UUID id);
}
