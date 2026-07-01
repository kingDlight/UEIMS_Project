package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.dto.response.MajorQualityDTO;

public interface EnterpriseAnalyticsService {
    /**
     * Aggregate chất lượng sinh viên theo ngành mà DN đã/đang tuyển.
     *
     * @param enterpriseId  enterprise của current user (lấy từ JWT)
     * @param semesterId    null = tất cả các kỳ DN từng có SV, cụ thể = filter theo kỳ
     * @return list các ngành kèm GPA trung bình, số pass/fail interview, điểm tổng kết
     */
    List<MajorQualityDTO> getStudentQualityByMajor(UUID enterpriseId, UUID semesterId);
}
