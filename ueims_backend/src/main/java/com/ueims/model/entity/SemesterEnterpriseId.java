package com.ueims.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

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
