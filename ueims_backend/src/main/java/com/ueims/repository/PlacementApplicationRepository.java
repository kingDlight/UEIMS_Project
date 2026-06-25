package com.ueims.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ueims.model.entity.PlacementApplication;

public interface PlacementApplicationRepository extends JpaRepository<PlacementApplication, UUID> {

    /** Application của 1 SV trong 1 kỳ vào 1 DN — dùng để check duplicate. */
    Optional<PlacementApplication> findByStudent_UserIdAndEnterprise_EnterpriseIdAndSemester_SemesterId(
            UUID studentId, UUID enterpriseId, UUID semesterId);

    /** Tất cả applications của 1 SV (cho SV xem). */
    List<PlacementApplication> findByStudent_UserIdOrderByCreatedAtDesc(UUID studentId);

    /** Tất cả applications pending — cho TM dashboard. */
    List<PlacementApplication> findByStatusOrderByCreatedAtDesc(String status);

    /** Active semester — để xác định kỳ hiện tại khi SV submit. */
    @Query("SELECT pa FROM PlacementApplication pa WHERE pa.status = :status "
            + "AND pa.semester.semesterId = :semesterId ORDER BY pa.createdAt DESC")
    List<PlacementApplication> findByStatusAndSemester(
            @Param("status") String status, @Param("semesterId") UUID semesterId);

    /**
     * Combined view cho tab OJT: 1 row per (student × semester) với status tổng hợp.
     *
     * Logic ưu tiên (theo thứ tự):
     *   1. enterprise_assignments.status = 'ACTIVE'    → workflow_status = 'PLACED'
     *   2. enterprise_assignments.status = 'COMPLETED' → workflow_status = 'COMPLETED'
     *   3. placement_applications.status = 'PENDING_APPROVAL' → 'PENDING_APPROVAL'
     *   4. placement_applications.status = 'REJECTED' / 'WITHDRAWN' → giữ nguyên
     *   5. Không có gì → 'UNPLACED'
     *
     * Chỉ list SV có role STUDENT và đã được duyệt eligible (status IN 'ACCEPTED', 'OJT', 'MATCHED')
     * trong kỳ OPEN/ACTIVE.
     */
    @Query(
            value =
                    """
		SELECT
			u.user_id              AS student_id,
			u.full_name            AS student_name,
			sp.student_code        AS student_code,
			sp.major               AS major,
			sem.semester_id        AS semester_id,
			sem.semester_code      AS semester_code,
			COALESCE(
				(SELECT CASE WHEN ea2.status = 'ACTIVE' THEN 'PLACED'
							WHEN ea2.status = 'COMPLETED' THEN 'COMPLETED'
							WHEN ea2.status = 'TERMINATED' THEN 'CANCELLED'
						END
				FROM enterprise_assignments ea2
				WHERE ea2.student_id = u.user_id AND ea2.semester_id = sem.semester_id
				ORDER BY ea2.created_at DESC LIMIT 1),
				(SELECT CASE WHEN pa2.status = 'PENDING_APPROVAL' THEN 'PENDING_APPROVAL'
							WHEN pa2.status = 'APPROVED' THEN 'APPROVED'
							WHEN pa2.status = 'REJECTED' THEN 'REJECTED'
							WHEN pa2.status = 'WITHDRAWN' THEN 'WITHDRAWN'
						END
				FROM placement_applications pa2
				WHERE pa2.student_id = u.user_id AND pa2.semester_id = sem.semester_id
				ORDER BY pa2.created_at DESC LIMIT 1),
				'UNPLACED'
			) AS workflow_status,
			(SELECT ea3.assignment_id FROM enterprise_assignments ea3
			WHERE ea3.student_id = u.user_id AND ea3.semester_id = sem.semester_id
			ORDER BY ea3.created_at DESC LIMIT 1) AS assignment_id,
			(SELECT ea4.enterprise_id FROM enterprise_assignments ea4
			WHERE ea4.student_id = u.user_id AND ea4.semester_id = sem.semester_id
			ORDER BY ea4.created_at DESC LIMIT 1) AS enterprise_id,
			(SELECT ent.company_name FROM enterprise_assignments ea5
			JOIN enterprises ent ON ent.enterprise_id = ea5.enterprise_id
			WHERE ea5.student_id = u.user_id AND ea5.semester_id = sem.semester_id
			ORDER BY ea5.created_at DESC LIMIT 1) AS enterprise_name,
			(SELECT pa3.application_id FROM placement_applications pa3
			WHERE pa3.student_id = u.user_id AND pa3.semester_id = sem.semester_id
			ORDER BY pa3.created_at DESC LIMIT 1) AS application_id,
			(SELECT pa4.status FROM placement_applications pa4
			WHERE pa4.student_id = u.user_id AND pa4.semester_id = sem.semester_id
			ORDER BY pa4.created_at DESC LIMIT 1) AS application_status,
			(SELECT pa5.cover_letter FROM placement_applications pa5
			WHERE pa5.student_id = u.user_id AND pa5.semester_id = sem.semester_id
			ORDER BY pa5.created_at DESC LIMIT 1) AS cover_letter,
			(SELECT pa6.is_replacement FROM placement_applications pa6
			WHERE pa6.student_id = u.user_id AND pa6.semester_id = sem.semester_id
			ORDER BY pa6.created_at DESC LIMIT 1) AS is_replacement,
			es.deferred_reason  AS deferred_reason,
			(SELECT u2.full_name FROM users u2 WHERE u2.user_id = es.deferred_by) AS deferred_by_name,
			es.deferred_at      AS deferred_at
		FROM users u
		JOIN student_profiles sp ON sp.user_id = u.user_id
		JOIN users_roles ur      ON ur.user_id = u.user_id
		JOIN roles r             ON r.role_name = ur.role_name
		JOIN semesters sem       ON sem.status IN ('OPEN', 'ACTIVE')
		JOIN eligible_students es ON es.user_id = u.user_id AND es.semester_id = sem.semester_id
		WHERE r.role_name = 'STUDENT'
		AND u.status = 'ACTIVE'
		AND u.deleted_at IS NULL
		AND es.status IN ('ELIGIBLE', 'ACCEPTED', 'OJT', 'MATCHED')
		ORDER BY u.full_name
		""",
            nativeQuery = true)
    List<Object[]> findOjtPlacementView();

    /** Check xem SV đã có assignment ACTIVE cho kỳ này chưa — chặn submit application trùng. */
    @Query("SELECT COUNT(ea) > 0 FROM EnterpriseAssignment ea "
            + "WHERE ea.student.userId = :studentId "
            + "AND ea.semester.semesterId = :semesterId "
            + "AND ea.status = 'ACTIVE'")
    boolean existsActiveAssignmentForStudentInSemester(
            @Param("studentId") UUID studentId, @Param("semesterId") UUID semesterId);

    /**
     * Tìm application của SV vào DN với status cụ thể.
     * Dùng cho Self-Replace: link tới application APPROVED trước đó.
     */
    Optional<PlacementApplication> findByStudent_UserIdAndEnterprise_EnterpriseIdAndStatus(
            UUID studentId, UUID enterpriseId, String status);
}
