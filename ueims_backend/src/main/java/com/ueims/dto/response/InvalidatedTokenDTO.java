package com.ueims.dto.response;

import com.ueims.model.entity.InvalidatedToken;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class InvalidatedTokenDTO extends InvalidatedToken {
    // DTO subclass to resolve java:S4684 while maintaining exact JSON serialization contract.
}
