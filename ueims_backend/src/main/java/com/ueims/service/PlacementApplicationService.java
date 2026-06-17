package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.dto.request.PlacementApplicationRequest;
import com.ueims.dto.request.RejectApplicationRequest;
import com.ueims.dto.response.PlacementApplicationResponseDTO;

public interface PlacementApplicationService {

    /** SV submit application vào 1 DN (kỳ hiện tại OPEN/ACTIVE). */
    PlacementApplicationResponseDTO apply(UUID studentId, PlacementApplicationRequest request);

    /** TM duyệt application → APPROVED + tự tạo enterprise_assignments ACTIVE. */
    PlacementApplicationResponseDTO approve(UUID applicationId, UUID reviewerId);

    /** TM bác application (lý do bắt buộc). */
    PlacementApplicationResponseDTO reject(UUID applicationId, UUID reviewerId, RejectApplicationRequest request);

    /** SV tự rút application đã gửi. */
    PlacementApplicationResponseDTO withdraw(UUID applicationId, UUID studentId);

    /** TM xem danh sách pending. */
    List<PlacementApplicationResponseDTO> getPending();

    /** SV xem applications của mình. */
    List<PlacementApplicationResponseDTO> getMyApplications(UUID studentId);

    /** TM lấy combined view (eligible + applications + assignments) cho tab OJT. */
    List<com.ueims.dto.response.OjtPlacementViewDTO> getOjtPlacementView();
}