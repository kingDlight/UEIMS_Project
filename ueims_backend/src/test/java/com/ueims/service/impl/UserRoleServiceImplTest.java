package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
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

import com.ueims.exception.AppException;
import com.ueims.exception.ErrorCode;
import com.ueims.model.entity.User;
import com.ueims.model.entity.UserRole;
import com.ueims.model.entity.UserRoleId;
import com.ueims.repository.UserRoleRepository;

@ExtendWith(MockitoExtension.class)
class UserRoleServiceImplTest {

    @Mock
    private UserRoleRepository repository;

    @InjectMocks
    private UserRoleServiceImpl service;

    private UserRole userRole;
    private UserRoleId userRoleId;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        userRoleId = new UserRoleId(userId, "ROLE_STUDENT");

        User user = User.builder().userId(userId).build();
        userRole = UserRole.builder().id(userRoleId).user(user).build();
    }

    @Test
    void findAllSuccess() {
        when(repository.findAll()).thenReturn(List.of(userRole));

        List<UserRole> result = service.findAll();

        assertEquals(1, result.size());
        assertEquals(userRoleId, result.get(0).getId());
    }

    @Test
    void findByIdSuccess() {
        when(repository.findById(userRoleId)).thenReturn(Optional.of(userRole));

        UserRole result = service.findById(userRoleId);

        assertNotNull(result);
        assertEquals(userRoleId, result.getId());
    }

    @Test
    void findByIdNotFound() {
        when(repository.findById(userRoleId)).thenReturn(Optional.empty());

        UserRole result = service.findById(userRoleId);

        assertNull(result);
    }

    @Test
    void saveSuccess() {
        when(repository.countByUserUserId(userId)).thenReturn(0L);
        when(repository.save(any(UserRole.class))).thenReturn(userRole);

        UserRole result = service.save(userRole);

        assertNotNull(result);
        assertEquals(userRoleId, result.getId());
    }

    @Test
    void saveUserAlreadyHasRoleThrowsException() {
        when(repository.countByUserUserId(userId)).thenReturn(1L);

        AppException exception = assertThrows(AppException.class, () -> service.save(userRole));

        assertEquals(ErrorCode.USER_ALREADY_HAS_ROLE, exception.getErrorCode());
    }

    @Test
    void deleteByIdSuccess() {
        service.deleteById(userRoleId);

        verify(repository).deleteById(userRoleId);
    }
}
