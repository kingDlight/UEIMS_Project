package com.ueims.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import com.ueims.dto.request.ApplicationRequest;
import com.ueims.dto.request.InterviewRequest;
import com.ueims.dto.request.WeeklyReportRequest;
import com.ueims.model.entity.EligibleStudent;
import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.Interview;
import com.ueims.model.entity.JobPost;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.StudentProfile;
import com.ueims.model.entity.User;
import com.ueims.repository.ApplicationRepository;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.EnterpriseRepository;
import com.ueims.repository.InterviewRepository;
import com.ueims.repository.JobPostRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.repository.StudentProfileRepository;
import com.ueims.repository.UserRepository;

public class StudentOjtWorkflowIT extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private EnterpriseRepository enterpriseRepository;

    @Autowired
    private SemesterRepository semesterRepository;

    @Autowired
    private JobPostRepository jobPostRepository;

    @Autowired
    private EligibleStudentRepository eligibleStudentRepository;

    @Autowired
    private com.ueims.repository.RoleRepository roleRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private EnterpriseAssignmentRepository enterpriseAssignmentRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    private User student;
    private User enterpriseUser;
    private JobPost jobPost;
    private Semester semester;

    @BeforeEach
    void setupWorkflowData() {
        // 0. Create Roles
        roleRepository.save(com.ueims.model.entity.Role.builder()
                .roleName("ENTERPRISE")
                .description("Enterprise Role")
                .build());
        roleRepository.save(com.ueims.model.entity.Role.builder()
                .roleName("TRAINING_MANAGER")
                .description("Training Manager Role")
                .build());
        roleRepository.save(com.ueims.model.entity.Role.builder()
                .roleName("STUDENT")
                .description("Student Role")
                .build());

        // 1. Create User for createdBy
        User adminUser = User.builder()
                .email("admin@fpt.edu.vn")
                .fullName("Admin User")
                .status("ACTIVE")
                .password("password")
                .mustChangePassword(false)
                .build();
        adminUser = userRepository.save(adminUser);

        // 2. Create Semester
        semester = Semester.builder()
                .semesterCode("FA26")
                .name("Fall 2026")
                .startDate(LocalDate.now().minusDays(3))
                .endDate(LocalDate.now().plusMonths(3))
                .status("ACTIVE")
                .createdBy(adminUser)
                .build();
        semester = semesterRepository.save(semester);

        // 2. Create Student
        student = User.builder()
                .email("student_it@fpt.edu.vn")
                .fullName("IT Student")
                .status("ACTIVE")
                .password("password")
                .mustChangePassword(false)
                .build();
        student = userRepository.save(student);

        StudentProfile profile = StudentProfile.builder()
                .user(student)
                .major("SE")
                .studentCode("SE123456")
                .cvFileUrl("http://cv.url")
                .build();
        studentProfileRepository.save(profile);

        // 3. Mark Student Eligible
        EligibleStudent eligible = EligibleStudent.builder()
                .user(student)
                .semester(semester)
                .studentCode("SE123456")
                .fullName("IT Student")
                .major("SE")
                .gpa(new java.math.BigDecimal("8.5"))
                .currentSemester(5)
                .status("ELIGIBLE")
                .build();
        eligibleStudentRepository.save(eligible);

        Enterprise enterprise = Enterprise.builder()
                .companyName("IT Company")
                .taxCode("TEST_TAX_123")
                .status("APPROVED")
                .build();
        enterprise = enterpriseRepository.save(enterprise);

        // 4. Create Enterprise
        enterpriseUser = User.builder()
                .email("enterprise_it@fpt.edu.vn")
                .fullName("IT Enterprise User")
                .status("ACTIVE")
                .password("password")
                .enterprise(enterprise)
                .mustChangePassword(false)
                .build();
        enterpriseUser = userRepository.save(enterpriseUser);

        // 5. Create Job Post
        jobPost = JobPost.builder()
                .enterprise(enterprise)
                .semester(semester)
                .title("Intern Software Engineer")
                .description("Awesome job")
                .status("OPEN")
                .positionsCount(5)
                .applicationDeadline(LocalDate.now().plusDays(30))
                .build();
        jobPost = jobPostRepository.save(jobPost);
    }

    @Test
    void testEndToEndStudentOjtWorkflow() throws Exception {
        // Step 1: Student applies for JobPost
        ApplicationRequest appRequest = ApplicationRequest.builder()
                .jobPostId(jobPost.getJobPostId())
                .cvFileUrl("http://my.cv.pdf")
                .cvFileSize(1024L)
                .coverLetter("I want to work here")
                .build();

        String appResponse = mockMvc.perform(post("/api/applications")
                        .with(jwt().jwt(j -> j.subject(student.getEmail()))
                                .authorities(new SimpleGrantedAuthority("ROLE_STUDENT")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(appRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Extract applicationId from response (assuming JSON)
        String applicationIdStr = objectMapper
                .readTree(appResponse)
                .get("result")
                .get("applicationId")
                .asText();
        UUID applicationId = UUID.fromString(applicationIdStr);

        // Step 2: Enterprise schedules an interview
        InterviewRequest interviewReq = InterviewRequest.builder()
                .applicationId(applicationId)
                .scheduledTime(LocalDateTime.now().plusDays(2).withNano(0))
                .durationMinutes(45)
                .location("Online Zoom")
                .meetingLink("http://zoom.us")
                .status("SCHEDULED")
                .build();

        String interviewResponse = mockMvc.perform(post("/api/interviews")
                        .with(jwt().jwt(j -> j.subject(enterpriseUser.getEmail()))
                                .authorities(new SimpleGrantedAuthority("ROLE_ENTERPRISE")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(interviewReq)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String interviewIdStr =
                objectMapper.readTree(interviewResponse).get("interviewId").asText();
        UUID interviewId = UUID.fromString(interviewIdStr);

        // Simulate time passing for the interview so we can record result
        Interview interviewEntity = interviewRepository.findById(interviewId).orElseThrow();
        interviewEntity.setScheduledTime(LocalDateTime.now().minusDays(1));
        interviewRepository.saveAndFlush(interviewEntity);

        // Step 3: Enterprise records interview result
        mockMvc.perform(post("/api/interviews/" + interviewId + "/record-result")
                        .with(jwt().jwt(j -> j.subject(enterpriseUser.getEmail()))
                                .authorities(new SimpleGrantedAuthority("ROLE_ENTERPRISE")))
                        .param("result", "PASS")
                        .param("notes", "Great candidate"))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("PASS"));

        // Step 4: Verify auto-generated EnterpriseAssignment
        EnterpriseAssignment assignment = enterpriseAssignmentRepository.findAll().stream()
                .filter(a -> a.getStudent().getUserId().equals(student.getUserId()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Assignment not auto-created"));

        assertEquals("ACTIVE", assignment.getStatus());

        // Promote student to Semester 6 for OJT
        eligibleStudentRepository.findAll().forEach(e -> {
            e.setCurrentSemester(6);
            eligibleStudentRepository.saveAndFlush(e);
        });

        // Step 5: Student submits Weekly Report
        WeeklyReportRequest reportReq = WeeklyReportRequest.builder()
                .assignmentId(assignment.getAssignmentId())
                .weekNumber(1)
                .tasksCompleted("Did Java tests")
                .issuesChallenges("None")
                .planNextWeek("More tests")
                .build();

        String reportResponse = mockMvc.perform(post("/api/weekly-reports")
                        .with(jwt().jwt(j -> j.subject(student.getEmail()))
                                .authorities(new SimpleGrantedAuthority("ROLE_STUDENT")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reportReq)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String reportIdStr =
                objectMapper.readTree(reportResponse).get("reportId").asText();

        // Step 6: Enterprise approves Weekly Report
        WeeklyReportRequest approveReq =
                WeeklyReportRequest.builder().feedback("Good job").build();

        mockMvc.perform(put("/api/weekly-reports/" + reportIdStr + "/approve")
                        .with(jwt().jwt(j -> j.subject(enterpriseUser.getEmail()))
                                .authorities(new SimpleGrantedAuthority("ROLE_ENTERPRISE")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approveReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.feedback").value("Good job"));
    }
}
