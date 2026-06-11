package com.ueims.service.impl;

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
        // Method only logs, so we just call it to cover it
        service.execute();
    }

    @Test
    void getJobNameSuccess() {
        assertEquals("PlaceholderCronJob", service.getJobName());
    }
}
