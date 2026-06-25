package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.model.entity.Semester;

public interface SemesterService {
    List<Semester> findAll();

    List<Semester> findAll(String status, org.springframework.data.domain.Sort sort);

    Semester findById(UUID id);

    Semester save(Semester entity);

    void deleteById(UUID id);

    Semester openSemester(UUID id);

    Semester activeSemester(UUID id);

    Semester closeSemester(UUID id);

    Semester lockSemester(UUID id);

    Semester reopenSemester(UUID id);
}
