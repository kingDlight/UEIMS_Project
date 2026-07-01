package com.ueims.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.dto.response.EnterpriseAssignmentResponseDTO;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.mapper.EnterpriseAssignmentMapper;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.User;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.EnterpriseAssignmentService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EnterpriseAssignmentServiceImpl implements EnterpriseAssignmentService {
    EnterpriseAssignmentRepository repository;
    UserRepository userRepository;
    EnterpriseAssignmentMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<EnterpriseAssignment> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public EnterpriseAssignment findById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnterpriseAssignment> findByEnterpriseId(UUID enterpriseId) {
        return repository.findByEnterprise_EnterpriseId(enterpriseId);
    }

    @Override
    @Transactional(readOnly = true)
    public EnterpriseAssignment findMyAssignment(UUID studentId) {
        // Chỉ lấy phân công trong học kỳ đang ACTIVE để sinh viên xem Roadmap đúng kỳ
        return repository
                .findByStudent_UserIdAndSemester_Status(studentId, "ACTIVE")
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnterpriseAssignment> findMyEnterpriseAssignments() {
        User currentUser = getCurrentUser();
        if (currentUser.getEnterprise() == null) {
            return List.of();
        }
        UUID enterpriseId = currentUser.getEnterprise().getEnterpriseId();
        // UC-45: Chỉ hiển thị sinh viên có trạng thái OJT/MATCHED/ACCEPTED trong eligible_students
        return repository.findByEnterpriseAndSemesterActiveAndValidStudentStatus(enterpriseId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnterpriseAssignment> searchMyEnterpriseAssignments(String keyword) {
        User currentUser = getCurrentUser();
        if (currentUser.getEnterprise() == null) {
            return List.of();
        }
        UUID enterpriseId = currentUser.getEnterprise().getEnterpriseId();
        return repository.searchMyAssignments(enterpriseId, keyword);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    @Override
    public EnterpriseAssignment save(EnterpriseAssignment entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public EnterpriseAssignment update(UUID id, EnterpriseAssignmentResponseDTO dto) {
        EnterpriseAssignment existing =
                repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND));

        User currentUser = getCurrentUser();
        // Kiểm tra quyền: Chỉ doanh nghiệp sở hữu phân công này (hoặc TM) mới được cập nhật Supervisor
        boolean isStaff = currentUser.getRoles().stream()
                .anyMatch(r -> r.getRole().getRoleName().equals("TRAINING_MANAGER")
                        || r.getRole().getRoleName().equals("SYSTEM_ADMIN"));

        if (!isStaff
                && (currentUser.getEnterprise() == null
                        || !existing.getEnterprise()
                                .getEnterpriseId()
                                .equals(currentUser.getEnterprise().getEnterpriseId()))) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // BR-11: Nếu học kỳ đã bị LOCKED, không cho phép chỉnh sửa thông tin phân công (Read-only)
        if ("LOCKED".equals(existing.getSemester().getStatus())) {
            throw new AppException(ErrorCode.SEMESTER_LOCKED_DATE);
        }

        mapper.updateEntity(dto, existing);
        return repository.save(existing);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    @Override
    @Transactional
    public int autoCompletePriorActiveAssignments(UUID studentId, UUID newSemesterId) {
        List<EnterpriseAssignment> actives = repository.findByStudent_UserIdAndStatus(studentId, "ACTIVE");
        int completed = 0;
        for (EnterpriseAssignment old : actives) {
            if (old.getSemester() != null && !old.getSemester().getSemesterId().equals(newSemesterId)) {
                old.setStatus("COMPLETED");
                if (old.getTerminationReason() == null) {
                    old.setTerminationReason("Auto-completed: student assigned in new semester");
                }
                old.setTerminatedAt(LocalDateTime.now());
                repository.save(old);
                completed++;
                log.info(
                        "[AUTO-COMPLETE] Assignment {} (semester={}) → COMPLETED (student={} moved to new semester={})",
                        old.getAssignmentId(),
                        old.getSemester().getSemesterId(),
                        studentId,
                        newSemesterId);
            }
        }
        return completed;
    }
}
