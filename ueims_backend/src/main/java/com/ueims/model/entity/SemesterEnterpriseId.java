package com.ueims.model.entity;

import java.io.Serializable;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SemesterEnterpriseId implements Serializable {
    @Column(name = "semester_id")
    private UUID semesterId;

    @Column(name = "enterprise_id")
    private UUID enterpriseId;
}
