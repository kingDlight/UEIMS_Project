package com.ueims.service;

import com.ueims.model.entity.Semester;
import java.util.List;
import java.util.UUID;

public interface SemesterService {
    List<Semester> findAll();
    Semester findById(UUID id);
    Semester save(Semester entity);
    void deleteById(UUID id);
}
