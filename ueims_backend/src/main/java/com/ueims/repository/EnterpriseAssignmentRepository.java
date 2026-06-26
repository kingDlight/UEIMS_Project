package com.ueims.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.EligibleStudent;
import com.ueims.model.entity.EnterpriseAssignment;

@Repository
public interface EnterpriseAssignmentRepository extends JpaRepository<EnterpriseAssignment, UUID> {

    List<EnterpriseAssignment> findByEnterprise_EnterpriseId(UUID enterpriseId);

    // UC-45: Lọc danh sách phân công theo doanh nghiệp và học kỳ đang ACTIVE
    List<EnterpriseAssignment> findByEnterprise_EnterpriseIdAndSemester_Status(UUID enterpriseId, String status);

    // UC-45: Chỉ hiển thị sinh viên đã được phân công thực tế (ACCEPTED/OJT)
    // MATCHED chưa có assignment vì chưa qua bước TM approve OJT
    @Query("SELECT ea FROM EnterpriseAssignment ea "
            + "JOIN EligibleStudent es ON es.user.userId = ea.student.userId "
            + "AND es.semester.semesterId = ea.semester.semesterId "
            + "WHERE ea.enterprise.enterpriseId = :enterpriseId "
            + "AND ea.semester.status = 'ACTIVE' "
            + "AND es.status IN ('OJT', 'ACCEPTED')")
    List<EnterpriseAssignment> findByEnterpriseAndSemesterActiveAndValidStudentStatus(
            @Param("enterpriseId") UUID enterpriseId);

    @Query("SELECT ea FROM EnterpriseAssignment ea "
            + "JOIN EligibleStudent es ON es.user.userId = ea.student.userId "
            + "AND es.semester.semesterId = ea.semester.semesterId "
            + "WHERE ea.enterprise.enterpriseId = :enterpriseId "
            + "AND ea.semester.status = 'ACTIVE' "
            + "AND es.status IN ('OJT', 'ACCEPTED') "
            + "AND (:keyword IS NULL OR LOWER(es.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(es.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<EnterpriseAssignment> searchMyAssignments(
            @Param("enterpriseId") UUID enterpriseId, @Param("keyword") String keyword);

    @Query("SELECT ea FROM EnterpriseAssignment ea WHERE ea.semester.semesterId = :semesterId AND NOT EXISTS "
            + "(SELECT wr FROM WeeklyReport wr WHERE wr.assignment.assignmentId = ea.assignmentId "
            + "AND wr.weekNumber = :weekNumber AND wr.status != 'NOT_SUBMITTED')")
    List<EnterpriseAssignment> findAssignmentsWithLateReports(
            @Param("semesterId") UUID semesterId, @Param("weekNumber") Integer weekNumber);

    boolean existsByEnterprise_EnterpriseIdAndStudent_UserId(UUID enterpriseId, UUID studentId);

    boolean existsByStudent_UserIdAndEnterprise_EnterpriseIdAndSemester_SemesterId(
            UUID studentId, UUID enterpriseId, UUID semesterId);

    Optional<EnterpriseAssignment> findByStudent_UserId(UUID studentId);

    // Lấy phân công hiện tại của sinh viên trong học kỳ ACTIVE
    @Query(
            "SELECT ea FROM EnterpriseAssignment ea JOIN FETCH ea.enterprise WHERE ea.student.userId = :studentId AND ea.semester.status = :status")
    Optional<EnterpriseAssignment> findByStudent_UserIdAndSemester_Status(UUID studentId, String status);

    boolean existsByStudent_UserIdAndSemester_SemesterIdAndStatus(UUID studentId, UUID semesterId, String status);

    List<EnterpriseAssignment> findByAssignmentIdIn(List<UUID> assignmentIds);

    List<EnterpriseAssignment> findBySemester_SemesterIdAndStatus(UUID semesterId, String status);

    void deleteByEnterprise_EnterpriseId(UUID enterpriseId);

    long countByStatus(String status);
}
