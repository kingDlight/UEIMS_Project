package com.ueims.service;

import com.ueims.model.entity.FinalGrade;
import java.util.List;
import java.util.UUID;

public interface FinalGradeService {
    List<FinalGrade> findAll();
    FinalGrade findById(UUID id);
    FinalGrade save(FinalGrade entity);
    void deleteById(UUID id);
}
