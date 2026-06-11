package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import com.ueims.dto.response.EligibleStudentResponse;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.EligibleStudent;
import com.ueims.model.entity.Semester;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.util.ExcelImportUtil;

@ExtendWith(MockitoExtension.class)
class EligibleStudentServiceImplTest {

    @Mock
    private EligibleStudentRepository repository;

    @Mock
    private SemesterRepository semesterRepository;

    @InjectMocks
    private EligibleStudentServiceImpl service;

    private UUID studentId;
    private UUID semesterId;
    private EligibleStudent student;
    private Semester semester;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();
        semesterId = UUID.randomUUID();

        semester = Semester.builder().semesterId(semesterId).build();

        student = EligibleStudent.builder()
                .eligibleId(studentId)
                .studentCode("SE12345")
                .fullName("John Doe")
                .email("john@test.com")
                .major("SE")
                .gpa(new BigDecimal("3.5"))
                .currentSemester(5)
                .status("OJT")
                .semester(semester)
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void findAll_returnsList() {
        when(repository.findAll()).thenReturn(Arrays.asList(student));
        List<EligibleStudent> result = service.findAll();
        assertEquals(1, result.size());
        assertEquals(studentId, result.get(0).getEligibleId());
    }

    @Test
    void findById_whenExists_returnsStudent() {
        when(repository.findById(studentId)).thenReturn(Optional.of(student));
        EligibleStudent result = service.findById(studentId);
        assertNotNull(result);
        assertEquals(studentId, result.getEligibleId());
    }

    @Test
    void findById_whenNotExists_returnsNull() {
        when(repository.findById(studentId)).thenReturn(Optional.empty());
        EligibleStudent result = service.findById(studentId);
        assertNull(result);
    }

    @Test
    void deleteById_callsRepository() {
        doNothing().when(repository).deleteById(studentId);
        service.deleteById(studentId);
        verify(repository).deleteById(studentId);
    }

    @Test
    void save_whenChangingFromOjtToSomethingElseWithAdmin_success() {
        EligibleStudent updatedStudent = EligibleStudent.builder()
                .eligibleId(studentId)
                .status("DROPOUT")
                .build();

        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(
                        "admin", "pass", Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"))));

        when(repository.findById(studentId)).thenReturn(Optional.of(student));
        when(repository.save(any(EligibleStudent.class))).thenReturn(updatedStudent);

        EligibleStudent result = service.save(updatedStudent);
        assertEquals("DROPOUT", result.getStatus());
    }

    @Test
    void save_whenChangingFromOjtToSomethingElseWithoutAdmin_throwsException() {
        EligibleStudent updatedStudent = EligibleStudent.builder()
                .eligibleId(studentId)
                .status("DROPOUT")
                .build();

        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(
                        "student", "pass", Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT"))));

        when(repository.findById(studentId)).thenReturn(Optional.of(student));

        AppException exception = assertThrows(AppException.class, () -> service.save(updatedStudent));
        assertEquals(ErrorCode.ADMIN_INTERVENTION_REQUIRED, exception.getErrorCode());
    }

    @Test
    void importFromExcel_whenValid_returnsImportedList() throws Exception {
        MockMultipartFile file =
                new MockMultipartFile("file", "test.xlsx", "application/vnd.ms-excel", new byte[] {1, 2, 3});

        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));

        List<EligibleStudent> parsedStudents = Arrays.asList(
                EligibleStudent.builder().studentCode("SE1").build(),
                EligibleStudent.builder().studentCode("SE2").build());

        when(repository.existsByStudentCodeAndSemester_SemesterId("SE1", semesterId))
                .thenReturn(false);
        when(repository.existsByStudentCodeAndSemester_SemesterId("SE2", semesterId))
                .thenReturn(true);

        when(repository.saveAll(any())).thenAnswer(i -> i.getArgument(0));

        try (MockedStatic<ExcelImportUtil> utilities = mockStatic(ExcelImportUtil.class)) {
            utilities.when(() -> ExcelImportUtil.parseEligibleStudents(any())).thenReturn(parsedStudents);

            List<EligibleStudentResponse> result = service.importFromExcel(file, semesterId);

            assertEquals(1, result.size());
            assertEquals("SE1", result.get(0).getStudentCode());
        }
    }

