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

import com.ueims.model.entity.Role;
import com.ueims.repository.RoleRepository;

@ExtendWith(MockitoExtension.class)
class RoleServiceImplTest {

    @Mock
    private RoleRepository repository;

    @InjectMocks
    private RoleServiceImpl service;

    private Role role;
    private String roleId;

    @BeforeEach
    void setUp() {
        roleId = "ROLE_STUDENT";
        role = Role.builder().roleName(roleId).description("Student Role").build();
    }

    @Test
    void findAllSuccess() {
        when(repository.findAll()).thenReturn(List.of(role));

        List<Role> result = service.findAll();

        assertEquals(1, result.size());
        assertEquals(roleId, result.get(0).getRoleName());
    }

    @Test
    void findByIdSuccess() {
        when(repository.findById(roleId)).thenReturn(Optional.of(role));

        Role result = service.findById(roleId);

        assertNotNull(result);
        assertEquals(roleId, result.getRoleName());
    }

    @Test
    void findByIdNotFound() {
        when(repository.findById(roleId)).thenReturn(Optional.empty());

        Role result = service.findById(roleId);

        assertNull(result);
    }

    @Test
    void saveSuccess() {
        when(repository.save(any(Role.class))).thenReturn(role);

        Role result = service.save(role);

        assertNotNull(result);
        assertEquals(roleId, result.getRoleName());
    }

    @Test
    void deleteByIdSuccess() {
        service.deleteById(roleId);

        verify(repository).deleteById(roleId);
    }
}
