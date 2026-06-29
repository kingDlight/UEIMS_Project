package com.ueims.integration;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import com.ueims.dto.request.SemesterCreationRequest;
import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.Role;
import com.ueims.model.entity.User;
import com.ueims.repository.EnterpriseRepository;
import com.ueims.repository.JobPostRepository;
import com.ueims.repository.RoleRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.repository.UserRepository;

public class TrainingManagerWorkflowIT extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private SemesterRepository semesterRepository;

    @Autowired
    private EnterpriseRepository enterpriseRepository;

    @Autowired
    private JobPostRepository jobPostRepository;

    private User tmUser;
    private User enterpriseUser;

    @BeforeEach
    void setUp() {
        roleRepository.save(Role.builder()
                .roleName("TRAINING_MANAGER")
                .description("TM Role")
                .build());
        roleRepository.save(Role.builder()
                .roleName("ENTERPRISE")
                .description("Enterprise Role")
                .build());

        // 1. Create TM User
        tmUser = User.builder()
                .email("tm@fpt.edu.vn")
                .fullName("Training Manager")
                .status("ACTIVE")
                .password("password")
                .mustChangePassword(false)
                .build();
        tmUser = userRepository.save(tmUser);
    }

    @Test
    void testEndToEndTrainingManagerWorkflow() throws Exception {
        // Step 1: TM Creates a Semester
        SemesterCreationRequest semesterReq = SemesterCreationRequest.builder()
                .semesterCode("SP27")
                .name("Spring 2027")
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().plusMonths(3))
                .build();

        String semesterRes = mockMvc.perform(post("/api/semesters")
                        .with(jwt().jwt(j -> j.subject(tmUser.getEmail()))
                                .authorities(new SimpleGrantedAuthority("ROLE_TRAINING_MANAGER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(semesterReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.semesterCode").value("SP27"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String semesterIdStr =
                objectMapper.readTree(semesterRes).get("semesterId").asText();

        // Step 2: TM Opens the Semester
        mockMvc.perform(put("/api/semesters/" + semesterIdStr + "/open")
                        .with(jwt().jwt(j -> j.subject(tmUser.getEmail()))
                                .authorities(new SimpleGrantedAuthority("ROLE_TRAINING_MANAGER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OPEN"));

        // Step 3: Enterprise Registers
        EnterpriseRegistrationRequest regReq = EnterpriseRegistrationRequest.builder()
                .email("hr@newenterprise.com")
                .password("Test!234")
                .confirmPassword("Test!234")
                .enterpriseName("New Enterprise")
                .taxCode("123456789")
                .contactPerson("Mr. Rep")
                .address("123 Street")
                .build();

        mockMvc.perform(post("/api/auth/register-enterprise")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1036));

        // Get created Enterprise User
        enterpriseUser = userRepository.findByEmail("hr@newenterprise.com").orElseThrow();
        Enterprise enterprise = enterpriseUser.getEnterprise();
        assertNotNull(enterprise);

        // Step 4: TM Approves Enterprise
        mockMvc.perform(put("/api/enterprises/" + enterprise.getEnterpriseId() + "/status")
                        .with(jwt().jwt(j -> j.subject(tmUser.getEmail()))
                                .authorities(new SimpleGrantedAuthority("ROLE_TRAINING_MANAGER")))
                        .param("status", "APPROVED")
                        .param("reason", "All good"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.status").value("APPROVED"));

        // Step 5: Enterprise creates JobPost
        JobPostRequest jobReq = new JobPostRequest();
        jobReq.setTitle("Backend Dev");
        jobReq.setDescription("Java coding");
        jobReq.setRequirements("Java");
        jobReq.setPositionsCount(5);
        JobPostRequest.SemesterRef semRef = new JobPostRequest.SemesterRef();
        semRef.setSemesterId(java.util.UUID.fromString(semesterIdStr));
        jobReq.setSemester(semRef);
        jobReq.setApplicationDeadline(LocalDate.now().plusDays(10));

        String jobRes = mockMvc.perform(post("/api/job-posts")
                        .with(jwt().jwt(j -> j.subject(enterpriseUser.getEmail()))
                                .authorities(new SimpleGrantedAuthority("ROLE_ENTERPRISE")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(jobReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.title").value("Backend Dev"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String jobIdStr =
                objectMapper.readTree(jobRes).get("result").get("jobPostId").asText();

        // Step 6: TM views Command Center Summary
        mockMvc.perform(get("/api/dashboard/command-center-summary")
                        .with(jwt().jwt(j -> j.subject(tmUser.getEmail()))
                                .authorities(new SimpleGrantedAuthority("ROLE_TRAINING_MANAGER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").exists());
    }
}
