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

import com.ueims.model.entity.Permission;
import com.ueims.repository.PermissionRepository;

@ExtendWith(MockitoExtension.class)
class PermissionServiceImplTest {

    @Mock
    private PermissionRepository repository;

    @InjectMocks
    private PermissionServiceImpl service;

    private Permission permission;
    private String permissionId;

    @BeforeEach
    void setUp() {
        permissionId = "READ_PRIVILEGE";
        permission = Permission.builder()
                .permissionName(permissionId)
                .description("Can read")
                .build();
    }

    @Test
    void findAllSuccess() {
        when(repository.findAll()).thenReturn(List.of(permission));

        List<Permission> result = service.findAll();

        assertEquals(1, result.size());
        assertEquals(permissionId, result.get(0).getPermissionName());
    }

    @Test
    void findByIdSuccess() {
        when(repository.findById(permissionId)).thenReturn(Optional.of(permission));

        Permission result = service.findById(permissionId);

        assertNotNull(result);
        assertEquals(permissionId, result.getPermissionName());
    }

    @Test
    void findByIdNotFound() {
        when(repository.findById(permissionId)).thenReturn(Optional.empty());

        Permission result = service.findById(permissionId);

        assertNull(result);
    }

    @Test
    void saveSuccess() {
        when(repository.save(any(Permission.class))).thenReturn(permission);

        Permission result = service.save(permission);

        assertNotNull(result);
        assertEquals(permissionId, result.getPermissionName());
    }

    @Test
    void deleteByIdSuccess() {
        service.deleteById(permissionId);

        verify(repository).deleteById(permissionId);
    }
}
