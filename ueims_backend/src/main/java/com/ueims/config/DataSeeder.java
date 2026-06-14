package com.ueims.config;

import java.util.Arrays;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.ueims.model.entity.Role;
import com.ueims.model.entity.User;
import com.ueims.model.entity.UserRole;
import com.ueims.model.entity.UserRoleId;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.EnterpriseEvaluationRepository;
import com.ueims.repository.EnterpriseRepository;
import com.ueims.repository.FinalReportRepository;
import com.ueims.repository.IncidentRepository;
import com.ueims.repository.InternshipPlanRepository;
import com.ueims.repository.RoleRepository;
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

    EnterpriseRepository enterpriseRepository;
    EnterpriseAssignmentRepository enterpriseAssignmentRepository;
    UserRepository userRepository;
    RoleRepository roleRepository;
    UserRoleRepository userRoleRepository;
    PasswordEncoder passwordEncoder;
    WeeklyReportRepository weeklyReportRepository;
    FinalReportRepository finalReportRepository;
    EnterpriseEvaluationRepository enterpriseEvaluationRepository;
    IncidentRepository incidentRepository;
    InternshipPlanRepository internshipPlanRepository;
    StudentEnterpriseFeedbackRepository studentEnterpriseFeedbackRepository;

    @Value("${app.seed.default-password:defaultPassword}")
    @NonFinal
    String defaultPassword;

    @Override
    public void run(String... args) throws Exception {
        log.info("Cleaning up old mock enterprises from previous seed...");
        enterpriseRepository.findAll().forEach(e -> {
            if (Arrays.asList("FPT Software", "VNG Corporation", "NashTech Vietnam", "TMA Solutions")
                    .contains(e.getCompanyName())) {
                UUID enterpriseId = e.getEnterpriseId();
                log.info("Processing enterprise: {} (ID: {})", e.getCompanyName(), enterpriseId);

                // Get all assignments for this enterprise
                var assignments = enterpriseAssignmentRepository.findByEnterprise_EnterpriseId(enterpriseId);
                log.info("Found {} enterprise_assignments for enterprise ID: {}", assignments.size(), enterpriseId);

                // Delete all related entities for each assignment (in correct FK order)
                for (var assignment : assignments) {
                    UUID assignmentId = assignment.getAssignmentId();

                    // Delete weekly_reports
                    var weeklyReports = weeklyReportRepository.findByAssignment_AssignmentId(assignmentId);
                    log.info("Found {} weekly_reports for assignment ID: {}", weeklyReports.size(), assignmentId);
                    weeklyReportRepository.deleteAll(weeklyReports);

                    // Delete final_reports
                    finalReportRepository
                            .findByAssignment_AssignmentId(assignmentId)
                            .ifPresent(fr -> {
                                finalReportRepository.delete(fr);
                                log.info("Deleted final_report for assignment ID: {}", assignmentId);
                            });

                    // Delete enterprise_evaluations
                    enterpriseEvaluationRepository
                            .findByAssignment_AssignmentId(assignmentId)
                            .ifPresent(ee -> {
                                enterpriseEvaluationRepository.delete(ee);
                                log.info("Deleted enterprise_evaluation for assignment ID: {}", assignmentId);
                            });

                    // Delete incidents
                    var incidents = incidentRepository.findByAssignment_AssignmentId(assignmentId);
                    incidentRepository.deleteAll(incidents);
                    log.info("Deleted {} incidents for assignment ID: {}", incidents.size(), assignmentId);

                    // Delete internship_plans
                    var plans = internshipPlanRepository.findByAssignment_AssignmentId(assignmentId);
                    internshipPlanRepository.deleteAll(plans);
                    log.info("Deleted {} internship_plans for assignment ID: {}", plans.size(), assignmentId);
                }

                // Delete all assignments
                enterpriseAssignmentRepository.deleteAll(assignments);
                log.info("Deleted all enterprise_assignments for enterprise ID: {}", enterpriseId);

                // Delete student_enterprise_feedbacks for this enterprise
                var feedbacks = studentEnterpriseFeedbackRepository.findByEnterprise_EnterpriseId(enterpriseId);
                studentEnterpriseFeedbackRepository.deleteAll(feedbacks);
                log.info(
                        "Deleted {} student_enterprise_feedbacks for enterprise ID: {}",
                        feedbacks.size(),
                        enterpriseId);

                enterpriseRepository.delete(e);
                log.info("Deleted enterprise: {} (ID: {})", e.getCompanyName(), enterpriseId);
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
