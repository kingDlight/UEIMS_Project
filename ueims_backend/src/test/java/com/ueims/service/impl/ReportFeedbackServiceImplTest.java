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

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.ReportFeedback;
import com.ueims.repository.ReportFeedbackRepository;

@ExtendWith(MockitoExtension.class)
class ReportFeedbackServiceImplTest {

    private static final String REJECTED = "REJECTED";

    @Mock
    private ReportFeedbackRepository repository;

    @InjectMocks
    private ReportFeedbackServiceImpl service;

    private ReportFeedback feedback;
    private UUID feedbackId;

    @BeforeEach
    void setUp() {
        feedbackId = UUID.randomUUID();
        feedback = ReportFeedback.builder()
                .feedbackId(feedbackId)
                .action("ACCEPTED")
                .feedbackText("Good report")
                .build();
    }

    @Test
    void findAllSuccess() {
        when(repository.findAll()).thenReturn(List.of(feedback));

        List<ReportFeedback> result = service.findAll();

        assertEquals(1, result.size());
        assertEquals(feedbackId, result.get(0).getFeedbackId());
    }

    @Test
    void findByIdSuccess() {
        when(repository.findById(feedbackId)).thenReturn(Optional.of(feedback));

        ReportFeedback result = service.findById(feedbackId);

        assertNotNull(result);
        assertEquals(feedbackId, result.getFeedbackId());
    }

    @Test
    void findByIdNotFound() {
        when(repository.findById(feedbackId)).thenReturn(Optional.empty());

        ReportFeedback result = service.findById(feedbackId);

        assertNull(result);
    }

    @Test
    void saveSuccess() {
        when(repository.save(any(ReportFeedback.class))).thenReturn(feedback);

        ReportFeedback result = service.save(feedback);

        assertNotNull(result);
        assertEquals(feedbackId, result.getFeedbackId());
    }

    @Test
    void saveRejectedWithBlankTextThrowsException() {
        feedback.setAction(REJECTED);
        feedback.setFeedbackText("   ");

        AppException exception = assertThrows(AppException.class, () -> service.save(feedback));

        assertEquals(ErrorCode.FEEDBACK_TEXT_REQUIRED, exception.getErrorCode());
    }

    @Test
    void saveRejectedWithNullTextThrowsException() {
        feedback.setAction(REJECTED);
        feedback.setFeedbackText(null);

        AppException exception = assertThrows(AppException.class, () -> service.save(feedback));

        assertEquals(ErrorCode.FEEDBACK_TEXT_REQUIRED, exception.getErrorCode());
    }

    @Test
    void saveRejectedWithValidTextSuccess() {
        feedback.setAction(REJECTED);
        feedback.setFeedbackText("Missing key components");

        when(repository.save(any(ReportFeedback.class))).thenReturn(feedback);

        ReportFeedback result = service.save(feedback);

        assertNotNull(result);
        assertEquals(feedbackId, result.getFeedbackId());
    }

    @Test
    void deleteByIdSuccess() {
        service.deleteById(feedbackId);

        verify(repository).deleteById(feedbackId);
    }
}
