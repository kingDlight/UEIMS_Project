package com.ueims.service.impl;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.WeeklyReport;
import com.ueims.repository.WeeklyReportRepository;
import com.ueims.service.PlagiarismDetectionService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PlagiarismDetectionServiceImpl implements PlagiarismDetectionService {
    WeeklyReportRepository repository;

    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "the", "a", "an", "is", "are", "was", "were", "be", "been", "being", "and", "or", "but", "so", "of", "to",
            "in", "on", "at", "by", "for", "with", "from", "as", "this", "that", "it", "i", "we", "you", "they", "he",
            "she", "them", "his", "her", "their", "my", "our", "your", "do", "does", "did", "have", "has", "had",
            "will", "would", "should", "could", "can", "may", "might", "must", "shall", "và", "của", "là", "trong",
            "đã"));

    private static Set<String> tokenize(String text) {
        if (text == null || text.isBlank()) return Set.of();
        String[] raw = text.toLowerCase()
                .replaceAll("<[^>]+>", " ")
                .replaceAll("[^\\p{L}\\p{N}\\s]+", " ")
                .split("\\s+");
        Set<String> tokens = new HashSet<>();
        for (String w : raw) {
            if (w.length() < 3) continue;
            if (STOP_WORDS.contains(w)) continue;
            tokens.add(w);
        }
        return tokens;
    }

    private static double jaccard(Set<String> a, Set<String> b) {
        if (a.isEmpty() && b.isEmpty()) return 0.0;
        Set<String> inter = new HashSet<>(a);
        inter.retainAll(b);
        Set<String> union = new HashSet<>(a);
        union.addAll(b);
        if (union.isEmpty()) return 0.0;
        return (double) inter.size() / union.size();
    }

    @Override
    public double computeMaxSimilarity(WeeklyReport report) {
        if (report == null) return 0.0;
        String text = String.join(
                " ",
                nullSafe(report.getTasksCompleted()),
                nullSafe(report.getIssuesChallenges()),
                nullSafe(report.getLessonsLearned()),
                nullSafe(report.getPlanNextWeek()));
        Set<String> tokens = tokenize(text);
        if (tokens.isEmpty()) return 0.0;

        double max = 0.0;
        List<WeeklyReport> all;
        try {
            all = repository.findAll();
        } catch (Exception ex) {
            log.warn("[Plagiarism] failed to load all reports: {}", ex.getMessage());
            return 0.0;
        }
        for (WeeklyReport other : all) {
            if (other.getReportId() == null || other.getReportId().equals(report.getReportId())) {
                continue;
            }
            String otherText = String.join(
                    " ",
                    nullSafe(other.getTasksCompleted()),
                    nullSafe(other.getIssuesChallenges()),
                    nullSafe(other.getLessonsLearned()),
                    nullSafe(other.getPlanNextWeek()));
            Set<String> otherTokens = tokenize(otherText);
            if (otherTokens.isEmpty()) continue;
            double score = jaccard(tokens, otherTokens);
            if (score > max) max = score;
        }
        return max;
    }

    private String nullSafe(String s) {
        return s == null ? "" : s;
    }
}
