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
            1038, "Registration successful. Your account will be activated upon approval by the Training Manager.", HttpStatus.OK),
    EXPORT_EXCEED_LIMIT(
            1039,
            "Export data exceeds the 10000 limit. Please select a narrower time range.",
            HttpStatus.BAD_REQUEST),
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
    INTERVIEW_DATE_MUST_BE_IN_FUTURE(1053, "Interview date must be in the future", HttpStatus.BAD_REQUEST),
    INTERVIEW_ELIGIBILITY_RULE(
            1054, "Chỉ những ứng viên đã vượt qua vòng sơ loại mới được lên lịch phỏng vấn", HttpStatus.BAD_REQUEST),
    INTERVIEW_OVERLAP(1055, "Thời gian phỏng vấn bị trùng với lịch đã có của doanh nghiệp", HttpStatus.BAD_REQUEST),
    EVALUATION_LOCKED(1056, "Đánh giá đã bị khóa và không thể chỉnh sửa", HttpStatus.BAD_REQUEST),
    MISSING_EVALUATION_CRITERIA(1057, "Cần phải chấm điểm đầy đủ cả 4 tiêu chí của Rubrics", HttpStatus.BAD_REQUEST),
    INVALID_SCORE_RANGE(1058, "Điểm các tiêu chí phải nằm trong khoảng từ 0.0 đến 10.0", HttpStatus.BAD_REQUEST),
    STUDENT_RESULT_ACCESS_DENIED(
            1059, "Sinh viên chỉ được xem kết quả đánh giá khi ở học kỳ 7 trở đi", HttpStatus.FORBIDDEN),

    // Account related
    USER_BANNED(2001, "Tài khoản của bạn đã bị khóa do nhập sai mật khẩu quá 5 lần", HttpStatus.FORBIDDEN),
    WRONG_OLD_PASSWORD(2002, "Mật khẩu cũ không chính xác", HttpStatus.BAD_REQUEST),
    PASSWORDS_NOT_MATCH(2003, "Mật khẩu mới và xác nhận không khớp", HttpStatus.BAD_REQUEST),
    USER_ALREADY_HAS_ROLE(2004, "Người dùng đã có vai trò. Chỉ được gán một vai trò duy nhất.", HttpStatus.BAD_REQUEST),

    // JWT / Auth related
    TOKEN_INVALIDATED(1053, "Token has been invalidated", HttpStatus.UNAUTHORIZED),
    SESSION_EXPIRED(1054, "Session expired due to inactivity", HttpStatus.UNAUTHORIZED),
    INVALID_TOKEN_FORMAT(1055, "Invalid token format", HttpStatus.UNAUTHORIZED),
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