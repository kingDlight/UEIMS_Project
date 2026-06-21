package com.ueims.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.dto.request.EnterpriseRequest;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.User;
import com.ueims.repository.EnterpriseRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.EnterpriseService;
import com.ueims.service.MailService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EnterpriseServiceImpl implements EnterpriseService {
    EnterpriseRepository repository;
    UserRepository userRepository;
    MailService mailService;

    @Override
    public List<Enterprise> findAll() {
        return repository.findAll();
    }

    @Override
    public Enterprise findById(UUID id) {
        Enterprise enterprise =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ENTERPRISE_NOT_FOUND));

        // Kiểm tra quyền xem: Nếu là role Enterprise thì chỉ được xem chính mình
        validateAccess(id);

        return enterprise;
    }

    @Override
    public Enterprise getMyEnterpriseProfile() {
        User currentUser = getCurrentUser();
        if (currentUser.getEnterprise() == null) {
            throw new AppException(ErrorCode.ENTERPRISE_NOT_FOUND);
        }
        return repository
                .findById(currentUser.getEnterprise().getEnterpriseId())
                .orElseThrow(() -> new AppException(ErrorCode.ENTERPRISE_NOT_FOUND));
    }

    @Override
    public Enterprise save(EnterpriseRequest request) {
        Enterprise entity = Enterprise.builder()
                .companyName(request.getCompanyName())
                .taxCode(request.getTaxCode())
                .website(request.getWebsite())
                .industry(request.getIndustry())
                .description(request.getDescription())
                .address(request.getAddress())
                .logoUrl(request.getLogoUrl())
                .contactPerson(request.getContactPerson())
                .contactPhone(request.getContactPhone())
                .contactEmail(request.getContactEmail())
                .status(request.getStatus() != null ? request.getStatus() : "PENDING")
                .rejectionReason(request.getRejectionReason())
                .build();
        return repository.save(entity);
    }

    /**
     * UC-36 Edit Enterprise Profile.
     * - Normal flow: persists updated company information (description, address, logo,
     *   contact details) and returns the updated entity (POST-1).
     * - Ownership check: only the Enterprise that owns this profile can edit it.
     * - Business rule: an Enterprise whose status is SUSPENDED cannot edit.
     *   PENDING/REJECTED enterprises may edit so they can fix the rejection reason
     *   and resubmit.
     * - Contact person/phone/email are mirrored to the current User account so the
     *   representative's login contact details stay in sync. The User's email is
     *   intentionally NOT changed here (would invalidate the current session and
     *   may collide with another user's email).
     */
    @Override
    @Transactional
    public Enterprise update(UUID id, EnterpriseRequest request) {
        User currentUser = getCurrentUser();
        Enterprise existing =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ENTERPRISE_NOT_FOUND));

        // UC-36 & Ownership check: chỉ Enterprise sở hữu profile này mới được sửa
        validateOwnership(id, currentUser);

        // Không cho phép enterprise đang bị SUSPENDED tự chỉnh sửa
        if ("SUSPENDED".equalsIgnoreCase(existing.getStatus())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Persist all editable fields from UC-36 step 3 (description, address, logo,
        // contact details). taxCode, status, rejectionReason are admin-managed and
        // intentionally not writable through this endpoint.
        existing.setCompanyName(request.getCompanyName());
        existing.setWebsite(request.getWebsite());
        existing.setIndustry(request.getIndustry());
        existing.setAddress(request.getAddress());
        existing.setDescription(request.getDescription());
        existing.setLogoUrl(request.getLogoUrl());
        existing.setContactPerson(request.getContactPerson());
        existing.setContactPhone(request.getContactPhone());
        existing.setContactEmail(request.getContactEmail());

        // Mirror representative info onto the current User account for consistency
        currentUser.setFullName(request.getContactPerson());
        currentUser.setPhone(request.getContactPhone());
        userRepository.save(currentUser);

        Enterprise saved = repository.save(existing);
        log.info("Enterprise {} profile updated by user {}", id, currentUser.getEmail());
        return saved;
    }

    @Override
    @Transactional
    public Enterprise updateMyProfile(EnterpriseRequest request) {
        Enterprise current = getMyEnterpriseProfile();
        return update(current.getEnterpriseId(), request);
    }

    @Override
    @Transactional
    public Enterprise approveReject(UUID id, String status, String reason) {
        Enterprise enterprise =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ENTERPRISE_NOT_FOUND));

        // BR-15: Bắt buộc có lý do khi Reject
        if ("REJECTED".equalsIgnoreCase(status) && (reason == null || reason.isBlank())) {
            throw new AppException(ErrorCode.FIELD_REQUIRED);
        }

        enterprise.setStatus(status.toUpperCase());
        if ("REJECTED".equalsIgnoreCase(status)) {
            enterprise.setRejectionReason(reason);
        } else if ("APPROVED".equalsIgnoreCase(status)) {
            enterprise.setRejectionReason(null);

            // Kích hoạt tài khoản User liên kết để doanh nghiệp có thể đăng nhập
            List<User> users = userRepository.findByEnterprise_EnterpriseId(enterprise.getEnterpriseId());
            for (User u : users) {
                u.setStatus("ACTIVE");
                userRepository.save(u);
            }
        }

        Enterprise saved = repository.save(enterprise);

        // UC-19: Gửi email thông báo (Post-condition bắt buộc)
        mailService.sendEnterpriseStatusNotification(
                enterprise.getContactEmail(), enterprise.getContactPerson(), status, reason);

        log.info("TM updated Enterprise {} status to {}. Reason: {}", id, status, reason);

        return saved;
    }

    private void validateAccess(UUID targetId) {
        org.springframework.security.core.Authentication auth =
                SecurityContextHolder.getContext().getAuthentication();
        boolean isStaff = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TRAINING_MANAGER")
                        || a.getAuthority().equals("ROLE_ADMIN")
                        || a.getAuthority().equals("ROLE_SYSTEM_ADMIN"));

        if (!isStaff) {
            User currentUser = getCurrentUser();
            validateOwnership(targetId, currentUser);
        }
    }

    private void validateOwnership(UUID targetId, User currentUser) {
        if (currentUser.getEnterprise() == null
                || !currentUser.getEnterprise().getEnterpriseId().equals(targetId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
