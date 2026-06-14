package com.ueims.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.EnterpriseAssignment;

@Repository
public interface EnterpriseAssignmentRepository extends JpaRepository<EnterpriseAssignment, UUID> {

    Optional<EnterpriseAssignment> findByStudent_UserId(UUID studentId);

    // UC-44: Kiểm tra sinh viên đã có chỗ thực tập trong học kỳ chưa
    boolean existsByStudent_UserIdAndSemester_SemesterId(UUID studentId, UUID semesterId);
    List<EnterpriseAssignment> findByEnterprise_EnterpriseId(UUID enterpriseId);

    @Query("SELECT ea FROM EnterpriseAssignment ea WHERE ea.semester.semesterId = :semesterId AND NOT EXISTS "
            + "(SELECT wr FROM WeeklyReport wr WHERE wr.assignment.assignmentId = ea.assignmentId "
            + "AND wr.weekNumber = :weekNumber AND wr.status != 'NOT_SUBMITTED')")
    List<EnterpriseAssignment> findAssignmentsWithLateReports(
            @Param("semesterId") UUID semesterId, @Param("weekNumber") Integer weekNumber);

    // Security: Kiểm tra quyền xem profile của doanh nghiệp đối với sinh viên được phân công
    boolean existsByEnterprise_EnterpriseIdAndStudent_UserId(UUID enterpriseId, UUID studentId);

    // UC-29 & UC-31: Tìm các bản ghi chưa nộp báo cáo tuần
    @Query("SELECT ea FROM EnterpriseAssignment ea WHERE ea.semester.semesterId = :semesterId "
            + "AND NOT EXISTS (SELECT 1 FROM WeeklyReport wr WHERE wr.assignment = ea AND wr.weekNumber = :weekNumber)")
    List<EnterpriseAssignment> findAssignmentsWithLateReports(
            @Param("semesterId") UUID semesterId, @Param("weekNumber") Integer weekNumber);
}
