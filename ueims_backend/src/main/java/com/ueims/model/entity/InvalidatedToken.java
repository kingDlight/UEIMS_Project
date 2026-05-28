package com.ueims.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.*;
import java.math.BigDecimal;

@Entity
@Table(name = "invalidated_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvalidatedToken {
    @Id
    @Column(name = "token_id")
    private String tokenId;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "invalidated_at")
    private LocalDateTime invalidatedAt;

}
