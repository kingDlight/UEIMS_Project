package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.Semester;
import com.ueims.repository.SemesterRepository;

@ExtendWith(MockitoExtension.class)
class SemesterServiceImplTest {

    @Mock
    private SemesterRepository repository;

    @InjectMocks
    private SemesterServiceImpl service;

    private Semester semester;
    private UUID semesterId;

    @BeforeEach
    void setUp() {
        semesterId = UUID.randomUUID();
        semester = new Semester();
        semester.setSemesterId(semesterId);
        semester.setSemesterCode("SP24");
        semester.setName("Spring 2024");
        semester.setStartDate(LocalDate.now());
        semester.setEndDate(LocalDate.now().plusMonths(3));
        semester.setStatus("DRAFT");
    }

    @Test
    void findAll_returnsList() {
        when(repository.findAll()).thenReturn(List.of(semester));
        List<Semester> result = service.findAll();
        assertEquals(1, result.size());
    }

    @Test
    void findById_exists_returnsSemester() {
        when(repository.findById(semesterId)).thenReturn(Optional.of(semester));
        Semester result = service.findById(semesterId);
        assertNotNull(result);
        assertEquals(semesterId, result.getSemesterId());
    }

    @Test
    void findById_notExists_returnsNull() {
        when(repository.findById(any())).thenReturn(Optional.empty());
        Semester result = service.findById(UUID.randomUUID());
        assertNull(result);
    }

    @Test
    void save_withValidNewSemester_savesSuccessfully() {
        Semester newSemester = new Semester();
        newSemester.setSemesterCode("FA24");
        newSemester.setStartDate(LocalDate.now());
        newSemester.setEndDate(LocalDate.now().plusMonths(3));

        when(repository.existsBySemesterCode("FA24")).thenReturn(false);
        when(repository.save(any(Semester.class))).thenAnswer(i -> i.getArgument(0));

        Semester result = service.save(newSemester);
        assertNotNull(result);
        assertEquals("FA24", result.getSemesterCode());
    }

    @Test
    void save_withInvalidDates_throwsException() {
        Semester newSemester = new Semester();
        newSemester.setStartDate(LocalDate.now().plusMonths(3));
        newSemester.setEndDate(LocalDate.now()); // End date before start date

        AppException e = assertThrows(AppException.class, () -> service.save(newSemester));
        assertEquals(ErrorCode.SEMESTER_INVALID_DATE, e.getErrorCode());
    }

    @Test
    void save_withExistedCodeCreate_throwsException() {
        Semester newSemester = new Semester();
        newSemester.setSemesterCode("SP24");

        when(repository.existsBySemesterCode("SP24")).thenReturn(true);

        AppException e = assertThrows(AppException.class, () -> service.save(newSemester));
        assertEquals(ErrorCode.SEMESTER_EXISTED, e.getErrorCode());
    }

    @Test
    void save_withExistedCodeUpdate_throwsException() {
        Semester updateSemester = new Semester();
        updateSemester.setSemesterId(semesterId);
        updateSemester.setSemesterCode("FA24"); // Changing code

        when(repository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(repository.existsBySemesterCode("FA24")).thenReturn(true); // New code already exists

        AppException e = assertThrows(AppException.class, () -> service.save(updateSemester));
        assertEquals(ErrorCode.SEMESTER_EXISTED, e.getErrorCode());
    }

    @Test
    void save_withLockedDateUpdate_throwsException() {
        Semester updateSemester = new Semester();
        updateSemester.setSemesterId(semesterId);
        updateSemester.setSemesterCode("SP24");
        updateSemester.setStartDate(LocalDate.now().plusDays(1)); // Changing start date
        updateSemester.setEndDate(semester.getEndDate());
        updateSemester.setStatus("ACTIVE");

        semester.setStatus("ACTIVE"); // Status is in locked list

        when(repository.findById(semesterId)).thenReturn(Optional.of(semester));

        AppException e = assertThrows(AppException.class, () -> service.save(updateSemester));
        assertEquals(ErrorCode.SEMESTER_LOCKED_DATE, e.getErrorCode());
    }

    @Test
    void deleteById_success() {
        service.deleteById(semesterId);
        verify(repository).deleteById(semesterId);
    }

    @Test
    void openSemester_success() {
        when(repository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(repository.save(any(Semester.class))).thenAnswer(i -> i.getArgument(0));

        Semester result = service.openSemester(semesterId);
        assertEquals("OPEN", result.getStatus());
    }

    @Test
    void openSemester_invalidTransition_throwsException() {
        semester.setStatus("ACTIVE");
        when(repository.findById(semesterId)).thenReturn(Optional.of(semester));

        AppException e = assertThrows(AppException.class, () -> service.openSemester(semesterId));
        assertEquals(ErrorCode.SEMESTER_INVALID_TRANSITION, e.getErrorCode());
    }

    @Test
    void activeSemester_success() {
        semester.setStatus("OPEN");
        when(repository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(repository.save(any(Semester.class))).thenAnswer(i -> i.getArgument(0));

        Semester result = service.activeSemester(semesterId);
        assertEquals("ACTIVE", result.getStatus());
    }

    @Test
    void closeSemester_success() {
        semester.setStatus("ACTIVE");
        when(repository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(repository.save(any(Semester.class))).thenAnswer(i -> i.getArgument(0));

        Semester result = service.closeSemester(semesterId);
        assertEquals("CLOSED", result.getStatus());
    }

    @Test
    void lockSemester_success() {
        semester.setStatus("CLOSED");
        when(repository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(repository.save(any(Semester.class))).thenAnswer(i -> i.getArgument(0));

        Semester result = service.lockSemester(semesterId);
        assertEquals("LOCKED", result.getStatus());
    }
}
