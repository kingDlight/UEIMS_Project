package com.ueims.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.dto.request.PlacementApplicationRequest;
import com.ueims.dto.request.RejectApplicationRequest;
import com.ueims.dto.response.OjtPlacementViewDTO;
import com.ueims.dto.response.PlacementApplicationResponseDTO;
import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.mapper.PlacementApplicationMapper;
import com.ueims.model.entity.EligibleStudent;
import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.PlacementApplication;
import com.ueims.model.entity.Semester;
import com.ueims.model.entity.User;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.EnterpriseRepository;
import com.ueims.repository.PlacementApplicationRepository;
import com.ueims.repository.SemesterRepository;
import com.ueims.repository.UserRepository;
import com.ueims.service.PlacementApplicationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PlacementApplicationServiceImpl implements PlacementApplicationService {

    PlacementApplicationRepository applicationRepository;
    EnterpriseAssignmentRepository assignmentRepository;
    EligibleStudentRepository eligibleRepository;
    EnterpriseRepository enterpriseRepository;
    SemesterRepository semesterRepository;
    UserRepository userRepository;
    PlacementApplicationMapper mapper;

    @Override
    @Transactional
    public PlacementApplicationResponseDTO apply(UUID studentId, PlacementApplicationRequest request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Enterprise enterprise = enterpriseRepository.findById(request.getEnterpriseId())
                .orElseThrow(() -> new AppException(ErrorCode.ENTERPRISE_NOT_FOUND));

        if (!"APPROVED".equals(enterprise.getStatus())) {
            throw new AppException(ErrorCode.ENTERPRISE_NOT_APPROVED);
        }

        Semester semester = getActiveOrOpenSemester();

        // Check SV có trong eligible_students với status phù hợp không
        EligibleStudent eligible = eligibleRepository
                .findByUser_UserIdAndSemester_SemesterId(studentId, semester.getSemesterId())
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_ELIGIBLE_FOR_PLACEMENT));

        if (!List.of("ACCEPTED", "MATCHED", "OJT").contains(eligible.getStatus())) {
            throw new AppException(ErrorCode.STUDENT_NOT_ELIGIBLE_FOR_PLACEMENT);
        }

        // Check SV đã có assignment ACTIVE chưa
        if (applicationRepository.existsActiveAssignmentForStudentInSemester(studentId, semester.getSemesterId())) {
            throw new AppException(ErrorCode.STUDENT_HAS_ACTIVE_PLACEMENT);
        }

        // Check duplicate application (cùng SV + DN + kỳ)
        Optional<PlacementApplication> existing = applicationRepository
                .findByStudent_UserIdAndEnterprise_EnterpriseIdAndSemester_SemesterId(
                        studentId, enterprise.getEnterpriseId(), semester.getSemesterId());
        if (existing.isPresent()) {
            PlacementApplication app = existing.get();
            if ("PENDING_APPROVAL".equals(app.getStatus())) {
                throw new AppException(ErrorCode.DUPLICATE_PLACEMENT_APPLICATION);
            }
            if ("APPROVED".equals(app.getStatus())) {
                throw new AppException(ErrorCode.STUDENT_HAS_ACTIVE_PLACEMENT);
            }
        }

        PlacementApplication app = PlacementApplication.builder()
                .student(student)
                .enterprise(enterprise)
                .semester(semester)
                .status("PENDING_APPROVAL")
                .coverLetter(request.getCoverLetter())
                .build();

        PlacementApplication saved = applicationRepository.save(app);
        log.info("Student {} applied to enterprise {} for semester {}",
                studentId, enterprise.getEnterpriseId(), semester.getSemesterId());
        return mapper.toDto(saved);
    }

    @Override
    @Transactional
    public PlacementApplicationResponseDTO approve(UUID applicationId, UUID reviewerId) {
        PlacementApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.PLACEMENT_APP_NOT_FOUND));

        if (!"PENDING_APPROVAL".equals(app.getStatus())) {
            throw new AppException(ErrorCode.PLACEMENT_APP_NOT_PENDING);
        }

        // Check xem SV đã có ACTIVE assignment cho kỳ này chưa
        if (applicationRepository.existsActiveAssignmentForStudentInSemester(
                app.getStudent().getUserId(), app.getSemester().getSemesterId())) {
            throw new AppException(ErrorCode.STUDENT_HAS_ACTIVE_PLACEMENT);
        }

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Auto-create EnterpriseAssignment (BR-11: không cho nếu semester LOCKED)
        if ("LOCKED".equals(app.getSemester().getStatus())) {
            throw new AppException(ErrorCode.SEMESTER_LOCKED_DATE);
        }

        EnterpriseAssignment assignment = EnterpriseAssignment.builder()
                .enterprise(app.getEnterprise())
                .student(app.getStudent())
                .semester(app.getSemester())
                .status("ACTIVE")
                .assignedBy(reviewer)
                .build();
        assignmentRepository.save(assignment);

        // Update application status
        app.setStatus("APPROVED");
        app.setReviewedBy(reviewer);
        app.setReviewedAt(LocalDateTime.now());

        PlacementApplication saved = applicationRepository.save(app);
        log.info("Application {} approved by {} → assignment {} created",
                applicationId, reviewerId, assignment.getAssignmentId());
        return mapper.toDto(saved);
    }

    @Override
    @Transactional
    public PlacementApplicationResponseDTO reject(UUID applicationId, UUID reviewerId, RejectApplicationRequest request) {
        PlacementApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.PLACEMENT_APP_NOT_FOUND));

        if (!"PENDING_APPROVAL".equals(app.getStatus())) {
            throw new AppException(ErrorCode.PLACEMENT_APP_NOT_PENDING);
        }

        if (request.getRejectionReason() == null || request.getRejectionReason().trim().length() < 5) {
            throw new AppException(ErrorCode.REJECTION_REASON_REQUIRED);
        }

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        app.setStatus("REJECTED");
        app.setRejectionReason(request.getRejectionReason().trim());
        app.setReviewedBy(reviewer);
        app.setReviewedAt(LocalDateTime.now());

        PlacementApplication saved = applicationRepository.save(app);
        log.info("Application {} rejected by {}: {}", applicationId, reviewerId, request.getRejectionReason());
        return mapper.toDto(saved);
    }

    @Override
    @Transactional
    public PlacementApplicationResponseDTO withdraw(UUID applicationId, UUID studentId) {
        PlacementApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.PLACEMENT_APP_NOT_FOUND));

        if (!app.getStudent().getUserId().equals(studentId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (!"PENDING_APPROVAL".equals(app.getStatus())) {
            throw new AppException(ErrorCode.PLACEMENT_APP_NOT_PENDING);
        }

        app.setStatus("WITHDRAWN");
        PlacementApplication saved = applicationRepository.save(app);
        log.info("Application {} withdrawn by student {}", applicationId, studentId);
        return mapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlacementApplicationResponseDTO> getPending() {
        return applicationRepository.findByStatusOrderByCreatedAtDesc("PENDING_APPROVAL").stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlacementApplicationResponseDTO> getMyApplications(UUID studentId) {
        return applicationRepository.findByStudent_UserIdOrderByCreatedAtDesc(studentId).stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<OjtPlacementViewDTO> getOjtPlacementView() {
        List<Object[]> rows = applicationRepository.findOjtPlacementView();
        List<OjtPlacementViewDTO> result = new ArrayList<>();
        for (Object[] row : rows) {
            OjtPlacementViewDTO.OjtPlacementViewDTOBuilder builder = OjtPlacementViewDTO.builder()
                    .studentId(toUuid(row[0]))
                    .studentName((String) row[1])
                    .studentCode((String) row[2])
                    .major((String) row[3])
                    .semesterId(toUuid(row[4]))
                    .semesterCode((String) row[5])
                    .workflowStatus((String) row[6])
                    .assignmentId(toUuid(row[7]))
                    .enterpriseId(toUuid(row[8]))
                    .enterpriseName((String) row[9])
                    .applicationId(toUuid(row[10]))
                    .applicationStatus((String) row[11])
                    .coverLetter((String) row[12]);
            result.add(builder.build());
        }
        return result;
    }

    private UUID toUuid(Object o) {
        if (o == null) return null;
        if (o instanceof UUID u) return u;
        return UUID.fromString(o.toString());
    }

    private Semester getActiveOrOpenSemester() {
        // Ưu tiên ACTIVE, fallback OPEN
        List<Semester> active = semesterRepository.findByStatus("ACTIVE");
        if (!active.isEmpty()) return active.get(0);
        List<Semester> open = semesterRepository.findByStatus("OPEN");
        if (!open.isEmpty()) return open.get(0);
        throw new AppException(ErrorCode.NO_ACTIVE_SEMESTER);
    }
}