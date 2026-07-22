package com.ueims.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.*;

@Repository
public interface FinalGradeRepository extends JpaRepository<FinalGrade, UUID> {
    @org.springframework.data.jpa.repository.Query(
            "SELECT f.gradeValue FROM FinalGrade f WHERE f.semester.semesterId = :semesterId")
    List<java.math.BigDecimal> findAllGradeValuesBySemesterId(
            @org.springframework.data.repository.query.Param("semesterId") UUID semesterId);

    /**
     * Eager-load FinalGrade + student + semester + tm để tránh LazyInitializationException
     * khi export ngoài transaction boundary.
     */
    @Query("SELECT DISTINCT fg FROM FinalGrade fg "
            + "JOIN FETCH fg.student "
            + "LEFT JOIN FETCH fg.semester "
            + "LEFT JOIN FETCH fg.tm")
    List<FinalGrade> findAllWithStudentGraph();
}
