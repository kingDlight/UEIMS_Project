package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.ueims.dto.request.AnnouncementCreationRequest;
import com.ueims.dto.response.SystemAnnouncementDTO;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.SystemAnnouncement;
import com.ueims.model.entity.User;
import com.ueims.repository.SemesterRepository;
import com.ueims.repository.SystemAnnouncementRepository;
import com.ueims.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class SystemAnnouncementServiceImplTest {

    private static final String TEST_EMAIL = "admin@test.com";
    private static final String STATUS_PUBLISHED = "PUBLISHED";
    private static final String UPDATED_TITLE = "Updated Title";
    private static final String NEW_CONTENT = "New Content";
    private static final String STATUS_DRAFT = "DRAFT";
    private static final String TEST_TITLE = "Test Title";
    private static final String UPDATED_CONTENT = "Updated Content";
    private static final String NEW_TITLE = "New Title";

    @Mock
    private SystemAnnouncementRepository repository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SemesterRepository semesterRepository;

    @InjectMocks
    private SystemAnnouncementServiceImpl service;

    private SystemAnnouncement announcement;
    private User currentUser;
    private Semester semester;
    private UUID announcementId;
    private UUID semesterId;

    @BeforeEach
    void setUp() {
        announcementId = UUID.randomUUID();
        semesterId = UUID.randomUUID();

        currentUser = User.builder().userId(UUID.randomUUID()).email(TEST_EMAIL).build();
        semester = Semester.builder().semesterId(semesterId).name("Fall 2023").build();

        announcement = SystemAnnouncement.builder()
                .announcementId(announcementId)
                .title(TEST_TITLE)
                .content("Test Content")
                .status(STATUS_DRAFT)
                .createdBy(currentUser)
                .semester(semester)
                .build();
    }

    @Test
    void findAllSuccess() {
        when(repository.findAll()).thenReturn(List.of(announcement));

        List<SystemAnnouncementDTO> result = service.findAll();

        assertEquals(1, result.size());
        assertEquals(TEST_TITLE, result.get(0).getTitle());
    }

    @Test
    void findActiveAnnouncementsSuccess() {
        when(repository.findByStatusOrderByCreatedAtDesc(STATUS_PUBLISHED)).thenReturn(List.of(announcement));

        List<SystemAnnouncementDTO> result = service.findActiveAnnouncements();

        assertEquals(1, result.size());
    }

    @Test
    void findByIdSuccess() {
        when(repository.findById(announcementId)).thenReturn(Optional.of(announcement));

        SystemAnnouncementDTO result = service.findById(announcementId);

        assertNotNull(result);
        assertEquals(TEST_TITLE, result.getTitle());
    }

    @Test
    void findByIdNotFoundThrowsException() {
        when(repository.findById(announcementId)).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> service.findById(announcementId));

        assertEquals(ErrorCode.UNCATEGORIZED_EXCEPTION, exception.getErrorCode());
    }

    @Test
    void createAnnouncementWithSemesterSuccess() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(TEST_EMAIL, null));

        AnnouncementCreationRequest request = AnnouncementCreationRequest.builder()
                .title(NEW_TITLE)
                .content(NEW_CONTENT)
                .semesterId(semesterId)
                .build();

        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(currentUser));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(repository.save(any(SystemAnnouncement.class))).thenAnswer(i -> i.getArgument(0));

        SystemAnnouncementDTO result = service.createAnnouncement(request);

        assertNotNull(result);
        assertEquals(NEW_TITLE, result.getTitle());
        assertEquals(STATUS_DRAFT, result.getStatus());
        assertNotNull(result.getSemesterId());
    }

    @Test
    void createAnnouncementWithoutSemesterSuccess() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(TEST_EMAIL, null));

        AnnouncementCreationRequest request = AnnouncementCreationRequest.builder()
                .title(NEW_TITLE)
                .content(NEW_CONTENT)
                .build();

        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(currentUser));
        when(repository.save(any(SystemAnnouncement.class))).thenAnswer(i -> i.getArgument(0));

        SystemAnnouncementDTO result = service.createAnnouncement(request);

        assertNotNull(result);
        assertEquals(NEW_TITLE, result.getTitle());
        assertEquals(STATUS_DRAFT, result.getStatus());
        assertNull(result.getSemesterId());
    }

    @Test
    void createAnnouncementUserNotFoundThrowsException() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(TEST_EMAIL, null));

        AnnouncementCreationRequest request = AnnouncementCreationRequest.builder()
                .title(NEW_TITLE)
                .content(NEW_CONTENT)
                .build();

        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> service.createAnnouncement(request));

        assertEquals(ErrorCode.USER_NOT_EXISTED, exception.getErrorCode());
    }

    @Test
    void updateAnnouncementWithSemesterSuccess() {
        AnnouncementCreationRequest request = AnnouncementCreationRequest.builder()
                .title(UPDATED_TITLE)
                .content(UPDATED_CONTENT)
                .semesterId(semesterId)
                .build();

        when(repository.findById(announcementId)).thenReturn(Optional.of(announcement));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(repository.save(any(SystemAnnouncement.class))).thenAnswer(i -> i.getArgument(0));

        SystemAnnouncementDTO result = service.updateAnnouncement(announcementId, request);

        assertEquals(UPDATED_TITLE, result.getTitle());
        assertEquals(UPDATED_CONTENT, result.getContent());
        assertNotNull(result.getSemesterId());
    }

    @Test
    void updateAnnouncementWithoutSemesterSuccess() {
        AnnouncementCreationRequest request = AnnouncementCreationRequest.builder()
                .title(UPDATED_TITLE)
                .content(UPDATED_CONTENT)
                .build();

        when(repository.findById(announcementId)).thenReturn(Optional.of(announcement));
        when(repository.save(any(SystemAnnouncement.class))).thenAnswer(i -> i.getArgument(0));

        SystemAnnouncementDTO result = service.updateAnnouncement(announcementId, request);

        assertEquals(UPDATED_TITLE, result.getTitle());
        assertNull(result.getSemesterId());
    }

    @Test
    void updateStatusToPublishedSuccess() {
        when(repository.findById(announcementId)).thenReturn(Optional.of(announcement));
        when(repository.save(any(SystemAnnouncement.class))).thenAnswer(i -> i.getArgument(0));

        SystemAnnouncementDTO result = service.updateStatus(announcementId, STATUS_PUBLISHED);

        assertEquals(STATUS_PUBLISHED, result.getStatus());
        assertNotNull(result.getPublishedAt());
    }

    @Test
    void updateStatusToHiddenSuccess() {
        when(repository.findById(announcementId)).thenReturn(Optional.of(announcement));
        when(repository.save(any(SystemAnnouncement.class))).thenAnswer(i -> i.getArgument(0));

        SystemAnnouncementDTO result = service.updateStatus(announcementId, "HIDDEN");

        assertEquals("HIDDEN", result.getStatus());
    }

    @Test
    void deleteByIdSuccess() {
        service.deleteById(announcementId);

        verify(repository).deleteById(announcementId);
    }
}
