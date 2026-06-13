package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.service.EnterpriseAssignmentService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EnterpriseAssignmentServiceImpl implements EnterpriseAssignmentService {
    EnterpriseAssignmentRepository repository;

    @Override
    public List<EnterpriseAssignment> findAll() {
        return repository.findAll();
    }

    @Override
    public EnterpriseAssignment findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public EnterpriseAssignment findMyAssignment(UUID studentId) {
        return repository.findByStudent_UserId(studentId).orElse(null);
    }

    @Override
    public EnterpriseAssignment save(EnterpriseAssignment entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public EnterpriseAssignment createAssignmentFromApplication(com.ueims.model.entity.Application application) {
        EnterpriseAssignment assignment = EnterpriseAssignment.builder()
                .enterprise(application.getJobPost().getEnterprise())
                .student(application.getStudent())
                .semester(application.getJobPost().getSemester())
                .status("ACTIVE")
                .build();

        return repository.save(assignment);
    }

    @Override
    public boolean isStudentAssignedInSemester(UUID studentId, UUID semesterId) {
        return repository.existsByStudent_UserIdAndSemester_SemesterId(studentId, semesterId);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
