package com.ueims.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ueims.model.entity.Interview;
import com.ueims.repository.InterviewRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class TempInterviewFixController {
    private final InterviewRepository repository;

    @GetMapping("/api/public/temp-fix-interviews")
    public String fixInterviews() {
        List<Interview> list = repository.findAll();
        for (Interview i : list) {
            if ("SCHEDULED".equals(i.getStatus())) {
                i.setScheduledTime(LocalDateTime.now().minusHours(1));
                repository.save(i);
            }
        }
        return "OK - Set all SCHEDULED interviews to 1 hour ago.";
    }
}
