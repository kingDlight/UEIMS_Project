package com.ueims.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.ueims.model.entity.Role;
import com.ueims.model.entity.User;
import com.ueims.model.entity.UserRole;
import com.ueims.model.entity.UserRoleId;
import com.ueims.repository.EnterpriseRepository;
import com.ueims.repository.RoleRepository;
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

    EnterpriseRepository enterpriseRepository;
    UserRepository userRepository;
    RoleRepository roleRepository;
    UserRoleRepository userRoleRepository;
    PasswordEncoder passwordEncoder;

    @Value("${app.seed.default-password:defaultPassword}")
    @NonFinal
    String defaultPassword;

    @Override
    public void run(String... args) throws Exception {
        log.info("Cleaning up old mock enterprises from previous seed...");
        enterpriseRepository.findAll().forEach(e -> {
            if (Arrays.asList("FPT Software", "VNG Corporation", "NashTech Vietnam", "TMA Solutions")
                    .contains(e.getCompanyName())) {
                enterpriseRepository.delete(e);
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
