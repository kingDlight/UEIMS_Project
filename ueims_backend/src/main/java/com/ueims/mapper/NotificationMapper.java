package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.ueims.dto.response.NotificationDTO;
import com.ueims.model.entity.Notification;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface NotificationMapper {
    NotificationDTO toDto(Notification entity);

    Notification toEntity(NotificationDTO dto);
}
