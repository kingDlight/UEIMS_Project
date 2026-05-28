package com.ueims.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import lombok.*;

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

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "invalidated_at", nullable = false)
    @Builder.Default
    private LocalDateTime invalidatedAt = LocalDateTime.now();
}
