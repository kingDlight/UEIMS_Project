package com.ueims.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.ueims.dto.response.AuditLogResponseDTO;
import com.ueims.model.entity.AuditLog;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface AuditLogMapper {

    @Mapping(source = "logId", target = "id")
    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "user.email", target = "userEmail")
    @Mapping(source = "targetEntity", target = "entityType")
    @Mapping(source = "targetId", target = "entityId")
    @Mapping(target = "details", expression = "java(buildDetails(entity))")
    AuditLogResponseDTO toDto(AuditLog entity);

    default String buildDetails(AuditLog entity) {
        if (entity == null) return null;
        String oldVal = entity.getOldValue();
        String newVal = entity.getNewValue();
        if (oldVal != null && newVal != null) {
            return oldVal + " → " + newVal;
        }
        return oldVal != null ? oldVal : newVal;
    }
}
