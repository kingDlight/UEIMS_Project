package com.ueims.service;

public interface JobRecommenderService {
    double calculateCompatibility(String studentSkills, String jobSkills);
}
