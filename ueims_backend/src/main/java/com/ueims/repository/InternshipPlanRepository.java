package com.ueims.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.InternshipPlan;

@Repository
public interface InternshipPlanRepository extends JpaRepository<InternshipPlan, UUID> {

    /**
     * Tìm plan của 1 DN theo kỳ (cả PENDING_APPROVAL và APPROVED).
     * Vì UNIQUE index trên (enterprise_id, semester_id), chỉ trả 1 row.
     */
    Optional<InternshipPlan> findByEnterprise_EnterpriseIdAndSemester_SemesterId(UUID enterpriseId, UUID semesterId);

    /**
     * Lấy plan đã APPROVED của DN tại kỳ.
     */
    Optional<InternshipPlan> findByEnterprise_EnterpriseIdAndSemester_SemesterIdAndStatus(
            UUID enterpriseId, UUID semesterId, String status);

    /**
     * Lấy tất cả plan PENDING_APPROVAL của DN (kỳ hiện tại hoặc nhiều kỳ).
     */
    List<InternshipPlan> findByEnterprise_EnterpriseIdAndStatus(UUID enterpriseId, String status);

    /**
     * Lấy plan APPROVED mà 1 SV có thể thấy.
     * SV chỉ thấy plan khi:
     *   (a) plan.status = 'APPROVED', AND
     *   (b) SV có EnterpriseAssignment ACTIVE trong cùng enterprise + semester đó.
     */
    @Query("SELECT ip FROM InternshipPlan ip "
            + "WHERE ip.status = 'APPROVED' "
            + "AND EXISTS ("
            + "  SELECT 1 FROM EnterpriseAssignment ea "
            + "  WHERE ea.student.userId = :studentId "
            + "  AND ea.status = 'ACTIVE' "
            + "  AND ea.enterprise.enterpriseId = ip.enterprise.enterpriseId "
            + "  AND ea.semester.semesterId = ip.semester.semesterId"
            + ")")
    Optional<InternshipPlan> findActivePlanForStudent(@Param("studentId") UUID studentId);

    /** Danh sách các plan PENDING_APPROVAL cho TM duyệt. */
    @Query("SELECT ip FROM InternshipPlan ip WHERE ip.status = 'PENDING_APPROVAL' ORDER BY ip.createdAt DESC")
    List<InternshipPlan> findAllPending();

    List<InternshipPlan> findByStatus(String status);

    /**
     * Lấy plan theo job_post_id (giữ để tương thích, nhưng enterprise giờ dùng
     * findByEnterprise_EnterpriseIdAndSemester_SemesterId thay thế).
     */
    Optional<InternshipPlan> findByJobPost_JobPostId(UUID jobPostId);
}
