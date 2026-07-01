package com.ueims.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.model.entity.Role;
import com.ueims.model.entity.User;
import com.ueims.model.entity.UserRole;
import com.ueims.model.entity.UserRoleId;
import com.ueims.repository.RoleRepository;
import com.ueims.repository.UserRepository;
import com.ueims.repository.UserRoleRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

// DISABLED — seed data is managed by SQL/016_seed_realistic_data.sql
// To re-enable: add @Component back and set app.seed.enabled=true in properties
// @Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DataSeeder implements CommandLineRunner {

    UserRepository userRepository;
    RoleRepository roleRepository;
    UserRoleRepository userRoleRepository;
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
