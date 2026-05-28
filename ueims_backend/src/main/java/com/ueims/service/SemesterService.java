package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.Semester;

public interface SemesterService {
    List<Semester> findAll();

    Semester findById(UUID id);

    Semester save(Semester entity);

    void deleteById(UUID id);
}