    @Test
    void importFromExcel_whenException_throwsAppException() throws Exception {
        MockMultipartFile file =
                new MockMultipartFile("file", "test.xlsx", "application/vnd.ms-excel", new byte[] {1, 2, 3});
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));

        try (MockedStatic<ExcelImportUtil> utilities = mockStatic(ExcelImportUtil.class)) {
            utilities.when(() -> ExcelImportUtil.parseEligibleStudents(any())).thenThrow(new RuntimeException("Error"));

            AppException exception = assertThrows(AppException.class, () -> service.importFromExcel(file, semesterId));
            assertEquals(ErrorCode.INVALID_EXCEL_FORMAT, exception.getErrorCode());
        }
    }

    @Test
    void finalizeOjtList_whenValid_updatesStatus() {
        EligibleStudent s1 = EligibleStudent.builder()
                .eligibleId(UUID.randomUUID())
                .status("ACCEPTED")
                .build();
        EligibleStudent s2 = EligibleStudent.builder()
                .eligibleId(UUID.randomUUID())
                .status("MATCHED")
                .build();

        List<UUID> ids = Arrays.asList(s1.getEligibleId(), s2.getEligibleId());

        when(repository.findAllById(ids)).thenReturn(Arrays.asList(s1, s2));
        when(repository.saveAll(anyList())).thenReturn(Arrays.asList(s1, s2));

        int updatedCount = service.finalizeOjtList(ids);

        assertEquals(2, updatedCount);
        assertEquals("OJT", s1.getStatus());
        assertEquals("OJT", s2.getStatus());
        assertNotNull(s1.getApprovedAt());
    }

    @Test
    void finalizeOjtList_whenInvalidStatus_throwsException() {
        EligibleStudent s1 = EligibleStudent.builder()
                .eligibleId(UUID.randomUUID())
                .status("PENDING")
                .build();
        List<UUID> ids = Arrays.asList(s1.getEligibleId());

        when(repository.findAllById(ids)).thenReturn(Arrays.asList(s1));

        AppException exception = assertThrows(AppException.class, () -> service.finalizeOjtList(ids));
        assertEquals(ErrorCode.INVALID_STATUS_FOR_OJT, exception.getErrorCode());
    }

    @Test
    void finalizeOjtList_whenEmptyIds_returnsZero() {
        assertEquals(0, service.finalizeOjtList(Collections.emptyList()));
        assertEquals(0, service.finalizeOjtList(null));
    }

    @Test
    void exportOjtStudentsToExcel_whenTooMany_throwsException() {
        List<EligibleStudent> largeList = Collections.nCopies(10001, student);
        when(repository.findBySemester_SemesterId(semesterId)).thenReturn(largeList);

        AppException exception = assertThrows(AppException.class, () -> service.exportOjtStudentsToExcel(semesterId));
        assertEquals(ErrorCode.EXPORT_VOLUME_EXCEEDED, exception.getErrorCode());
    }

    @Test
    void exportOjtStudentsToExcel_whenValid_returnsByteArray() {
        when(repository.findBySemester_SemesterId(semesterId)).thenReturn(Arrays.asList(student));

        byte[] result = service.exportOjtStudentsToExcel(semesterId);

        assertNotNull(result);
        assertTrue(result.length > 0);
    }

    @Test
    void cancelOjtResult_updatesStatusAndReason() {
        when(repository.findById(studentId)).thenReturn(Optional.of(student));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        EligibleStudent result = service.cancelOjtResult(studentId, "Poor performance");

        assertEquals("CANCELLED", result.getStatus());
        assertEquals("Poor performance", result.getCancelledReason());
    }
}
