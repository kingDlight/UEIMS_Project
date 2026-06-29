package com.ueims.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import com.ueims.dto.request.EnterpriseRegistrationRequest;
import com.ueims.dto.request.JobPostRequest;
import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.User;
import com.ueims.repository.EnterpriseRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.repository.UserRepository;

public class EnterpriseWorkflowIT extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EnterpriseRepository enterpriseRepository;

    @Autowired
    private SemesterRepository semesterRepository;

    @Autowired
    private com.ueims.repository.RoleRepository roleRepository;

    private User manager;
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

        // 1. Create Training Manager
        manager = User.builder()
                .email("manager@fpt.edu.vn")
                .fullName("Training Manager")
                .status("ACTIVE")
                .password("password")
                .mustChangePassword(false)
                .build();
        manager = userRepository.save(manager);

        // 2. Create Semester
        semester = Semester.builder()
                .semesterCode("FA26")
                .name("Fall 2026")
                .startDate(LocalDate.now().minusDays(10))
                .endDate(LocalDate.now().plusMonths(3))
                .status("ACTIVE")
                .createdBy(manager)
                .build();
        semester = semesterRepository.save(semester);
    }

    @Test
    void testEndToEndEnterpriseWorkflow() throws Exception {
        // Step 1: Enterprise registers an account (Public endpoint)
        EnterpriseRegistrationRequest regRequest = EnterpriseRegistrationRequest.builder()
                .enterpriseName("FPT Software")
                .taxCode("0123456789")
                .contactPerson("Mr. Minh")
                .email("contact@fpt.com")
                .address("F-Town 3, SHTP")
                .password("Password@123")
                .confirmPassword("Password@123")
                .build();

        String regResponse = mockMvc.perform(post("/api/auth/register-enterprise")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Step 2: Training Manager approves the enterprise
        // We need to fetch the newly created enterprise ID
        User enterpriseUser =
                userRepository.findByEmail("contact@fpt.com").orElseThrow(() -> new AssertionError("User not created"));
        Enterprise enterprise = enterpriseUser.getEnterprise();
        if (enterprise == null) throw new AssertionError("Enterprise profile not created");

        assertEquals("PENDING", enterprise.getStatus()); // Initially pending

        mockMvc.perform(put("/api/enterprises/" + enterprise.getEnterpriseId() + "/status")
                        .with(jwt().jwt(j -> j.subject(manager.getEmail()))
                                .authorities(new SimpleGrantedAuthority("ROLE_TRAINING_MANAGER")))
                        .param("status", "APPROVED")
                        .param("reason", "Verified tax code"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.status").value("APPROVED"));

        // Step 3: Enterprise posts a Job Post
        JobPostRequest jobPostRequest = new JobPostRequest();
        jobPostRequest.setTitle("Frontend Developer Intern");
        jobPostRequest.setDescription("Learn React and Vue");
        jobPostRequest.setPositionsCount(10);
        jobPostRequest.setApplicationDeadline(LocalDate.now().plusDays(30));

        JobPostRequest.SemesterRef semesterRef = new JobPostRequest.SemesterRef();
        semesterRef.setSemesterId(semester.getSemesterId());
        jobPostRequest.setSemester(semesterRef);

        mockMvc.perform(post("/api/job-posts")
                        .with(jwt().jwt(j -> j.subject(enterpriseUser.getEmail()))
                                .authorities(new SimpleGrantedAuthority("ROLE_ENTERPRISE")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(jobPostRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.title").value("Frontend Developer Intern"));
    }
}
