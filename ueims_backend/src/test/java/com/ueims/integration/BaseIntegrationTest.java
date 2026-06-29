package com.ueims.integration;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ueims.UeimsBackendApplication;
import com.ueims.service.MailService;
import com.ueims.service.websocket.NotificationBroadcaster;
import com.ueims.service.websocket.RequestLogBroadcaster;

/**
 * Base class for all Integration Tests.
 * Loads the full Spring Application Context with an in-memory H2 database (application-test.properties).
 * Mocks out external services (Mail, Websocket, JWT Decoder) to avoid runtime failures.
 */
@SpringBootTest(classes = UeimsBackendApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public abstract class BaseIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @MockBean
    protected MailService mailService;

    @Autowired
    protected NotificationBroadcaster notificationBroadcaster;

    @Autowired
    protected RequestLogBroadcaster requestLogBroadcaster;

    @TestConfiguration
    static class BroadcasterMockConfig {
        @Bean
        @Primary
        public NotificationBroadcaster notificationBroadcaster() {
            return new NotificationBroadcaster(null, null) {
                public void pushToUser(String userId, String destination, Object payload) {}

                public void pushUnreadCountToUser(String userId, int count) {}

                public void pushSystemAnnouncement(Object payload) {}

                public void pushToTopic(String topic, Object payload) {}
            };
        }

        @Bean
        @Primary
        public RequestLogBroadcaster requestLogBroadcaster() {
            return new RequestLogBroadcaster(null) {
                public void broadcastLog(Object logEntry) {}
            };
        }
    }

    @BeforeEach
    void setUpBase() {
        // Shared test setups
    }
}
