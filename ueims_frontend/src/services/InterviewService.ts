import { api } from "./api";

const API_URL = "/interviews";

export const InterviewService = {
  getAll: () => api.get(API_URL),
  getById: (id: string) => api.get(`${API_URL}/${id}`),
  getMySchedules: () => api.get(`${API_URL}/my-schedules`),
  getMyEnterprise: () => api.get(`${API_URL}/my-enterprise`),
  create: (data: any) => api.post(API_URL, data),
  update: (id: string, data: any) => api.put(`${API_URL}/${id}`, data),
  delete: (id: string) => api.delete(`${API_URL}/${id}`),
  confirm: (id: string) => api.post(`${API_URL}/${id}/confirm`),
  decline: (id: string, reason: string) =>
    api.post(`${API_URL}/${id}/decline`, null, { params: { reason } }),
  // UC-43
  cancel: (id: string, reason: string) =>
    api.post(`${API_URL}/${id}/cancel`, null, { params: { reason } }),
  reschedule: (
    id: string,
    newTime: string,
    reason?: string,
    meetingLink?: string,
    location?: string,
  ) =>
    api.post(`${API_URL}/${id}/reschedule`, null, {
      params: { newTime, reason, meetingLink, location },
    }),
  proposeSlots: (applicationId: string) =>
    api.get(`${API_URL}/propose-slots`, { params: { applicationId } }),
  // UC-44
  recordResult: (id: string, result: "PASS" | "FAIL", notes?: string) =>
    api.post(`${API_URL}/${id}/record-result`, null, {
      params: { result, notes },
    }),

// DEMO-MODE ONLY: move an interview's scheduled_datetime into the past so the
    // "record result" flow can be exercised without waiting for real time. Backend
    // enforces app.interview.demo-mode=true AND a reason ≥10 chars. Available to
    // ENTERPRISE (HR) for live demos, plus ADMIN/SYSTEM_ADMIN as a fallback.
    backdate: (id: string, newTime: string, reason: string) =>
      api.post(`${API_URL}/${id}/backdate-schedule`, null, {
        params: { newTime, reason },
      }),

    // DEMO-MODE ONLY: toggle the BR-35 trigger on the interviews table. Used by
    // the Enterprise toolbar during live presentations so any schedule time is
    // accepted. Backend enforces app.interview.demo-mode=true; ADMINs can also
    // call it but the UI button only lives on the Enterprise schedule page now.
    disableTrigger: () => api.post(`${API_URL}/disable-trigger`),
    enableTrigger: () => api.post(`${API_URL}/enable-trigger`),
  };
