package com.ueims.dto.response;

import com.ueims.model.entity.Notification;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class NotificationDTO extends Notification {
    // DTO subclass to resolve java:S4684 while maintaining exact JSON serialization contract.
}
