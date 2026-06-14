package com.ueims.config;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.Role;
import com.ueims.model.entity.User;
import com.ueims.model.entity.UserRole;
import com.ueims.model.entity.UserRoleId;
import com.ueims.repository.ApplicationRepository;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.EnterpriseEvaluationRepository;
import com.ueims.repository.EnterpriseRepository;
import com.ueims.repository.FinalReportRepository;
import com.ueims.repository.IncidentRepository;
import com.ueims.repository.InternshipPlanItemRepository;
import com.ueims.repository.InternshipPlanRepository;
import com.ueims.repository.JobPostRepository;
import com.ueims.repository.RoleRepository;
import com.ueims.repository.SemesterEnterpriseRepository;
import com.ueims.repository.StudentEnterpriseFeedbackRepository;
import com.ueims.repository.UserRepository;
import com.ueims.repository.UserRoleRepository;
import com.ueims.repository.WeeklyReportRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DataSeeder implements CommandLineRunner {

    ApplicationRepository applicationRepository;
    EnterpriseAssignmentRepository enterpriseAssignmentRepository;
    EnterpriseEvaluationRepository enterpriseEvaluationRepository;
    EnterpriseRepository enterpriseRepository;
    FinalReportRepository finalReportRepository;
    IncidentRepository incidentRepository;
    InternshipPlanItemRepository internshipPlanItemRepository;
    InternshipPlanRepository internshipPlanRepository;
    JobPostRepository jobPostRepository;
    SemesterEnterpriseRepository semesterEnterpriseRepository;
    StudentEnterpriseFeedbackRepository studentEnterpriseFeedbackRepository;
    UserRepository userRepository;
    RoleRepository roleRepository;
    UserRoleRepository userRoleRepository;
    WeeklyReportRepository weeklyReportRepository;
    PasswordEncoder passwordEncoder;

    @Value("${app.seed.default-password:defaultPassword}")
    @NonFinal
    String defaultPassword;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Cleaning up old mock enterprises from previous seed...");
        enterpriseRepository.findAll().forEach(e -> {
            if (Arrays.asList("FPT Software", "VNG Corporation", "NashTech Vietnam", "TMA Solutions")
                    .contains(e.getCompanyName())) {
                log.info("Deleting enterprise: {} ({})", e.getCompanyName(), e.getEnterpriseId());
                UUID enterpriseId = e.getEnterpriseId();

                // --- Delete in correct FK dependency order ---

                // 1. Get all assignment IDs for this enterprise (needed for child-of-assignment deletes)
                List<EnterpriseAssignment> assignments =
                        enterpriseAssignmentRepository.findByEnterprise_EnterpriseId(enterpriseId);
                List<UUID> assignmentIds = assignments.stream()
                        .map(EnterpriseAssignment::getAssignmentId)
                        .collect(Collectors.toList());

                // 2. Delete children of EnterpriseAssignment (Assignment -> X chain)
                if (!assignmentIds.isEmpty()) {
                    // 2a. InternshipPlanItems -> InternshipPlans (via planId)
                    List<UUID> planIds =
                            internshipPlanRepository.findByAssignment_AssignmentIdIn(assignmentIds).stream()
                                    .map(p -> p.getPlanId())
                                    .collect(Collectors.toList());
                    if (!planIds.isEmpty()) {
                        internshipPlanItemRepository.deleteByPlan_PlanIdIn(planIds);
                    }
                    internshipPlanRepository
                            .findByAssignment_AssignmentIdIn(assignmentIds)
                            .forEach(p -> internshipPlanRepository.delete(p));

                    // 2b. WeeklyReports
                    weeklyReportRepository.deleteByAssignment_AssignmentIdIn(assignmentIds);

                    // 2c. FinalReports
                    finalReportRepository.deleteByAssignment_AssignmentIdIn(assignmentIds);

                    // 2d. EnterpriseEvaluations
                    enterpriseEvaluationRepository.deleteByAssignment_AssignmentIdIn(assignmentIds);

                    // 2e. Incidents
                    incidentRepository
                            .findByAssignment_AssignmentIdIn(assignmentIds)
                            .forEach(i -> incidentRepository.delete(i));
                }

                // 3. Delete Applications (via job_post -> enterprise)
                applicationRepository.deleteByJobPost_Enterprise_EnterpriseId(enterpriseId);

                // 4. Delete JobPosts
                jobPostRepository.deleteByEnterprise_EnterpriseId(enterpriseId);

                // 5. Delete StudentEnterpriseFeedbacks
                studentEnterpriseFeedbackRepository.deleteByEnterprise_EnterpriseId(enterpriseId);

                // 6. Delete SemesterEnterprises
                semesterEnterpriseRepository.deleteById_EnterpriseId(enterpriseId);

                // 7. Delete Users linked to this enterprise
                userRepository.findByEnterprise_EnterpriseId(enterpriseId).forEach(u -> userRepository.delete(u));

                // 8. Delete the Enterprise
                enterpriseRepository.delete(e);
                log.info("Deleted enterprise: {}", e.getCompanyName());
            }
        });
        seedUsers();
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("tm@ueims.edu.vn")) {
            log.info("Seeding Training Manager Account...");

            Role tmRole = roleRepository.findById("TRAINING_MANAGER").orElseGet(() -> {
                Role role = Role.builder()
                        .roleName("TRAINING_MANAGER")
                        .description("Training Manager Role")
                        .build();
                return roleRepository.save(role);
            });

            User tmUser = User.builder()
                    .email("tm@ueims.edu.vn")
                    .password(passwordEncoder.encode(defaultPassword))
                    .fullName("Angie Do")
                    .phone("0987654321")
                    .status("ACTIVE")
                    .mustChangePassword(false)
                    .build();

            tmUser = userRepository.save(tmUser);

            UserRole userRole = UserRole.builder()
                    .id(new UserRoleId(tmUser.getUserId(), tmRole.getRoleName()))
                    .user(tmUser)
                    .role(tmRole)
                    .build();

            userRoleRepository.save(userRole);
            log.info("Successfully seeded Training Manager account.");
        }
    }
}
