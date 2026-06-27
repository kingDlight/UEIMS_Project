package com.ueims.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Invalid validation key", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "User existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    ROLE_NOT_EXISTED(10051, "Role not existed", HttpStatus.NOT_FOUND),
    USER_ROLE_NOT_FOUND(10052, "User role not found", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    JOB_POST_NOT_FOUND(1009, "Job post not found", HttpStatus.NOT_FOUND),
    STUDENT_PROFILE_NOT_FOUND(1010, "Student profile not found", HttpStatus.NOT_FOUND),
    CV_NOT_UPLOADED(1011, "Please upload your CV in profile first", HttpStatus.BAD_REQUEST),
    INVALID_CV_FORMAT(1012, "CV must be in PDF format", HttpStatus.BAD_REQUEST),
    CV_SIZE_EXCEEDED(1013, "CV size must be under 5MB", HttpStatus.BAD_REQUEST),
    DUPLICATE_APPLICATION(1014, "You have already applied for this job post", HttpStatus.BAD_REQUEST),
    JOB_POST_CLOSED(1015, "Cannot apply to a CLOSED job post", HttpStatus.BAD_REQUEST),
    APPLICATION_DEADLINE_EXPIRED(
            1016, "This job posting has reached its deadline and is closed for registration", HttpStatus.BAD_REQUEST),
    MAX_APPLICATIONS_LIMIT_REACHED(1017, "You can submit at most 3 CV applications", HttpStatus.BAD_REQUEST),
    JOB_POST_ID_MANDATORY(1018, "Job post ID is mandatory", HttpStatus.BAD_REQUEST),
    STUDENT_ID_MANDATORY(1019, "Student ID is mandatory", HttpStatus.BAD_REQUEST),
    STUDENT_NOT_ELIGIBLE(1020, "Student is not registered or not eligible in this semester", HttpStatus.BAD_REQUEST),
    STUDENT_NOT_IN_SEMESTER_5(1021, "Only Semester 5 students are permitted to apply for jobs", HttpStatus.BAD_REQUEST),
    STUDENT_NOT_IN_SEMESTER_6(
            1022,
            "Only Semester 6 students are permitted to submit weekly reports and final reports",
            HttpStatus.BAD_REQUEST),
    STUDENT_NOT_IN_SEMESTER_7(
            1023, "Only Semester 7-9 students are permitted to submit enterprise feedback", HttpStatus.BAD_REQUEST),
    INVALID_FINAL_GRADE(1024, "Final grade must be at least 5.0 to pass", HttpStatus.BAD_REQUEST),

    // Semester / import related errors
    INVALID_EXCEL_FORMAT(
            1025, "Invalid Excel file format. Please check required columns and data types.", HttpStatus.BAD_REQUEST),
    SEMESTER_INVALID_DATE(1026, "Semester start date must be before end date", HttpStatus.BAD_REQUEST),
    SEMESTER_LOCKED_DATE(1027, "Cannot modify dates of an ACTIVE, CLOSED, or LOCKED semester", HttpStatus.BAD_REQUEST),
    DUPLICATE_STUDENT_IN_SEMESTER(
            1028, "Some students were skipped because they already exist in this semester", HttpStatus.OK),
    SEMESTER_NOT_FOUND(1029, "Semester not found", HttpStatus.NOT_FOUND),
    SEMESTER_INVALID_TRANSITION(
            1030,
            "Invalid semester status transition. Allowed: DRAFT\u2192OPEN, OPEN\u2192ACTIVE, ACTIVE\u2192CLOSED, CLOSED\u2192LOCKED",
            HttpStatus.UNPROCESSABLE_ENTITY),
    SEMESTER_EXISTED(1031, "Semester code already exists", HttpStatus.BAD_REQUEST),
    // Application related
    APPLICATION_NOT_FOUND(1032, "Application not found", HttpStatus.NOT_FOUND),
    FIELD_REQUIRED(1033, "This field is required", HttpStatus.BAD_REQUEST),
    MISSING_PARAMETER(1034, "Missing required request parameter: {param}", HttpStatus.BAD_REQUEST),
    INVALID_PARAMETER_FORMAT(
            1035, "Invalid format for parameter: {param}. Expected format: {type}", HttpStatus.BAD_REQUEST),
    APPLICATION_STATUS_CHANGED(
            1049,
            "Cannot withdraw. Your application is already being processed or has been reviewed by the enterprise.",
            HttpStatus.BAD_REQUEST),

    // Enterprise registration
    ENTERPRISE_EXISTED(1036, "Enterprise with this tax code already exists in the system", HttpStatus.BAD_REQUEST),
    TAX_CODE_EXISTED(1037, "Tax code is already used by another enterprise", HttpStatus.BAD_REQUEST),
    ENTERPRISE_REGISTRATION_SUCCESS(
            1038,
            "Registration successful. Your account will be activated upon approval by the Training Manager.",
            HttpStatus.OK),
    EXPORT_EXCEED_LIMIT(
            1039, "Export data exceeds the 10000 limit. Please select a narrower time range.", HttpStatus.BAD_REQUEST),
    DATA_INTEGRITY_VIOLATION(1040, "Data integrity violation: Foreign key or constraint error", HttpStatus.BAD_REQUEST),
    METHOD_NOT_SUPPORTED(
            1041, "Request method '{method}' is not supported for this API", HttpStatus.METHOD_NOT_ALLOWED),
    ENTERPRISE_NOT_FOUND(1042, "Enterprise not found", HttpStatus.NOT_FOUND),
    FINAL_REPORT_DEADLINE_EXPIRED(1043, "Cannot submit final report after semester end date", HttpStatus.BAD_REQUEST),
    INTERVIEW_NOT_FOUND(1044, "Interview not found", HttpStatus.NOT_FOUND),
    INTERVIEW_ALREADY_CONFIRMED(1045, "Interview already confirmed", HttpStatus.BAD_REQUEST),
    FINAL_REPORT_INVALID_FORMAT(1046, "Final report must be in PDF format", HttpStatus.BAD_REQUEST),
    FINAL_REPORT_SIZE_EXCEEDED(1047, "Final report size must not exceed 20MB", HttpStatus.BAD_REQUEST),
    EXPORT_LOG_EXCEED_LIMIT(
            1048,
            "Export aborted. Record count exceeds 50,000 threshold. Please shrink your search horizon filter properties.",
            HttpStatus.BAD_REQUEST),
    EXPORT_VOLUME_EXCEEDED(1050, "Export volume exceeds the maximum limit of 10,000 records", HttpStatus.BAD_REQUEST),
    INVALID_STATUS_FOR_OJT(
            1051,
            "One or more students do not meet the prerequisite status (ACCEPTED or MATCHED) for OJT approval",
            HttpStatus.BAD_REQUEST),
    ADMIN_INTERVENTION_REQUIRED(
            1052, "Admin intervention is required to modify an already approved OJT student", HttpStatus.FORBIDDEN),
    ELIGIBLE_STUDENT_NOT_FOUND(10521, "Eligible student not found", HttpStatus.NOT_FOUND),
    ELIGIBLE_STUDENT_DUPLICATE(
            10522,
            "Another student with the same student code already exists in this semester",
            HttpStatus.BAD_REQUEST),
    CANCEL_REASON_REQUIRED(
            10523, "Cancellation reason is required when status is set to CANCELLED (BR-23)", HttpStatus.BAD_REQUEST),
    INTERVIEW_DATE_MUST_BE_IN_FUTURE(1053, "Interview date must be in the future", HttpStatus.BAD_REQUEST),
    INTERVIEW_ELIGIBILITY_RULE(
            1054,
            "Only candidates who are Pending or have passed the screening round can be scheduled for an interview",
            HttpStatus.BAD_REQUEST),
    INTERVIEW_OVERLAP(
            1055, "Interview time overlaps with an existing schedule for the enterprise", HttpStatus.BAD_REQUEST),
    EVALUATION_LOCKED(1056, "Evaluation is locked and cannot be edited", HttpStatus.BAD_REQUEST),
    MISSING_EVALUATION_CRITERIA(1057, "All 4 criteria in the Rubrics must be graded", HttpStatus.BAD_REQUEST),
    INVALID_SCORE_RANGE(1058, "Criteria scores must be between 0.0 and 10.0", HttpStatus.BAD_REQUEST),
    STUDENT_RESULT_ACCESS_DENIED(
            1059, "Students can only view evaluation results from Semester 7 onwards", HttpStatus.FORBIDDEN),
    FEEDBACK_DUPLICATE(
            1060, "You have already submitted feedback for this enterprise in this semester", HttpStatus.BAD_REQUEST),
    FEEDBACK_RATING_INVALID(1061, "Feedback rating scores must be between 1 and 5", HttpStatus.BAD_REQUEST),
    FINAL_GRADE_NOT_FOUND(1062, "Final academic grade not found", HttpStatus.NOT_FOUND),
    EVALUATION_NOT_FOUND(1063, "Enterprise evaluation not found", HttpStatus.NOT_FOUND),
    ASSIGNMENT_NOT_FOUND(1064, "Enterprise assignment not found", HttpStatus.NOT_FOUND),
    STUDENT_ID_REQUIRED(1065, "Student ID is mandatory", HttpStatus.BAD_REQUEST),
    TM_ID_REQUIRED(1066, "Training Manager ID is mandatory", HttpStatus.BAD_REQUEST),
    SEMESTER_ID_REQUIRED(1067, "Semester ID is mandatory", HttpStatus.BAD_REQUEST),
    FEEDBACK_TEXT_REQUIRED(1071, "Feedback text is required when rejecting a report", HttpStatus.BAD_REQUEST),
    INTERVIEW_NOT_COMPLETED(
            1072, "Interview must be in COMPLETED status before recording a result", HttpStatus.BAD_REQUEST),
    INTERVIEW_PREMATURE_COMPLETION(
            1106,
            "Cannot mark interview as COMPLETED before the scheduled time has passed and a result is recorded",
            HttpStatus.BAD_REQUEST),
    JOB_POST_HAS_APPLICATIONS(1107, "Cannot delete a job post that has applications", HttpStatus.BAD_REQUEST),

    // Account related
    USER_PERMANENTLY_LOCKED(
            2007, "Your account has been permanently locked. Please contact the administrator.", HttpStatus.FORBIDDEN),
    USER_BANNED(2001, "Your account has been locked due to entering the wrong password 5 times", HttpStatus.FORBIDDEN),
    USER_LOCKED(
            2009,
            "Your account is locked. Please contact the administrator or wait 30 minutes for auto-unlock.",
            HttpStatus.FORBIDDEN),
    USER_INACTIVE(
            2008, "Your account is not active yet. Please wait for the administrator to approve your registration.", HttpStatus.FORBIDDEN),
    WRONG_OLD_PASSWORD(2002, "Incorrect old password", HttpStatus.BAD_REQUEST),
    PASSWORDS_NOT_MATCH(2003, "New password and confirmation password do not match", HttpStatus.BAD_REQUEST),
    USER_ALREADY_HAS_ROLE(2004, "User already has a role. Only one role can be assigned.", HttpStatus.BAD_REQUEST),
    ACCOUNT_COLLISION(
            2005,
            "Google account collides with an internal account using the same email. Please login with email/password or link your account.",
            HttpStatus.CONFLICT),
    GOOGLE_CLIENT_ID_NOT_CONFIGURED(
            2006,
            "Google client ID is not configured. Please set up GOOGLE_CLIENT_ID.",
            HttpStatus.INTERNAL_SERVER_ERROR),

    // JWT / Auth related
    TOKEN_INVALIDATED(1068, "Token has been invalidated", HttpStatus.UNAUTHORIZED),
    SESSION_EXPIRED(1069, "Session expired due to inactivity", HttpStatus.UNAUTHORIZED),
    INVALID_TOKEN_FORMAT(1070, "Invalid token format", HttpStatus.UNAUTHORIZED),

    // File related
    FILE_NOT_FOUND(1073, "The requested file is currently unavailable or has been removed", HttpStatus.NOT_FOUND),
    FILE_DOWNLOAD_ERROR(1074, "Failed to stream the requested file", HttpStatus.INTERNAL_SERVER_ERROR),
    RESOURCE_NOT_FOUND(1075, "Resource not found", HttpStatus.NOT_FOUND),
    INVALID_MESSAGE_PAYLOAD(1076, "Invalid JSON format or data type mismatch in request body", HttpStatus.BAD_REQUEST),
    UNSUPPORTED_MEDIA_TYPE(
            1077, "Unsupported media type. Please check your Content-Type header.", HttpStatus.UNSUPPORTED_MEDIA_TYPE),

    // Rate limiting
    RATE_LIMIT_EXCEEDED(4029, "Too many requests. Please try again after 1 minute.", HttpStatus.TOO_MANY_REQUESTS),

    // Placement application (OJT self-apply workflow)
    PLACEMENT_APP_NOT_FOUND(1078, "Placement application not found", HttpStatus.NOT_FOUND),
    DUPLICATE_PLACEMENT_APPLICATION(
            1079, "You have already applied to this enterprise for this semester", HttpStatus.BAD_REQUEST),
    PLACEMENT_APP_ALREADY_REVIEWED(1080, "This application has already been reviewed", HttpStatus.BAD_REQUEST),
    PLACEMENT_APP_NOT_PENDING(
            1081, "Only PENDING_APPROVAL applications can be reviewed or withdrawn", HttpStatus.BAD_REQUEST),
    STUDENT_HAS_ACTIVE_PLACEMENT(
            1082, "Student already has an active placement in this semester", HttpStatus.BAD_REQUEST),
    REJECTION_REASON_REQUIRED(
            1083, "Rejection reason is required and must be at least 5 characters", HttpStatus.BAD_REQUEST),
    STUDENT_NOT_ELIGIBLE_FOR_PLACEMENT(
            1084,
            "Student must be ACCEPTED or MATCHED in eligible_students before applying for placement",
            HttpStatus.BAD_REQUEST),
    ENTERPRISE_NOT_APPROVED(1085, "Enterprise must be APPROVED before students can apply", HttpStatus.BAD_REQUEST),
    NO_ACTIVE_SEMESTER(
            1086, "No OPEN or ACTIVE semester is available for placement applications", HttpStatus.BAD_REQUEST),
    STUDENT_NOT_UNPLACED(
            1087,
            "Student already has an active placement or pending application in this semester",
            HttpStatus.BAD_REQUEST),
    SAME_ENTERPRISE_REPLACEMENT_BLOCKED(
            1088,
            "Cannot request replacement to the same enterprise as the current active placement",
            HttpStatus.BAD_REQUEST),
    NO_AVAILABLE_ENTERPRISE_FOR_MATCH(
            1089, "No APPROVED enterprise is available to match this student", HttpStatus.BAD_REQUEST),
    GPA_BELOW_AUTO_MATCH_THRESHOLD(1090, "Student GPA is below the auto-match threshold (7.0)", HttpStatus.BAD_REQUEST),
    SEMESTER_NAME_INVALID(1091, "Semester name must be at least {min} characters", HttpStatus.BAD_REQUEST),
    SEMESTER_NAME_TOO_LONG(1092, "Semester name must not exceed {max} characters", HttpStatus.BAD_REQUEST),
    ENTERPRISE_NAME_INVALID_LENGTH(1093, "Enterprise name must not exceed {max} characters", HttpStatus.BAD_REQUEST),
    TAX_CODE_INVALID_LENGTH(1094, "Tax code must not exceed {max} characters", HttpStatus.BAD_REQUEST),
    WEBSITE_INVALID_LENGTH(1095, "Website URL must not exceed {max} characters", HttpStatus.BAD_REQUEST),
    INDUSTRY_INVALID_LENGTH(1096, "Industry must not exceed {max} characters", HttpStatus.BAD_REQUEST),
    DESCRIPTION_INVALID_LENGTH(1097, "Description must not exceed {max} characters", HttpStatus.BAD_REQUEST),
    ADDRESS_INVALID_LENGTH(1098, "Address must not exceed {max} characters", HttpStatus.BAD_REQUEST),
    LOGO_URL_INVALID_LENGTH(1099, "Logo URL must not exceed {max} characters", HttpStatus.BAD_REQUEST),
    CONTACT_PERSON_INVALID_LENGTH(1100, "Contact person must not exceed {max} characters", HttpStatus.BAD_REQUEST),
    CONTACT_PHONE_INVALID_LENGTH(1101, "Contact phone must not exceed {max} characters", HttpStatus.BAD_REQUEST),
    CONTACT_EMAIL_INVALID_LENGTH(1102, "Contact email must not exceed {max} characters", HttpStatus.BAD_REQUEST),
    REJECTION_REASON_INVALID_LENGTH(
            1103, "Rejection reason must be between {min} and {max} characters", HttpStatus.BAD_REQUEST),
    COVER_LETTER_INVALID_LENGTH(1104, "Cover letter must be <= {max} characters", HttpStatus.BAD_REQUEST),
    CANCEL_REASON_INVALID_LENGTH(1105, "Cancellation reason must not exceed {max} characters", HttpStatus.BAD_REQUEST),
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}
