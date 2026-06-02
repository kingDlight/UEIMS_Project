package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.Interview;
import com.ueims.repository.InterviewRepository;
import com.ueims.repository.UserRepository;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.service.InterviewService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InterviewServiceImpl implements InterviewService {
    private final InterviewRepository repository;
    private final UserRepository userRepository;

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
    public Interview studentConfirm(UUID id) {
        Interview interview = repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_NOT_FOUND));
        interview.setStudentConfirmed(Boolean.TRUE);
        return repository.save(interview);
    }

    @Override
    public Interview studentDecline(UUID id, String reason) {
        Interview interview = repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_NOT_FOUND));
        // If already confirmed, cannot be reversed
        if (Boolean.TRUE.equals(interview.getStudentConfirmed())) {
            throw new AppException(ErrorCode.INTERVIEW_CONFIRMATION_CANNOT_BE_REVERSED);
        }
        interview.setStudentConfirmed(Boolean.FALSE);
        interview.setFeedback(reason);
        return repository.save(interview);
    }

    @Override
    public Interview decideInterview(UUID id, String result, UUID decidedBy) {
        Interview interview = repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_NOT_FOUND));
        interview.setResult(result);
        interview.setStatus("COMPLETED");
        interview.setDecidedBy(userRepository.findById(decidedBy).orElse(null));
        interview.setUpdatedAt(LocalDateTime.now());
        return repository.save(interview);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
