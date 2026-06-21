package com.ueims.exception;

import java.util.Map;
import java.util.Objects;

import jakarta.validation.ConstraintViolation;

import org.springframework.http.ResponseEntity;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import com.ueims.dto.response.ApiResponse;

import lombok.extern.slf4j.Slf4j;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    private static final String MIN_ATTRIBUTE = "min";
    private static final String ERROR_PREFIX = "ERROR: ";

    @ExceptionHandler(value = org.springframework.transaction.UnexpectedRollbackException.class)
    ResponseEntity<ApiResponse<Void>> handlingUnexpectedRollbackException(
            org.springframework.transaction.UnexpectedRollbackException exception) {
        String causeMessage = exception.getMostSpecificCause() != null
                ? exception.getMostSpecificCause().getMessage()
                : exception.getMessage();
        log.error("Transaction rolled back unexpectedly, root cause: {}", causeMessage);
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setCode(ErrorCode.DATA_INTEGRITY_VIOLATION.getCode());
        apiResponse.setMessage("Operation failed: " + causeMessage);
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(value = JpaSystemException.class)
    ResponseEntity<ApiResponse<Void>> handlingJpaSystemException(JpaSystemException exception) {
        String message = exception.getMostSpecificCause().getMessage();
        log.warn("DB constraint violation: {}", message);
        ErrorCode errorCode = ErrorCode.DATA_INTEGRITY_VIOLATION;
        // Extract the readable DB trigger message (after "ERROR: ")
        String userMessage = message != null && message.contains(ERROR_PREFIX)
                ? message.substring(message.indexOf(ERROR_PREFIX) + ERROR_PREFIX.length())
                        .split("\n")[0]
                : errorCode.getMessage();
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(userMessage)
                        .build());
    }

    @ExceptionHandler(value = org.springframework.dao.DataIntegrityViolationException.class)
    ResponseEntity<ApiResponse<Void>> handlingDataIntegrityViolationException(
            org.springframework.dao.DataIntegrityViolationException exception) {
        String message = exception.getMostSpecificCause().getMessage();
        log.warn("Data integrity violation: {}", message);
        ErrorCode errorCode = ErrorCode.DATA_INTEGRITY_VIOLATION;
        String userMessage;
        if (message != null && message.contains("users_roles_pkey")) {
            errorCode = ErrorCode.USER_ALREADY_HAS_ROLE;
            userMessage = errorCode.getMessage();
        } else {
            userMessage = message != null && message.contains(ERROR_PREFIX)
                    ? message.substring(message.indexOf(ERROR_PREFIX) + ERROR_PREFIX.length())
                            .split("\n")[0]
                    : errorCode.getMessage();
        }
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(userMessage)
                        .build());
    }

    @ExceptionHandler(value = IllegalArgumentException.class)
    ResponseEntity<ApiResponse<Void>> handlingIllegalArgumentException(IllegalArgumentException exception) {
        log.warn("Illegal argument: {}", exception.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponse.<Void>builder()
                        .code(org.springframework.http.HttpStatus.BAD_REQUEST.value())
                        .message(exception.getMessage())
                        .build());
    }

    @ExceptionHandler(value = HttpRequestMethodNotSupportedException.class)
    ResponseEntity<ApiResponse<Void>> handlingHttpRequestMethodNotSupportedException(
            HttpRequestMethodNotSupportedException exception) {
        log.warn("Method not supported: {}", exception.getMessage());
        ErrorCode errorCode = ErrorCode.METHOD_NOT_SUPPORTED;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage().replace("{method}", exception.getMethod()))
                        .build());
    }

    @ExceptionHandler(value = org.springframework.web.servlet.resource.NoResourceFoundException.class)
    ResponseEntity<ApiResponse<Void>> handlingNoResourceFoundException(
            org.springframework.web.servlet.resource.NoResourceFoundException exception) {
        log.warn("Resource not found: {}", exception.getMessage());
        ErrorCode errorCode = ErrorCode.RESOURCE_NOT_FOUND;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(value = org.springframework.http.converter.HttpMessageNotReadableException.class)
    ResponseEntity<ApiResponse<Void>> handlingHttpMessageNotReadableException(
            org.springframework.http.converter.HttpMessageNotReadableException exception) {
        log.warn("Http message not readable: {}", exception.getMessage());
        ErrorCode errorCode = ErrorCode.INVALID_MESSAGE_PAYLOAD;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(value = org.springframework.web.HttpMediaTypeNotSupportedException.class)
    ResponseEntity<ApiResponse<Void>> handlingHttpMediaTypeNotSupportedException(
            org.springframework.web.HttpMediaTypeNotSupportedException exception) {
        log.warn("Unsupported media type: {}", exception.getMessage());
        ErrorCode errorCode = ErrorCode.UNSUPPORTED_MEDIA_TYPE;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(value = Exception.class)
    ResponseEntity<ApiResponse<Void>> handlingRuntimeException(Exception exception) {
        log.error("Exception: ", exception);
        ApiResponse<Void> apiResponse = new ApiResponse<>();

        apiResponse.setCode(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode());
        apiResponse.setMessage(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage());

        return ResponseEntity.status(ErrorCode.UNCATEGORIZED_EXCEPTION.getStatusCode())
                .body(apiResponse);
    }

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse<Void>> handlingAppException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        ApiResponse<Void> apiResponse = new ApiResponse<>();

        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(
                exception.getMessage() != null && !exception.getMessage().isEmpty()
                        ? exception.getMessage()
                        : errorCode.getMessage());

        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }

    @ExceptionHandler(value = AccessDeniedException.class)
    ResponseEntity<ApiResponse<Void>> handlingAccessDeniedException(AccessDeniedException exception) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;

        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(value = MissingServletRequestPartException.class)
    ResponseEntity<ApiResponse<Void>> handlingMissingPart(MissingServletRequestPartException exception) {
        log.warn("Missing multipart part: {}", exception.getRequestPartName());
        ErrorCode errorCode = ErrorCode.INVALID_EXCEL_FORMAT;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message("Required file part '" + exception.getRequestPartName()
                                + "' is missing. Please attach the file in form-data.")
                        .build());
    }

    @ExceptionHandler(value = MissingServletRequestParameterException.class)
    ResponseEntity<ApiResponse<Void>> handlingMissingParameter(
            org.springframework.web.bind.MissingServletRequestParameterException exception) {
        log.warn("Missing request parameter: {}", exception.getParameterName());
        ErrorCode errorCode = ErrorCode.MISSING_PARAMETER;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage().replace("{param}", exception.getParameterName()))
                        .build());
    }

    @ExceptionHandler(value = MethodArgumentTypeMismatchException.class)
    ResponseEntity<ApiResponse<Void>> handlingTypeMismatch(MethodArgumentTypeMismatchException exception) {
        log.warn("Type mismatch for parameter: {}", exception.getName());
        ErrorCode errorCode = ErrorCode.INVALID_PARAMETER_FORMAT;
        String requiredType = exception.getRequiredType() != null
                ? exception.getRequiredType().getSimpleName()
                : "Unknown";
        String message =
                errorCode.getMessage().replace("{param}", exception.getName()).replace("{type}", requiredType);

        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(message)
                        .build());
    }

    @ExceptionHandler(value = MultipartException.class)
    ResponseEntity<ApiResponse<Void>> handlingMultipartException(MultipartException exception) {
        log.warn("Multipart error: {}", exception.getMessage());
        ErrorCode errorCode = ErrorCode.INVALID_EXCEL_FORMAT;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(
                                "Invalid multipart request. Make sure Content-Type is multipart/form-data and the file is attached.")
                        .build());
    }

    @ExceptionHandler(value = MaxUploadSizeExceededException.class)
    ResponseEntity<ApiResponse<Void>> handlingMaxUploadSize(MaxUploadSizeExceededException exception) {
        log.warn("File too large: {}", exception.getMessage());
        ErrorCode errorCode = ErrorCode.INVALID_EXCEL_FORMAT;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message("Uploaded file exceeds the maximum allowed size.")
                        .build());
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    @SuppressWarnings("unchecked")
    ResponseEntity<ApiResponse<Void>> handlingValidation(MethodArgumentNotValidException exception) {
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
            // enumKey is not a valid ErrorCode name — fall through; the raw
            // field message will be used as the user-facing message below.
        }

        // UC-36 Exception 36.0.E1: when any mandatory field is left blank,
        // surface the generic "Please fill in all required fields." message.
        // Field-level details are still shown to the user via the client-side
        // form validation (Antd Form rules) for highlighted inputs.
        String firstFieldMessage =
                exception.getFieldError() != null ? exception.getFieldError().getDefaultMessage() : null;
        boolean hasBlankOrNullFailure = exception.getBindingResult().getFieldErrors().stream()
                .anyMatch(fe -> fe.getCode() != null
                        && (fe.getCode().equals("NotBlank")
                                || fe.getCode().equals("NotNull")
                                || fe.getCode().equals("NotEmpty")));

        ApiResponse<Void> apiResponse = new ApiResponse<>();

        if (hasBlankOrNullFailure) {
            apiResponse.setCode(ErrorCode.FIELD_REQUIRED.getCode());
            apiResponse.setMessage("Please fill in all required fields.");
        } else {
            apiResponse.setCode(errorCode.getCode());
            apiResponse.setMessage(
                    Objects.nonNull(attributes)
                            ? mapAttribute(errorCode.getMessage(), attributes)
                            : (firstFieldMessage != null ? firstFieldMessage : errorCode.getMessage()));
        }

        return ResponseEntity.badRequest().body(apiResponse);
    }

    private String mapAttribute(String message, Map<String, Object> attributes) {
        String minValue = String.valueOf(attributes.get(MIN_ATTRIBUTE));

        return message.replace("{" + MIN_ATTRIBUTE + "}", minValue);
    }
}
