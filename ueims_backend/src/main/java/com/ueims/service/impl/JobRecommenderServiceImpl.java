package com.ueims.service.impl;

import java.util.*;

import org.springframework.stereotype.Service;

import com.ueims.service.JobRecommenderService;

@Service
public class JobRecommenderServiceImpl implements JobRecommenderService {

    @Override
    public double calculateCompatibility(String studentSkills, String jobSkills) {
        if (studentSkills == null
                || studentSkills.trim().isEmpty()
                || jobSkills == null
                || jobSkills.trim().isEmpty()) {
            return 0.0;
        }

        // Tokenize and normalize
        List<String> studentTokens = tokenize(studentSkills);
        List<String> jobTokens = tokenize(jobSkills);

        if (studentTokens.isEmpty() || jobTokens.isEmpty()) {
            return 0.0;
        }

        // TF-IDF simplified: We will build a unified dictionary of unique terms
        Set<String> dictionary = new HashSet<>();
        dictionary.addAll(studentTokens);
        dictionary.addAll(jobTokens);

        // Vector A (Student), Vector B (Job)
        List<Double> vectorA = new ArrayList<>();
        List<Double> vectorB = new ArrayList<>();

        for (String term : dictionary) {
            double tfA = getTermFrequency(term, studentTokens);
            double tfB = getTermFrequency(term, jobTokens);

            vectorA.add(tfA);
            vectorB.add(tfB);
        }

        return cosineSimilarity(vectorA, vectorB);
    }

    private List<String> tokenize(String text) {
        String[] tokens = text.toLowerCase().replaceAll("[^a-z0-9+#]", " ").split("\\s+");
        List<String> list = new ArrayList<>();
        for (String t : tokens) {
            if (!t.isBlank()) {
                list.add(t);
            }
        }
        return list;
    }

    private double getTermFrequency(String term, List<String> doc) {
        long count = doc.stream().filter(t -> t.equals(term)).count();
        return (double) count / doc.size();
    }

    private double cosineSimilarity(List<Double> vectorA, List<Double> vectorB) {
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vectorA.size(); i++) {
            dotProduct += vectorA.get(i) * vectorB.get(i);
            normA += Math.pow(vectorA.get(i), 2);
            normB += Math.pow(vectorB.get(i), 2);
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
