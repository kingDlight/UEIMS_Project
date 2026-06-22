package com.ueims.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TempController {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/api/public/temp/fix-user")
    public String fixUser() {
        try {
            int userRows = jdbcTemplate.update(
                    "UPDATE users SET full_name = 'Nguyễn Duy Quang' WHERE email LIKE '%duyquangdn522005%'");

            jdbcTemplate.execute("ALTER TABLE eligible_students DISABLE TRIGGER ALL");
            int profileRows1 = jdbcTemplate.update(
                    "UPDATE eligible_students SET current_semester = 5, is_locked = false WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE '%duyquangdn522005%')");
            jdbcTemplate.execute("ALTER TABLE eligible_students ENABLE TRIGGER ALL");

            return "Fixed User! Updated " + userRows + " user(s), " + profileRows1 + " eligible by user_id.";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    @GetMapping("/api/public/temp/test-interviews")
    public String testInterviews() {
        try {
            jdbcTemplate.queryForList("SELECT result_note FROM interviews LIMIT 1");
            return "Success: result_note exists!";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    @Autowired
    private com.ueims.repository.InterviewRepository interviewRepository;

    @Autowired
    private com.ueims.mapper.InterviewMapper interviewMapper;

    @GetMapping("/api/public/temp/test-cancel-mapper")
    public String testMapper() {
        try {
            java.util.UUID id = java.util.UUID.fromString("5d14e0ec-6711-4293-be1f-5157aa9c5c28");
            com.ueims.model.entity.Interview existing =
                    interviewRepository.findById(id).orElse(null);
            if (existing == null) return "Interview not found";
            interviewMapper.toDto(existing);
            return "Mapper success";
        } catch (Exception e) {
            StringBuilder sb = new StringBuilder(e.toString());
            for (StackTraceElement ste : e.getStackTrace()) {
                sb.append("\n\tat ").append(ste.toString());
            }
            return sb.toString();
        }
    }
}
