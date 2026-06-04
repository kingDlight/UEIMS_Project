package com.ueims.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.Interview;
import com.ueims.repository.InterviewRepository;
import com.ueims.service.InterviewService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InterviewServiceImpl implements InterviewService {
    private final InterviewRepository repository;

    @Override
    public List<Interview> findAll() {
        return repository.findAll();
    }

    @Override
    public Interview findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public Interview save(Interview entity) {
        return repository.save(entity);
    }

    @Override
    public Interview confirmAttendance(UUID id) {
        Interview interview =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_NOT_FOUND));
        interview.setStudentConfirmed(Boolean.TRUE);
        interview.setStatus("CONFIRMED");
        interview.setUpdatedAt(LocalDateTime.now());
        return repository.save(interview);
    }

    @Override
    public Interview declineAttendance(UUID id, String reason) {
        Interview interview =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_NOT_FOUND));
        if (Boolean.TRUE.equals(interview.getStudentConfirmed())) {
            throw new AppException(ErrorCode.INTERVIEW_ALREADY_CONFIRMED);
        }
        interview.setStudentConfirmed(Boolean.FALSE);
        interview.setStatus("CANCELLED");
        interview.setFeedback(reason);
        interview.setUpdatedAt(LocalDateTime.now());
        return repository.save(interview);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
