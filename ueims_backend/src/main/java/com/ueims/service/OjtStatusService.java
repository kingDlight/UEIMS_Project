package com.ueims.service;

import com.ueims.dto.response.OjtStatusResponse;

public interface OjtStatusService {
    OjtStatusResponse getOjtStatusForCurrentUser(String email);
}
