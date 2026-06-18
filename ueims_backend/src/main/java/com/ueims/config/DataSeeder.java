package com.ueims.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.Role;
import com.ueims.model.entity.StudentProfile;
import com.ueims.model.entity.User;
import com.ueims.model.entity.UserRole;
import com.ueims.model.entity.UserRoleId;
import com.ueims.repository.EnterpriseRepository;
import com.ueims.repository.RoleRepository;
import com.ueims.repository.StudentProfileRepository;
import com.ueims.repository.UserRepository;
import com.ueims.repository.UserRoleRepository;

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

    UserRepository userRepository;
    RoleRepository roleRepository;
    UserRoleRepository userRoleRepository;
    StudentProfileRepository studentProfileRepository;
    EnterpriseRepository enterpriseRepository;
    PasswordEncoder passwordEncoder;

    @Value("${app.seed.default-password:defaultPassword}")
    @NonFinal
    String defaultPassword;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedUsers();
    }

    private void seedUsers() {
        seedUser("tm@ueims.edu.vn", "Angie Do", "TRAINING_MANAGER", "Training Manager Role");
        seedUser("sv_test@fpt.edu.vn", "Test Student 01", "STUDENT", "Student Role");
        seedUser("admin@ueims.vn", "System Admin", "ADMIN", "Admin Role");
        seedUser("enterprise@ueims.test", "Enterprise Test", "ENTERPRISE", "Enterprise Role");
    }

    private void seedUser(String email, String fullName, String roleName, String roleDesc) {
        if (!userRepository.existsByEmail(email)) {
            log.info("Seeding {} Account...", email);

            Role role = roleRepository.findById(roleName).orElseGet(() -> {
                Role r = Role.builder().roleName(roleName).description(roleDesc).build();
                return roleRepository.save(r);
            });

            User user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(defaultPassword))
                    .fullName(fullName)
                    .status("ACTIVE")
                    .mustChangePassword(false)
                    .build();

            user = userRepository.save(user);

            UserRole userRole = UserRole.builder()
                    .id(new UserRoleId(user.getUserId(), role.getRoleName()))
                    .user(user)
                    .role(role)
                    .build();

            userRoleRepository.save(userRole);

            if ("STUDENT".equals(roleName)) {
                StudentProfile profile = StudentProfile.builder()
                        .user(user)
                        .studentCode("HE" + System.currentTimeMillis() % 100000)
                        .major("Computer Science")
                        .build();
                studentProfileRepository.save(profile);
                log.info("Successfully seeded StudentProfile for {}.", email);
            } else if ("ENTERPRISE".equals(roleName)) {
                Enterprise enterprise = Enterprise.builder()
                        .companyName("FPT Software")
                        .taxCode("TAX" + System.currentTimeMillis() % 100000)
                        .address("Hòa Lạc, HN")
                        .status("APPROVED")
                        .build();
                enterprise = enterpriseRepository.save(enterprise);

                user.setEnterprise(enterprise);
                userRepository.save(user);

                log.info("Successfully seeded Enterprise profile for {}.", email);
            }

            log.info("Successfully seeded {} account.", email);
        }
    }
}
