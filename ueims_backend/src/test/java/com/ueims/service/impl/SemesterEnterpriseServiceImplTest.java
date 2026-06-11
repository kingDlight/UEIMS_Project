package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ueims.model.entity.SemesterEnterprise;
import com.ueims.model.entity.SemesterEnterpriseId;
import com.ueims.repository.SemesterEnterpriseRepository;

@ExtendWith(MockitoExtension.class)
class SemesterEnterpriseServiceImplTest {

    @Mock
    private SemesterEnterpriseRepository repository;

    @InjectMocks
    private SemesterEnterpriseServiceImpl service;

    private SemesterEnterprise semesterEnterprise;
    private SemesterEnterpriseId semesterEnterpriseId;

    @BeforeEach
    void setUp() {
        semesterEnterpriseId = new SemesterEnterpriseId(UUID.randomUUID(), UUID.randomUUID());
        semesterEnterprise =
                SemesterEnterprise.builder().id(semesterEnterpriseId).build();
    }

    @Test
    void findAllSuccess() {
        when(repository.findAll()).thenReturn(List.of(semesterEnterprise));

        List<SemesterEnterprise> result = service.findAll();

        assertEquals(1, result.size());
        assertEquals(semesterEnterpriseId, result.get(0).getId());
    }

    @Test
    void findByIdSuccess() {
        when(repository.findById(semesterEnterpriseId)).thenReturn(Optional.of(semesterEnterprise));

        SemesterEnterprise result = service.findById(semesterEnterpriseId);

        assertNotNull(result);
        assertEquals(semesterEnterpriseId, result.getId());
    }

    @Test
    void findByIdNotFound() {
        when(repository.findById(semesterEnterpriseId)).thenReturn(Optional.empty());

        SemesterEnterprise result = service.findById(semesterEnterpriseId);

        assertNull(result);
    }

    @Test
    void saveSuccess() {
        when(repository.save(any(SemesterEnterprise.class))).thenReturn(semesterEnterprise);

        SemesterEnterprise result = service.save(semesterEnterprise);

        assertNotNull(result);
        assertEquals(semesterEnterpriseId, result.getId());
    }

    @Test
    void deleteByIdSuccess() {
        service.deleteById(semesterEnterpriseId);

        verify(repository).deleteById(semesterEnterpriseId);
    }
}
