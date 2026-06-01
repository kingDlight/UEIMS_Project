package com.ueims.exception;

import java.util.Map;
import java.util.Objects;

import jakarta.validation.ConstraintViolation;

import org.springframework.http.ResponseEntity;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import com.ueims.dto.response.ApiResponse;

import lombok.extern.slf4j.Slf4j;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    private static final String MIN_ATTRIBUTE = "min";

    @ExceptionHandler(value = JpaSystemException.class)
    ResponseEntity<ApiResponse> handlingJpaSystemException(JpaSystemException exception) {
        String message = exception.getMostSpecificCause().getMessage();
        log.warn("DB constraint violation: {}", message);
        ErrorCode errorCode = ErrorCode.SEMESTER_INVALID_TRANSITION;
        // Extract the readable DB trigger message (after "ERROR: ")
        String userMessage = message != null && message.contains("ERROR: ")
                ? message.substring(message.indexOf("ERROR: ") + 7).split("\n")[0]
                : errorCode.getMessage();
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(userMessage)
                        .build());
    }

    @ExceptionHandler(value = Exception.class)
    ResponseEntity<ApiResponse> handlingRuntimeException(Exception exception) {
        log.error("Exception: ", exception);
        ApiResponse apiResponse = new ApiResponse();

        apiResponse.setCode(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode());
        apiResponse.setMessage(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage());

        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse> handlingAppException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        ApiResponse apiResponse = new ApiResponse();

        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());

        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }

    @ExceptionHandler(value = AccessDeniedException.class)
    ResponseEntity<ApiResponse> handlingAccessDeniedException(AccessDeniedException exception) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;

        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(value = MissingServletRequestPartException.class)
    ResponseEntity<ApiResponse> handlingMissingPart(MissingServletRequestPartException exception) {
        log.warn("Missing multipart part: {}", exception.getRequestPartName());
        ErrorCode errorCode = ErrorCode.INVALID_EXCEL_FORMAT;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message("Required file part '" + exception.getRequestPartName()
                                + "' is missing. Please attach the file in form-data.")
                        .build());
    }

    @ExceptionHandler(value = org.springframework.web.bind.MissingServletRequestParameterException.class)
    ResponseEntity<ApiResponse> handlingMissingParameter(
            org.springframework.web.bind.MissingServletRequestParameterException exception) {
        log.warn("Missing request parameter: {}", exception.getParameterName());
        ErrorCode errorCode = ErrorCode.MISSING_PARAMETER;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage().replace("{param}", exception.getParameterName()))
                        .build());
    }

    @ExceptionHandler(value = org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class)
    ResponseEntity<ApiResponse> handlingTypeMismatch(
            org.springframework.web.method.annotation.MethodArgumentTypeMismatchException exception) {
        log.warn("Type mismatch for parameter: {}", exception.getName());
        ErrorCode errorCode = ErrorCode.INVALID_PARAMETER_FORMAT;
        String requiredType = exception.getRequiredType() != null
                ? exception.getRequiredType().getSimpleName()
                : "Unknown";
        String message =
                errorCode.getMessage().replace("{param}", exception.getName()).replace("{type}", requiredType);

        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(message)
                        .build());
    }

    @ExceptionHandler(value = MultipartException.class)
    ResponseEntity<ApiResponse> handlingMultipartException(MultipartException exception) {
        log.warn("Multipart error: {}", exception.getMessage());
        ErrorCode errorCode = ErrorCode.INVALID_EXCEL_FORMAT;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(
                                "Invalid multipart request. Make sure Content-Type is multipart/form-data and the file is attached.")
                        .build());
    }

    @ExceptionHandler(value = MaxUploadSizeExceededException.class)
    ResponseEntity<ApiResponse> handlingMaxUploadSize(MaxUploadSizeExceededException exception) {
        log.warn("File too large: {}", exception.getMessage());
        ErrorCode errorCode = ErrorCode.INVALID_EXCEL_FORMAT;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message("Uploaded file exceeds the maximum allowed size.")
                        .build());
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse> handlingValidation(MethodArgumentNotValidException exception) {
        String enumKey = exception.getFieldError().getDefaultMessage();

        ErrorCode errorCode = ErrorCode.INVALID_KEY;
        Map<String, Object> attributes = null;
        try {
            errorCode = ErrorCode.valueOf(enumKey);

            var constraintViolation =
                    exception.getBindingResult().getAllErrors().get(0).unwrap(ConstraintViolation.class);

            attributes = constraintViolation.getConstraintDescriptor().getAttributes();

            log.info(attributes.toString());

        } catch (IllegalArgumentException e) {

        }

        ApiResponse apiResponse = new ApiResponse();

        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(
                Objects.nonNull(attributes)
                        ? mapAttribute(errorCode.getMessage(), attributes)
                        : errorCode.getMessage());

        return ResponseEntity.badRequest().body(apiResponse);
    }

    private String mapAttribute(String message, Map<String, Object> attributes) {
        String minValue = String.valueOf(attributes.get(MIN_ATTRIBUTE));

        return message.replace("{" + MIN_ATTRIBUTE + "}", minValue);
    }
}
