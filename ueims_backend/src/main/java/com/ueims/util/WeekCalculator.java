package com.ueims.util;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Utility class to calculate week numbers based on semester start date.
 */
public final class WeekCalculator {
    private WeekCalculator() {}

    /**
     * Calculate the current week number within a semester.
     *
     * @param semesterStartDate The start date of the semester
     * @param currentDate The current date (or reference date)
     * @return The week number (1-indexed), or 0 if before semester start
     */
    public static Integer calculateCurrentWeek(LocalDate semesterStartDate, LocalDate currentDate) {
        if (currentDate.isBefore(semesterStartDate)) {
            return 0;
        }

        // Calculate days elapsed since semester start
        long daysElapsed = ChronoUnit.DAYS.between(semesterStartDate, currentDate);

        // Week number is (days / 7) + 1, e.g., days 0-6 = week 1, days 7-13 = week 2
        return (int) (daysElapsed / 7) + 1;
    }

    /**
     * Get the current week number based on today's date and semester start date.
     */
    public static Integer getCurrentWeek(LocalDate semesterStartDate) {
        return calculateCurrentWeek(semesterStartDate, LocalDate.now());
    }
}
