package com.ueims.service.impl;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.Semester;
import com.ueims.repository.SemesterRepository;
import com.ueims.service.SemesterService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SemesterServiceImpl implements SemesterService {
    private static final String STATUS_DRAFT = "DRAFT";
    private static final String STATUS_OPEN = "OPEN";
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_CLOSED = "CLOSED";
    private static final String STATUS_LOCKED = "LOCKED";
    private static final List<String> LOCKED_STATUSES = List.of(STATUS_ACTIVE, STATUS_CLOSED, STATUS_LOCKED);

    private final SemesterRepository repository;

    @Override
    public List<Semester> findAll() {
        return repository.findAll();
    }

    @Override
    public Semester findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public Semester save(Semester entity) {
        validateDates(entity);

        if (entity.getSemesterId() == null) {
            validateForCreate(entity);
        } else {
            Semester existing = repository.findById(entity.getSemesterId()).orElse(null);
            if (existing != null) {
                validateForUpdate(entity, existing);
            }
        }

        return repository.save(entity);
    }

    private void validateDates(Semester entity) {
        if (entity.getStartDate() != null
                && entity.getEndDate() != null
                && !entity.getStartDate().isBefore(entity.getEndDate())) {
            throw new AppException(ErrorCode.SEMESTER_INVALID_DATE);
        }
    }

    private void validateForCreate(Semester entity) {
        if (repository.existsBySemesterCode(entity.getSemesterCode())) {
            throw new AppException(ErrorCode.SEMESTER_EXISTED);
        }
    }

    private void validateForUpdate(Semester entity, Semester existing) {
        if (!Objects.equals(existing.getSemesterCode(), entity.getSemesterCode())
                && repository.existsBySemesterCode(entity.getSemesterCode())) {
            throw new AppException(ErrorCode.SEMESTER_EXISTED);
        }
        if (LOCKED_STATUSES.contains(existing.getStatus())
                && (!Objects.equals(existing.getStartDate(), entity.getStartDate())
                        || !Objects.equals(existing.getEndDate(), entity.getEndDate()))) {
            throw new AppException(ErrorCode.SEMESTER_LOCKED_DATE);
        }
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    @Override
    public Semester openSemester(UUID id) {
        Semester semester = repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.SEMESTER_NOT_FOUND));
        if (!STATUS_DRAFT.equals(semester.getStatus())) {
            throw new AppException(ErrorCode.SEMESTER_INVALID_TRANSITION);
        }
        semester.setStatus(STATUS_OPEN);
        return repository.save(semester);
    }

    @Override
    public Semester activeSemester(UUID id) {
        Semester semester = repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.SEMESTER_NOT_FOUND));
        if (!STATUS_OPEN.equals(semester.getStatus())) {
            throw new AppException(ErrorCode.SEMESTER_INVALID_TRANSITION);
        }
        semester.setStatus(STATUS_ACTIVE);
        return repository.save(semester);
    }

    @Override
    public Semester closeSemester(UUID id) {
        Semester semester = repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.SEMESTER_NOT_FOUND));
        if (!STATUS_ACTIVE.equals(semester.getStatus())) {
            throw new AppException(ErrorCode.SEMESTER_INVALID_TRANSITION);
        }
        semester.setStatus(STATUS_CLOSED);
        return repository.save(semester);
    }

    @Override
    public Semester lockSemester(UUID id) {
        Semester semester = repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.SEMESTER_NOT_FOUND));
        if (!STATUS_CLOSED.equals(semester.getStatus())) {
            throw new AppException(ErrorCode.SEMESTER_INVALID_TRANSITION);
        }
        semester.setStatus(STATUS_LOCKED);
        return repository.save(semester);
    }
}
