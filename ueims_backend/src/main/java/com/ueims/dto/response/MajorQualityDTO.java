package com.ueims.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Thống kê chất lượng sinh viên theo ngành mà một doanh nghiệp đã/đang tuyển.
 * Dùng cho Enterprise Quality Report.
 *
 * - major: tên ngành (e.g. "Software Engineering")
 * - totalStudents: tổng SV thuộc ngành này đã có assignment tại DN trong kỳ đang xét
 * - avgGpa: GPA trung bình (tính từ eligible_students của các SV đó)
 * - interviewsPassed: số interview có result = 'PASS'
 * - interviewsFailed: số interview có result = 'FAIL'
 * - interviewPassRate: tỷ lệ pass = passed / (passed + failed), 0 nếu chưa có interview
 * - avgFinalGrade: điểm tổng kết OJT trung bình (null nếu kỳ chưa chấm)
 */
public record MajorQualityDTO(
        UUID semesterId,
        String semesterCode,
        String semesterName,
        String major,
        long totalStudents,
        BigDecimal avgGpa,
        long interviewsPassed,
        long interviewsFailed,
        BigDecimal interviewPassRate,
        BigDecimal avgFinalGrade) {}
