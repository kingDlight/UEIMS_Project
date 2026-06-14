package com.ueims.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.ueims.model.entity.WeeklyReport;

public interface PlagiarismDetectionService {
    /**
     * Compute the maximum Jaccard similarity between the given report and any other report
     * in the system. Returns a value in [0, 1]. A score >= 0.85 triggers the BR-58 red flag.
     */
    double computeMaxSimilarity(WeeklyReport report);
}
