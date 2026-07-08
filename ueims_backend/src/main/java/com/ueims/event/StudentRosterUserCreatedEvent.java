package com.ueims.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Fired inside the roster-import transaction whenever a brand-new student user
 * is created. A {@link org.springframework.transaction.event.TransactionalEventListener}
 * picks it up {@code AFTER_COMMIT} so the welcome email only goes out if the
 * import row actually persists.
 */
@Getter
@AllArgsConstructor
public class StudentRosterUserCreatedEvent {
    private final String email;
    private final String fullName;
    private final String tempPassword;
}
