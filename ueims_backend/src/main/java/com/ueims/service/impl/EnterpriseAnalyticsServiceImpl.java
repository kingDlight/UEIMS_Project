package com.ueims.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ueims.dto.response.MajorQualityDTO;
import com.ueims.model.entity.EligibleStudent;
import com.ueims.model.entity.EnterpriseAssignment;
import com.ueims.model.entity.FinalGrade;
import com.ueims.model.entity.Interview;
import com.ueims.model.entity.Semester;
import com.ueims.repository.EligibleStudentRepository;
import com.ueims.repository.EnterpriseAssignmentRepository;
import com.ueims.repository.FinalGradeRepository;
import com.ueims.repository.InterviewRepository;
import com.ueims.service.EnterpriseAnalyticsService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

/**
 * Aggregate chất lượng SV theo ngành cho một Enterprise cụ thể.
 *
 * <p>Logic: Lấy tất cả {@code enterprise_assignments} của DN → join với
 * {@code eligible_students} (lấy major + gpa) và {@code final_grades} (điểm tổng kết).
 * Lấy interviews qua job_post của application của SV → đếm PASS/FAIL.
 *
 * <p>Nếu {@code semesterId = null} → aggregate tất cả kỳ, group (semester, major).
 * Nếu có semesterId → chỉ aggregate kỳ đó.
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EnterpriseAnalyticsServiceImpl implements EnterpriseAnalyticsService {

    EnterpriseAssignmentRepository enterpriseAssignmentRepository;
    EligibleStudentRepository eligibleStudentRepository;
    InterviewRepository interviewRepository;
    FinalGradeRepository finalGradeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MajorQualityDTO> getStudentQualityByMajor(UUID enterpriseId, UUID semesterId) {
        if (enterpriseId == null) {
            return List.of();
        }

        // 1. Lấy assignment của DN. Có thể lọc theo kỳ nếu client truyền lên.
        List<EnterpriseAssignment> assignments = semesterId != null
                ? enterpriseAssignmentRepository.findByEnterprise_EnterpriseIdAndSemester_SemesterId(
                        enterpriseId, semesterId)
                : enterpriseAssignmentRepository.findByEnterprise_EnterpriseId(enterpriseId);

        if (assignments.isEmpty()) {
            return List.of();
        }

        // 2. Lấy toàn bộ interviews của DN (1 lần, dùng cho filter in-memory)
        List<Interview> allInterviews = interviewRepository.findByEnterpriseId(enterpriseId);

        // 3. Lấy final grades của DN theo từng kỳ (dùng findAll + filter vì chưa có repo method riêng)
        List<FinalGrade> allGrades = finalGradeRepository.findAll();

        // 4. Group assignments theo (semesterId, major) để aggregate
        // Key: semesterId|major, Value: aggregated bucket
        Map<String, AggregateBucket> buckets = new LinkedHashMap<>();

        for (EnterpriseAssignment ea : assignments) {
            Semester sem = ea.getSemester();
            if (sem == null) continue;

            UUID studentId = ea.getStudent().getUserId();

            // Lấy major + gpa từ eligible_students của SV trong kỳ này
            EligibleStudent eligible = eligibleStudentRepository
                    .findByUser_UserIdAndSemester_SemesterId(studentId, sem.getSemesterId())
                    .orElse(null);
            if (eligible == null) continue;

            String major = eligible.getMajor();
            if (major == null || major.isBlank()) continue;

            String key = sem.getSemesterId() + "|" + major;
            AggregateBucket bucket = buckets.computeIfAbsent(key, k -> new AggregateBucket(sem, major));

            bucket.totalStudents++;
            if (eligible.getGpa() != null) {
                bucket.gpaSum = bucket.gpaSum.add(eligible.getGpa());
                bucket.gpaCount++;
            }

            // Final grade của SV trong kỳ
            FinalGrade grade = allGrades.stream()
                    .filter(g -> g.getStudent() != null
                            && studentId.equals(g.getStudent().getUserId())
                            && g.getSemester() != null
                            && sem.getSemesterId().equals(g.getSemester().getSemesterId()))
                    .findFirst()
                    .orElse(null);
            if (grade != null && grade.getGradeValue() != null) {
                bucket.gradeSum = bucket.gradeSum.add(grade.getGradeValue());
                bucket.gradeCount++;
            }
        }

        // 5. Với mỗi bucket, đếm pass/fail interview
        for (AggregateBucket bucket : buckets.values()) {
            for (Interview iv : allInterviews) {
                if (iv.getResult() == null) continue;
                if (iv.getApplication() == null
                        || iv.getApplication().getStudent() == null
                        || iv.getApplication().getJobPost() == null
                        || iv.getApplication().getJobPost().getSemester() == null) {
                    continue;
                }
                // Match theo semester
                if (!bucket.semester
                        .getSemesterId()
                        .equals(iv.getApplication().getJobPost().getSemester().getSemesterId())) {
                    continue;
                }

                UUID interviewStudentId = iv.getApplication().getStudent().getUserId();
                // Chỉ đếm SV thuộc bucket này nếu major của SV khớp
                EligibleStudent eligible = eligibleStudentRepository
                        .findByUser_UserIdAndSemester_SemesterId(interviewStudentId, bucket.semester.getSemesterId())
                        .orElse(null);
                if (eligible == null || !bucket.major.equals(eligible.getMajor())) {
                    continue;
                }

                String result = iv.getResult().toUpperCase();
                if ("PASS".equals(result)) {
                    bucket.passed++;
                } else if ("FAIL".equals(result)) {
                    bucket.failed++;
                }
            }
        }

        // 6. Build DTO list, sort theo semester desc rồi major asc
        List<MajorQualityDTO> result = buckets.values().stream()
                .map(this::toDto)
                .sorted(Comparator.comparing(MajorQualityDTO::semesterCode)
                        .reversed()
                        .thenComparing(MajorQualityDTO::major))
                .collect(Collectors.toList());

        log.info(
                "[EnterpriseAnalytics] enterprise={} semester={} → {} major buckets",
                enterpriseId,
                semesterId,
                result.size());
        return result;
    }

    private MajorQualityDTO toDto(AggregateBucket b) {
        BigDecimal avgGpa =
                b.gpaCount > 0 ? b.gpaSum.divide(BigDecimal.valueOf(b.gpaCount), 2, RoundingMode.HALF_UP) : null;
        BigDecimal avgGrade =
                b.gradeCount > 0 ? b.gradeSum.divide(BigDecimal.valueOf(b.gradeCount), 2, RoundingMode.HALF_UP) : null;
        long totalInterview = b.passed + b.failed;
        BigDecimal passRate = totalInterview > 0
                ? BigDecimal.valueOf(b.passed)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(totalInterview), 1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new MajorQualityDTO(
                b.semester.getSemesterId(),
                b.semester.getSemesterCode(),
                b.semester.getName(),
                b.major,
                b.totalStudents,
                avgGpa,
                b.passed,
                b.failed,
                passRate,
                avgGrade);
    }

    /** Mutable accumulator cho mỗi (semester, major). */
    private static class AggregateBucket {
        final Semester semester;
        final String major;
        long totalStudents = 0;
        BigDecimal gpaSum = BigDecimal.ZERO;
        int gpaCount = 0;
        BigDecimal gradeSum = BigDecimal.ZERO;
        int gradeCount = 0;
        long passed = 0;
        long failed = 0;

        AggregateBucket(Semester semester, String major) {
            this.semester = semester;
            this.major = major;
        }
    }
}
