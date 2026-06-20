package com.ueims.service.impl;

import java.util.regex.Pattern;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.dto.request.EnterpriseRegistrationRequest;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.User;
import com.ueims.model.entity.UserRole;
import com.ueims.model.entity.UserRoleId;
import com.ueims.repository.EnterpriseRepository;
import com.ueims.repository.RoleRepository;
import com.ueims.repository.UserRepository;
import com.ueims.repository.UserRoleRepository;
import com.ueims.service.EnterpriseRegistrationService;
import com.ueims.service.MailService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EnterpriseRegistrationServiceImpl implements EnterpriseRegistrationService {
    private static final String ENTERPRISE_ROLE = "ENTERPRISE";

    EnterpriseRepository enterpriseRepository;
    UserRepository userRepository;
    UserRoleRepository userRoleRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;
    MailService mailService;

    @Override
    @Transactional
    public void register(EnterpriseRegistrationRequest request) {
        // 1. Validate password match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.PASSWORDS_NOT_MATCH);
        }

        // 2. Validate BR-04: uppercase, lowercase, number, special char, min 8
        validatePasswordComplexity(request.getPassword());

        // 3. Check email not already registered
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        // 4. Check tax code not already registered
        if (enterpriseRepository.existsByTaxCode(request.getTaxCode())) {
            throw new AppException(ErrorCode.TAX_CODE_EXISTED);
        }

        // 5. Create Enterprise entity (status PENDING)
        Enterprise enterprise = Enterprise.builder()
                .companyName(request.getEnterpriseName())
                .taxCode(request.getTaxCode())
                .address(request.getAddress())
                .contactPerson(request.getContactPerson())
                .contactEmail(request.getEmail())
                .status("PENDING")
                .build();
        enterprise = enterpriseRepository.save(enterprise);

        // 6. Create User entity
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getContactPerson())
                .status("ACTIVE")
                .mustChangePassword(false)
                .enterprise(enterprise)
                .build();
        user = userRepository.save(user);

        // 7. Assign ENTERPRISE role to user
        var role = roleRepository.findById(ENTERPRISE_ROLE).orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY));
        UserRole userRole = UserRole.builder()
                .id(new UserRoleId(user.getUserId(), ENTERPRISE_ROLE))
                .user(user)
                .role(role)
                .build();
        userRoleRepository.save(userRole);

        // 8. Send welcome email
        mailService.sendWelcomeMail(user.getEmail(), user.getFullName(), request.getPassword());
    }

    private void validatePasswordComplexity(String password) {
        if (password.length() < 8) {
            throw new AppException(ErrorCode.INVALID_PASSWORD, "Password must be at least 8 characters");
        }
        if (!Pattern.compile("[A-Z]").matcher(password).find()) {
            throw new AppException(ErrorCode.INVALID_PASSWORD, "Password must contain at least 1 uppercase letter");
        }
        if (!Pattern.compile("[a-z]").matcher(password).find()) {
            throw new AppException(ErrorCode.INVALID_PASSWORD, "Password must contain at least 1 lowercase letter");
        }
        if (!Pattern.compile("\\d").matcher(password).find()) {
            throw new AppException(ErrorCode.INVALID_PASSWORD, "Password must contain at least 1 number");
        }
        if (!Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]")
                .matcher(password)
                .find()) {
            throw new AppException(
                    ErrorCode.INVALID_PASSWORD, "Password must contain at least 1 special character (!@#$%^&*...)");
        }
    }
}
