package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ueims.model.entity.WeeklyReport;
import com.ueims.repository.WeeklyReportRepository;

@ExtendWith(MockitoExtension.class)
class PlagiarismDetectionServiceImplTest {

    @Mock
    private WeeklyReportRepository repository;

    @InjectMocks
    private PlagiarismDetectionServiceImpl service;

    private WeeklyReport report1;
    private WeeklyReport report2;

    @BeforeEach
    void setUp() {
        report1 = new WeeklyReport();
        report1.setReportId(UUID.randomUUID());
        report1.setTasksCompleted("Tôi đã hoàn thành chức năng đăng nhập và đăng ký");
        report1.setIssuesChallenges("Không có khó khăn gì lớn");
        report1.setLessonsLearned("Học được cách dùng JWT");
        report1.setPlanNextWeek("Làm tiếp chức năng quản lý");

        report2 = new WeeklyReport();
        report2.setReportId(UUID.randomUUID());
        report2.setTasksCompleted("Hoàn thành chức năng đăng nhập");
        report2.setIssuesChallenges("Gặp lỗi database");
        report2.setLessonsLearned("Biết thêm về SQL");
        report2.setPlanNextWeek("Tiếp tục làm giao diện");
    }

    @Test
    void computeMaxSimilarity_nullReport_returnsZero() {
        assertEquals(0.0, service.computeMaxSimilarity(null));
    }

    @Test
    void computeMaxSimilarity_emptyText_returnsZero() {
        WeeklyReport emptyReport = new WeeklyReport();
        emptyReport.setReportId(UUID.randomUUID());
        assertEquals(0.0, service.computeMaxSimilarity(emptyReport));
    }

    @Test
    void computeMaxSimilarity_stopWordsOnly_returnsZero() {
        WeeklyReport stopWordsReport = new WeeklyReport();
        stopWordsReport.setReportId(UUID.randomUUID());
        stopWordsReport.setTasksCompleted("the a an is are was were be been being and or but"); // English stop words
        stopWordsReport.setLessonsLearned("và của là trong đã"); // Vietnamese stop words

        assertEquals(0.0, service.computeMaxSimilarity(stopWordsReport));
    }

    @Test
    void computeMaxSimilarity_exceptionWhenFetchingAll_returnsZero() {
        when(repository.findAll()).thenThrow(new RuntimeException("Database down"));
        assertEquals(0.0, service.computeMaxSimilarity(report1));
    }

    @Test
    void computeMaxSimilarity_noOtherReports_returnsZero() {
        when(repository.findAll()).thenReturn(List.of(report1)); // Only itself
        assertEquals(0.0, service.computeMaxSimilarity(report1));
    }

    @Test
    void computeMaxSimilarity_exactMatch_returnsOne() {
        WeeklyReport identicalReport = new WeeklyReport();
        identicalReport.setReportId(UUID.randomUUID()); // Different ID
        identicalReport.setTasksCompleted(report1.getTasksCompleted());
        identicalReport.setIssuesChallenges(report1.getIssuesChallenges());
        identicalReport.setLessonsLearned(report1.getLessonsLearned());
        identicalReport.setPlanNextWeek(report1.getPlanNextWeek());

        when(repository.findAll()).thenReturn(List.of(report1, identicalReport));

        assertEquals(1.0, service.computeMaxSimilarity(report1), 0.001);
    }

    @Test
    void computeMaxSimilarity_partialMatch_returnsCorrectJaccard() {
        // report1 text: "Tôi đã hoàn thành chức năng đăng nhập và đăng ký Không có khó khăn gì lớn Học được cách dùng
        // JWT Làm tiếp chức năng quản lý"
        // After removing stopwords (<3 chars or in stop list):
        // hoàn, thành, chức, năng, đăng, nhập, ký, không, khó, khăn, lớn, học, được, cách, dùng, jwt, làm, tiếp, chức,
        // năng, quản, lý

        // Let's use simpler text for deterministic partial match testing
        WeeklyReport rA = new WeeklyReport();
        rA.setReportId(UUID.randomUUID());
        rA.setTasksCompleted("apple banana orange grape");

        WeeklyReport rB = new WeeklyReport();
        rB.setReportId(UUID.randomUUID());
        rB.setTasksCompleted("apple banana mango peach");

        // Tokens for rA: "apple", "banana", "orange", "grape" (4 tokens)
        // Tokens for rB: "apple", "banana", "mango", "peach" (4 tokens)
        // Intersection: "apple", "banana" (2 tokens)
        // Union: "apple", "banana", "orange", "grape", "mango", "peach" (6 tokens)
        // Jaccard = 2 / 6 = 0.3333333333333333

        when(repository.findAll()).thenReturn(List.of(rA, rB));

        assertEquals(0.3333333, service.computeMaxSimilarity(rA), 0.001);
    }

    @Test
    void computeMaxSimilarity_ignoresHtmlTags() {
        WeeklyReport htmlReport = new WeeklyReport();
        htmlReport.setReportId(UUID.randomUUID());
        htmlReport.setTasksCompleted("<p>apple banana</p>");

        WeeklyReport plainReport = new WeeklyReport();
        plainReport.setReportId(UUID.randomUUID());
        plainReport.setTasksCompleted("apple banana");

        when(repository.findAll()).thenReturn(List.of(htmlReport, plainReport));

        assertEquals(1.0, service.computeMaxSimilarity(htmlReport), 0.001);
    }
}
