package com.ueims.service.impl;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PlaceholderCronJobImplTest {

    @InjectMocks
    private PlaceholderCronJobImpl service;

    @Test
    void executeSuccess() {
        assertDoesNotThrow(() -> service.execute());
    }

    @Test
    void getJobNameSuccess() {
        assertEquals("PlaceholderCronJob", service.getJobName());
    }
}
