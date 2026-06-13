package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ueims.model.entity.RolePermission;
import com.ueims.model.entity.RolePermissionId;
import com.ueims.repository.RolePermissionRepository;

@ExtendWith(MockitoExtension.class)
class RolePermissionServiceImplTest {

    @Mock
    private RolePermissionRepository repository;

    @InjectMocks
    private RolePermissionServiceImpl service;

    private RolePermission rolePermission;
    private RolePermissionId rolePermissionId;

    @BeforeEach
    void setUp() {
        rolePermissionId = new RolePermissionId("ROLE_ADMIN", "READ_PRIVILEGE");
        rolePermission = RolePermission.builder().id(rolePermissionId).build();
    }

    @Test
    void findAllSuccess() {
        when(repository.findAll()).thenReturn(List.of(rolePermission));

        List<RolePermission> result = service.findAll();

        assertEquals(1, result.size());
        assertEquals(rolePermissionId, result.get(0).getId());
    }

    @Test
    void findByIdSuccess() {
        when(repository.findById(rolePermissionId)).thenReturn(Optional.of(rolePermission));

        RolePermission result = service.findById(rolePermissionId);

        assertNotNull(result);
        assertEquals(rolePermissionId, result.getId());
    }

    @Test
    void findByIdNotFound() {
        when(repository.findById(rolePermissionId)).thenReturn(Optional.empty());

        RolePermission result = service.findById(rolePermissionId);

        assertNull(result);
    }

    @Test
    void saveSuccess() {
        when(repository.save(any(RolePermission.class))).thenReturn(rolePermission);

        RolePermission result = service.save(rolePermission);

        assertNotNull(result);
        assertEquals(rolePermissionId, result.getId());
    }

    @Test
    void deleteByIdSuccess() {
        service.deleteById(rolePermissionId);

        verify(repository).deleteById(rolePermissionId);
    }
}
