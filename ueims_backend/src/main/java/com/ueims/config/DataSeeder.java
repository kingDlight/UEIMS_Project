package com.ueims.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.Role;
import com.ueims.model.entity.User;
import com.ueims.model.entity.UserRole;
import com.ueims.model.entity.UserRoleId;
import com.ueims.repository.EnterpriseRepository;
import com.ueims.repository.RoleRepository;
import com.ueims.repository.UserRepository;
import com.ueims.repository.UserRoleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final EnterpriseRepository enterpriseRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.default-password:defaultPassword}")
    private String defaultPassword;

    @Override
    public void run(String... args) throws Exception {
        seedEnterprises();
        seedUsers();
    }

    private void seedEnterprises() {
        if (enterpriseRepository.count() == 0) {
            log.info("Seeding Mock Enterprises into Database...");

            Enterprise ent1 = Enterprise.builder()
                    .companyName("FPT Software")
                    .taxCode("0309123456")
                    .industry("IT Outsourcing")
                    .address("FPT Complex, Nam Ky Khoi Nghia, Da Nang")
                    .status("APPROVED")
                    .contactPerson("Nguyen Van A")
                    .contactEmail("contact@fpt.com")
                    .build();

            Enterprise ent2 = Enterprise.builder()
                    .companyName("VNG Corporation")
                    .taxCode("0312456789")
                    .industry("Game & Tech")
                    .address("Z06, Z11, Tan Thuan Dong, District 7, HCMC")
                    .status("PENDING")
                    .contactPerson("Tran Thi B")
                    .contactEmail("hr@vng.com")
                    .build();

            Enterprise ent3 = Enterprise.builder()
                    .companyName("NashTech Vietnam")
                    .taxCode("0102789123")
                    .industry("Software Services")
                    .address("Duy Tan, Cau Giay, Ha Noi")
                    .status("REJECTED")
                    .rejectionReason("Incomplete legal documents")
                    .contactPerson("Le Van C")
                    .contactEmail("careers@nashtech.com")
                    .build();

            Enterprise ent4 = Enterprise.builder()
                    .companyName("TMA Solutions")
                    .taxCode("0301456987")
                    .industry("IT Outsourcing")
                    .address("Quang Trung Software City, HCMC")
                    .status("APPROVED")
                    .contactPerson("Pham Thi D")
                    .contactEmail("recruit@tma.com")
                    .build();

            enterpriseRepository.saveAll(Arrays.asList(ent1, ent2, ent3, ent4));
            log.info("Successfully seeded 4 Enterprises.");
        }
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
