package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.model.entity.AtRiskStudent;
import com.ueims.repository.AtRiskStudentRepository;
import com.ueims.service.AtRiskStudentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AtRiskStudentServiceImpl implements AtRiskStudentService {

    private final AtRiskStudentRepository atRiskStudentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AtRiskStudent> getAtRiskStudentsBySemester(UUID semesterId) {
        return atRiskStudentRepository.findBySemesterId(semesterId);
    }
}
