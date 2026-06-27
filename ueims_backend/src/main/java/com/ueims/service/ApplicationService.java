package com.ueims.service;

import java.util.List;
import java.util.UUID;

import com.ueims.dto.request.ApplicationRequest;
import com.ueims.dto.request.ApplicationScreenRequest;
import com.ueims.dto.request.ApplicationStatusUpdateRequest;
import com.ueims.dto.response.ApplicationResponse;
import com.ueims.model.entity.Application;

public interface ApplicationService {
    List<ApplicationResponse> findAll();

    List<ApplicationResponse> findMyApplications();

    List<ApplicationResponse> findByEnterpriseId(UUID enterpriseId, String search);

    ApplicationResponse findById(UUID id);

    ApplicationResponse applyForJob(ApplicationRequest request);

    void deleteById(UUID id);

    ApplicationResponse withdrawApplication(UUID applicationId);

    ApplicationResponse screenApplication(UUID id, ApplicationScreenRequest request);

    ApplicationResponse updateStatus(UUID id, ApplicationStatusUpdateRequest request);

    /**
     * UC-40: Download applicant's CV file. Enforces BR-32 (only enterprise that owns the
     * job post can download). Throws FILE_NOT_FOUND if the underlying file is missing.
     * Increments the download counter on the application (POST-2 of UC-40).
     *
     * @return a Spring Resource pointing to the CV file on disk
     */
    org.springframework.core.io.Resource downloadCv(UUID applicationId);

    /**
     * UC-40.1: Bulk Download multiple applicant CV files.
     * Enforces BR-32 (only enterprise that owns the job post can download).
     *
     * @return a Spring Resource pointing to the generated ZIP file
     */
    org.springframework.core.io.Resource bulkDownloadCv(List<UUID> applicationIds);

    /**
     * BR-26 helper exposed for cross-service use: withdraw every other
     * non-terminal application of the same student in the same semester as the
     * supplied trigger application. Called whenever an application transitions
     * to a terminal "won" status (SCREENING_PASSED / ACCEPTED) so other
     * enterprises don't waste cycles reviewing CVs for a student who's already
     * committed elsewhere.
     *
     * <p>Implementation lives on the impl class because it touches several
     * repositories and the notification service.
     */
    void withdrawOtherApplicationsInSemester(Application trigger, String triggerReason);
}
