package com.ueims.dto.request;

import jakarta.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class CancelOjtRequest {
    @NotBlank(message = "Lý do huỷ kết quả thực tập là bắt buộc (BR-31)")
    private String reason;
}
