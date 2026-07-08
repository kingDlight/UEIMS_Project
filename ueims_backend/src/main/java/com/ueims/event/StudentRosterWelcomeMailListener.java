package com.ueims.event;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.ueims.service.MailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Reacts to {@link StudentRosterUserCreatedEvent} after the enclosing import
 * transaction commits and sends the welcome email to the newly created student.
 * Tied to {@code AFTER_COMMIT} so a rolled-back row will never trigger a
 * notification, and so the user record is guaranteed to be persisted before
 * we hand the credentials to anyone.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StudentRosterWelcomeMailListener {

    private final MailService mailService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onStudentRosterCreated(StudentRosterUserCreatedEvent event) {
        try {
            mailService.sendRosterWelcomeMail(
                    event.getEmail(),
                    event.getFullName(),
                    event.getTempPassword());
        } catch (Exception e) {
            // Logging only — never let mail failures abort the import response.
            log.warn(
                    "[RosterWelcomeMail] Failed for {}: {}",
                    event.getEmail(),
                    e.getMessage());
        }
    }
}
