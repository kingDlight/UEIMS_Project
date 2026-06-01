package com.ueims.service;

import com.ueims.dto.request.EnterpriseRegistrationRequest;
import com.ueims.model.entity.Enterprise;
import com.ueims.model.entity.User;
import com.ueims.model.entity.UserRole;
import com.ueims.model.entity.UserRoleId;

public interface EnterpriseRegistrationService {
    void register(EnterpriseRegistrationRequest request);
}
