import React, { useEffect, useMemo, useState } from "react";
import {
  Spin,
  App,
  Modal,
  Button,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Form,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  EditOutlined,
  StopOutlined,
  SearchOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { InterviewService } from "@/services/InterviewService";
import { ApplicationService } from "@/services/ApplicationService";
import { useAuthStore } from "@/stores/useAuthStore";

const { TextArea } = Input;

// Demo-mode build flag. Mirrors backend app.interview.demo-mode. Flip to FALSE
// before any production build to hide the "Backdate Interview" toolbar button.
// Default is TRUE for thesis-demo convenience.
const DEMO_MODE = true;

type InterviewStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "RESCHEDULED"
  | "CANCELED"
  | "COMPLETED"
  | "RESULT_RECORDED"
  | "CANCELLED";
type StatusFilter = "ALL" | "UPCOMING" | "COMPLETED" | "CANCELED";

interface InterviewRow {
  interviewId: string;
  applicationId?: string;
  studentName?: string;
  jobTitle?: string;
  enterpriseName?: string;
  scheduledTime?: string;
  durationMinutes?: number;
  location?: string;
  meetingLink?: string;
  status?: InterviewStatus;
  result?: string;
}

const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  SCHEDULED: { label: "Scheduled", color: "text-blue-500", bg: "bg-blue-50" },
  CONFIRMED: {
    label: "Confirmed",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  RESCHEDULED: {
    label: "Rescheduled",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  CANCELED: { label: "Canceled", color: "text-red-500", bg: "bg-red-50" },
  CANCELLED: { label: "Canceled", color: "text-red-500", bg: "bg-red-50" },
  COMPLETED: {
    label: "Completed",
    color: "text-slate-600",
    bg: "bg-slate-100",
  },
  RESULT_RECORDED: {
    label: "Result recorded",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
};

function statusOf(i: InterviewRow): InterviewStatus {
  return (i.status ?? "SCHEDULED") as InterviewStatus;
}

function matchesFilter(i: InterviewRow, filter: StatusFilter): boolean {
  const s = statusOf(i);
  if (filter === "ALL") return true;
  if (filter === "UPCOMING")
    return s === "SCHEDULED" || s === "CONFIRMED" || s === "RESCHEDULED";
  if (filter === "COMPLETED")
    return s === "COMPLETED" || s === "RESULT_RECORDED";
  if (filter === "CANCELED") return s === "CANCELED" || s === "CANCELLED";
  return true;
}

export const InterviewScheduleTab: React.FC = () => {
  const { message } = App.useApp();
  const [interviews, setInterviews] = useState<InterviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<InterviewRow | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [proposedSlots, setProposedSlots] = useState<string[]>([]);
  const [proposing, setProposing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [backdateOpen, setBackdateOpen] = useState(false);
  const [backdateForm] = Form.useForm();
  const user = useAuthStore((s) => s.user);
  const [applications, setApplications] = useState<any[]>([]);
  const [fetchingOptions, setFetchingOptions] = useState(false);
  const [form] = Form.useForm();
  const [rescheduleForm] = Form.useForm();
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await InterviewService.getMyEnterprise();
      const data: InterviewRow[] = res.data?.result ?? res.data ?? [];
      setInterviews(Array.isArray(data) ? data : []);
    } catch (err: any) {
      // UC-42 42.0.E1
      const msg =
        err?.response?.data?.message ??
        "Unable to sync calendar schedules. Please refresh your browser or try again later.";
      setError(msg);
      message.error(msg);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (search?: string) => {
    try {
      setFetchingOptions(true);
      const res = await ApplicationService.getMyEnterprise(search);
      const data: any[] = res.data?.result ?? res.data ?? [];
      setApplications(
        (Array.isArray(data) ? data : []).filter(
          (a: any) =>
            a.status === "SCREENING_PASSED" ||
            a.status === "INTERVIEW_SCHEDULED" ||
            a.status === "PENDING",
        ),
      );
    } catch {
      setApplications([]);
    } finally {
      setFetchingOptions(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
    fetchApplications();

    // Refetch when application status changes elsewhere (e.g. Kanban reject).
    const onStatusUpdated = () => {
      fetchInterviews();
      fetchApplications();
    };
    window.addEventListener("application-status-updated", onStatusUpdated);
    return () =>
      window.removeEventListener("application-status-updated", onStatusUpdated);
  }, []);

  const filtered = useMemo(() => {
    return interviews
      .filter((i) => matchesFilter(i, filter))
      .filter((i) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          (i.studentName ?? "").toLowerCase().includes(q) ||
          (i.jobTitle ?? "").toLowerCase().includes(q)
        );
      });
  }, [interviews, filter, search]);

  const handlePropose = async (applicationId: string) => {
    if (!applicationId) return;
    setProposing(true);
    try {
      const res = await InterviewService.proposeSlots(applicationId);
      const data: string[] = res.data?.result ?? res.data ?? [];
      setProposedSlots(Array.isArray(data) ? data : []);
      if (data.length === 0)
        message.info("No free slots found in the next 2 weeks.");
    } catch (err: any) {
      message.error(
        err?.response?.data?.message ?? "Failed to fetch proposed slots.",
      );
    } finally {
      setProposing(false);
    }
  };

  const handleSubmitSchedule = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const dt: Dayjs = values.scheduledTime;
      const payload = {
        applicationId: values.applicationId,
        scheduledTime: dt.toISOString(),
        durationMinutes: values.durationMinutes ?? 60,
        location: values.location,
        meetingLink: values.meetingLink,
        status: "SCHEDULED",
      };
      await InterviewService.create(payload);
      message.success("Interview scheduled successfully.");
      setScheduleOpen(false);
      form.resetFields();
      setProposedSlots([]);
      await fetchInterviews();
    } catch (err: any) {
      if (err?.errorFields) return; // validation error
      const code = err?.response?.data?.code;
      const msg = err?.response?.data?.message;
      if (code === 1053) {
        message.error(
          "Interview time cannot be scheduled in the past. Please select a future time.",
        );
      } else if (code === 1055) {
        message.error(
          "This time overlaps an existing appointment. Please pick a different slot.",
        );
      } else if (code === 1054) {
        message.error(
          "Only applicants in Pending or Screening Passed phase are eligible for interview scheduling.",
        );
      } else if (code === 1072) {
        message.error(msg ?? "Interview is not in a valid state.");
      } else {
        message.error(msg ?? "Failed to schedule interview.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReschedule = async () => {
    if (!selected) return;
    try {
      const values = await rescheduleForm.validateFields();
      setSubmitting(true);

      const newTime = values.newTime as Dayjs;
      const oldTime = selected.scheduledTime
        ? dayjs(selected.scheduledTime)
        : null;

      if (oldTime && newTime.isSame(oldTime, "minute")) {
        // Time didn't change, just update details
        await InterviewService.update(selected.interviewId, {
          location: values.location,
          meetingLink: values.meetingLink,
        });
        message.success("Interview details updated.");
      } else {
        // Time changed, trigger reschedule workflow
        await InterviewService.reschedule(
          selected.interviewId,
          newTime.toISOString(),
          values.reason,
          values.meetingLink,
          values.location,
        );
        message.success("Interview rescheduled. The student will be notified.");
      }

      setRescheduleOpen(false);
      rescheduleForm.resetFields();
      await fetchInterviews();
    } catch (err: any) {
      if (err?.errorFields) return;
      const msg = err?.response?.data?.message;
      message.error(msg ?? "Failed to update interview.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!selected) return;
    if (!cancelReason.trim()) {
      message.warning("Please provide a reason for cancellation.");
      return;
    }
    setSubmitting(true);
    try {
      await InterviewService.cancel(selected.interviewId, cancelReason);
      message.success("Interview canceled. The student will be notified.");
      setCancelOpen(false);
      setCancelReason("");
      await fetchInterviews();
    } catch (err: any) {
      message.error(
        err?.response?.data?.message ?? "Failed to cancel interview.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Demo only: move a future interview's scheduled time into the past so the
  // "Record result" flow can be exercised without waiting. Backend stamps the
  // audit trail (is_backdated, backdated_by, backdated_reason) and BR-35 trigger
  // accepts the UPDATE only when those fields are populated.
  const handleBackdate = async () => {
    try {
      const values = await backdateForm.validateFields();
      if (!values.interviewId) {
        message.warning("Please pick an interview.");
        return;
      }
      setSubmitting(true);
      await InterviewService.backdate(
        values.interviewId,
        (values.newTime as Dayjs).toISOString(),
        values.reason.trim(),
      );
      message.success("Interview backdated. Audit trail recorded.");
      setBackdateOpen(false);
      backdateForm.resetFields();
      await fetchInterviews();
    } catch (err: any) {
      if (err?.errorFields) return; // form validation error already shown
      const apiMsg = err?.response?.data?.message;
      message.error(apiMsg ?? "Failed to backdate interview.");
    } finally {
      setSubmitting(false);
    }
  };

  const isAdmin = (user?.roles ?? []).some(
    (r) => r === "ADMIN" || r === "SYSTEM_ADMIN",
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="pb-10 font-sans">
      <div className="px-6 pb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 m-0 mb-1 tracking-tight">
            Interview Schedule
          </h2>
          <p className="text-[13px] text-slate-500 m-0">
            Manage all upcoming and past interview appointments
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <Input
            placeholder="Search by student or job"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-60"
            allowClear
          />
          <Select
            value={filter}
            onChange={(v: StatusFilter) => setFilter(v)}
            className="w-36"
            options={[
              { value: "ALL", label: "All" },
              { value: "UPCOMING", label: "Upcoming" },
              { value: "COMPLETED", label: "Completed" },
              { value: "CANCELED", label: "Canceled" },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchInterviews}>
            Refresh
          </Button>
          {DEMO_MODE && isAdmin && (
            <Button
              icon={<HistoryOutlined />}
              onClick={() => {
                backdateForm.resetFields();
                setBackdateOpen(true);
              }}
              className="border-amber-500 text-amber-600 hover:bg-amber-50"
            >
              Demo: Backdate
            </Button>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setProposedSlots([]);
              setScheduleOpen(true);
            }}
            className="bg-[#E67E22] border-[#E67E22] hover:bg-[#D35400] hover:border-[#D35400]"
          >
            Schedule Interview
          </Button>
        </div>
      </div>

      {error && interviews.length === 0 ? (
        <div className="p-[60px] text-center text-red-500 bg-white rounded-2xl border border-slate-200 mx-6">
          <CalendarOutlined className="text-[48px] mb-3 block" />
          <div className="text-[15px] font-semibold text-slate-900 mb-1">
            Unable to sync calendar schedules
          </div>
          <div className="text-[13px] text-slate-500 mb-3">{error}</div>
          <Button
            type="primary"
            onClick={fetchInterviews}
            className="bg-[#E67E22] border-[#E67E22]"
          >
            Try Again
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-[60px] text-center text-slate-500 bg-white rounded-2xl border border-slate-200 mx-6">
          <CalendarOutlined className="text-[48px] mb-3 block" />
          <div className="text-[15px] font-semibold text-slate-900 mb-1">
            No interviews match your filter
          </div>
          <div className="text-[13px] text-slate-500">
            Try changing the filter or schedule a new interview above.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-6">
          {filtered.map((i) => {
            const meta = STATUS_META[statusOf(i)] ?? STATUS_META.SCHEDULED;
            return (
              <div
                key={i.interviewId}
                onClick={() => setSelected(i)}
                className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all
                  ${selected?.interviewId === i.interviewId ? "border-slate-300 shadow-md" : "border-slate-200 shadow-sm hover:shadow-md"}
                `}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-[14px] font-bold text-slate-900">
                      {i.studentName ?? "Student"}
                    </div>
                    <div className="text-[12px] text-slate-500">
                      {i.jobTitle ?? "—"}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${meta.bg} ${meta.color}`}
                  >
                    {meta.label}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 text-[12px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <CalendarOutlined className="text-slate-400" />
                    {i.scheduledTime
                      ? dayjs(i.scheduledTime).format("ddd, MMM D YYYY · HH:mm")
                      : "—"}
                  </div>
                  {i.location && (
                    <div className="flex items-center gap-1.5">
                      <EnvironmentOutlined className="text-slate-400" />{" "}
                      {i.location}
                    </div>
                  )}
                  {i.meetingLink && (
                    <div className="flex items-center gap-1.5">
                      <LinkOutlined className="text-slate-400" />{" "}
                      <a
                        href={i.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Open meeting
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="fixed right-0 top-16 bottom-0 w-[360px] bg-white border-l border-slate-200 p-5 overflow-y-auto shadow-[-8px_0_24px_rgba(15,23,42,0.08)] z-50">
          <div className="flex justify-between items-center mb-4">
            <div className="text-[16px] font-extrabold text-slate-900">
              Interview Details
            </div>
            <Button size="small" onClick={() => setSelected(null)}>
              Close
            </Button>
          </div>
          <div className="flex flex-col gap-2.5 text-[13px]">
            <Row label="Student" value={selected.studentName ?? "—"} />
            <Row label="Job post" value={selected.jobTitle ?? "—"} />
            <Row label="Enterprise" value={selected.enterpriseName ?? "—"} />
            <Row
              label="Time"
              value={
                selected.scheduledTime
                  ? dayjs(selected.scheduledTime).format(
                      "ddd, MMM D YYYY · HH:mm",
                    )
                  : "—"
              }
            />
            <Row
              label="Duration"
              value={
                selected.durationMinutes
                  ? `${selected.durationMinutes} min`
                  : "—"
              }
            />
            <Row label="Location" value={selected.location ?? "—"} />
            <Row label="Meeting link" value={selected.meetingLink ?? "—"} />
            <Row
              label="Status"
              value={
                STATUS_META[statusOf(selected)]?.label ?? statusOf(selected)
              }
            />
            {selected.result && <Row label="Result" value={selected.result} />}
          </div>
          {(() => {
            const s = statusOf(selected);
            if (
              s === "CANCELED" ||
              s === "CANCELLED" ||
              s === "COMPLETED" ||
              s === "RESULT_RECORDED"
            )
              return null;
            return (
              <div className="flex flex-col gap-2 mt-5">
                <Button
                  block
                  icon={<EditOutlined />}
                  onClick={() => {
                    rescheduleForm.resetFields();
                    if (selected) {
                      rescheduleForm.setFieldsValue({
                        newTime: selected.scheduledTime
                          ? dayjs(selected.scheduledTime)
                          : undefined,
                        location: selected.location,
                        meetingLink: selected.meetingLink,
                      });
                    }
                    setRescheduleOpen(true);
                  }}
                >
                  Edit / Reschedule
                </Button>
                <Button
                  block
                  danger
                  icon={<StopOutlined />}
                  onClick={() => {
                    setCancelReason("");
                    setCancelOpen(true);
                  }}
                >
                  Cancel Interview
                </Button>
              </div>
            );
          })()}
        </div>
      )}

      {/* Schedule new modal */}
      <Modal
        title={
          <div className="font-extrabold text-slate-900">
            Schedule Interview
          </div>
        }
        open={scheduleOpen}
        onCancel={() => {
          if (!submitting) {
            setScheduleOpen(false);
            setProposedSlots([]);
          }
        }}
        footer={null}
        width={520}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            label="Candidate / Application"
            name="applicationId"
            rules={[{ required: true, message: "Please pick an application" }]}
          >
            <Select
              placeholder="Select a screened candidate"
              showSearch
              filterOption={false}
              loading={fetchingOptions}
              onSearch={(value) => {
                if (searchTimeoutRef.current) {
                  clearTimeout(searchTimeoutRef.current);
                }
                searchTimeoutRef.current = setTimeout(() => {
                  fetchApplications(value);
                }, 500);
              }}
              options={applications.map((a) => ({
                value: a.applicationId ?? a.id,
                label: `${a.studentName ?? "Student"} — ${a.jobPostTitle ?? a.jobTitle ?? "Post"}`,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Date & time"
            name="scheduledTime"
            rules={[{ required: true, message: "Required" }]}
          >
            <DatePicker
              showTime={{ format: "HH:mm", minuteStep: 1 }}
              format="YYYY-MM-DD HH:mm"
              className="w-full"
              disabledDate={(d) => d && d.isBefore(dayjs().startOf("day"))}
            />
          </Form.Item>
          <Form.Item
            label="Duration (minutes)"
            name="durationMinutes"
            initialValue={60}
          >
            <InputNumber min={15} max={240} step={15} className="w-full" />
          </Form.Item>
          <Form.Item label="Location" name="location">
            <Input placeholder="Office address (optional if online)" />
          </Form.Item>
          <Form.Item
            label="Online meeting link"
            name="meetingLink"
            rules={[
              {
                type: "url",
                message: "Must be a valid URL",
                warningOnly: true,
              },
            ]}
          >
            <Input placeholder="https://meet..." />
          </Form.Item>
          <div className="mb-3">
            <Button
              size="small"
              loading={proposing}
              onClick={async () => {
                const appId = form.getFieldValue("applicationId");
                if (!appId) {
                  message.warning("Pick an application first.");
                  return;
                }
                await handlePropose(appId);
              }}
            >
              Propose open slots
            </Button>
            {proposedSlots.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {proposedSlots.map((s) => (
                  <Button
                    key={s}
                    size="small"
                    onClick={() =>
                      form.setFieldsValue({ scheduledTime: dayjs(s) })
                    }
                    className="border-[#E67E22] text-[#E67E22] hover:bg-[#E67E22]/10"
                  >
                    {dayjs(s).format("MMM D · HH:mm")}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => setScheduleOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              loading={submitting}
              onClick={handleSubmitSchedule}
              className="bg-[#E67E22] border-[#E67E22]"
            >
              Save Schedule
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Reschedule modal */}
      <Modal
        title={
          <div className="font-extrabold text-slate-900">
            Edit / Reschedule Interview
          </div>
        }
        open={rescheduleOpen}
        onCancel={() => {
          if (!submitting) setRescheduleOpen(false);
        }}
        footer={null}
        width={460}
        destroyOnHidden
      >
        <Form form={rescheduleForm} layout="vertical" preserve={false}>
          <Form.Item
            label="Scheduled date & time"
            name="newTime"
            rules={[{ required: true }]}
          >
            <DatePicker
              showTime={{ format: "HH:mm", minuteStep: 1 }}
              format="YYYY-MM-DD HH:mm"
              className="w-full"
              disabledDate={(d) => d && d.isBefore(dayjs().startOf("day"))}
            />
          </Form.Item>
          <Form.Item label="Location" name="location">
            <Input placeholder="Office address (optional if online)" />
          </Form.Item>
          <Form.Item
            label="Online meeting link"
            name="meetingLink"
            rules={[
              {
                type: "url",
                message: "Must be a valid URL",
                warningOnly: true,
              },
            ]}
          >
            <Input placeholder="https://meet..." />
          </Form.Item>
          <Form.Item
            label="Reason (optional)"
            name="reason"
            tooltip="Required only if changing the date/time."
          >
            <TextArea
              rows={2}
              maxLength={300}
              placeholder="Why are you rescheduling?"
            />
          </Form.Item>
          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => setRescheduleOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              loading={submitting}
              onClick={handleReschedule}
              className="bg-[#E67E22] border-[#E67E22]"
            >
              Update
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Cancel modal */}
      <Modal
        title={
          <div className="font-extrabold text-slate-900">Cancel Interview</div>
        }
        open={cancelOpen}
        onCancel={() => {
          if (!submitting) setCancelOpen(false);
        }}
        footer={null}
        width={460}
        destroyOnHidden
      >
        <p className="text-[13px] text-slate-600 mb-2">
          Please provide a reason. The student will be notified via email.
        </p>
        <TextArea
          rows={3}
          maxLength={500}
          showCount
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Reason for cancellation"
        />
        <div className="flex gap-2 justify-end mt-3">
          <Button onClick={() => setCancelOpen(false)} disabled={submitting}>
            Back
          </Button>
          <Button danger loading={submitting} onClick={handleCancel}>
            Confirm cancellation
          </Button>
        </div>
      </Modal>

      {/* Demo-mode modal: backdate an interview's scheduled_datetime into the past */}
      <Modal
        title={
          <div className="font-extrabold text-amber-600 flex items-center gap-2">
            <HistoryOutlined /> Demo: Backdate Interview
          </div>
        }
        open={backdateOpen}
        onCancel={() => {
          if (!submitting) setBackdateOpen(false);
        }}
        footer={null}
        width={520}
        destroyOnHidden
      >
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-[12px] text-amber-800">
          Demo-only flow. Use to test "Record result" without waiting for real
          time. The backend stamps a full audit trail (who, when, why) and
          refuses the UPDATE if any audit field is missing.
        </div>
        <Form form={backdateForm} layout="vertical">
          <Form.Item
            name="interviewId"
            label="Interview"
            rules={[{ required: true, message: "Pick an interview" }]}
          >
            <Select
              showSearch
              placeholder="Pick an interview to backdate"
              optionFilterProp="label"
              options={interviews
                .filter(
                  (i) =>
                    statusOf(i) === "SCHEDULED" ||
                    statusOf(i) === "CONFIRMED" ||
                    statusOf(i) === "RESCHEDULED",
                )
                .map((i) => ({
                  value: i.interviewId,
                  label: `${i.studentName ?? "Unknown"} — ${i.jobTitle ?? "N/A"} (currently ${dayjs(i.scheduledTime).format("YYYY-MM-DD HH:mm")})`,
                }))}
            />
          </Form.Item>
          <Form.Item
            name="newTime"
            label="New scheduled time (must be in the past)"
            rules={[{ required: true, message: "Pick a past date/time" }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              className="w-full"
              disabledDate={(d) => d && d.isAfter(dayjs())}
            />
          </Form.Item>
          <Form.Item
            name="reason"
            label="Reason (audit trail, ≥ 10 chars)"
            rules={[
              { required: true, message: "Required for audit" },
              { min: 10, message: "At least 10 characters" },
            ]}
          >
            <TextArea
              rows={3}
              maxLength={500}
              showCount
              placeholder="e.g. Demo recording for thesis defense — Spring 2026"
            />
          </Form.Item>
          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => setBackdateOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              loading={submitting}
              onClick={handleBackdate}
              className="bg-amber-500 border-amber-500 hover:bg-amber-600 hover:border-amber-600"
            >
              Backdate & Record Audit
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col gap-0.5 p-2 px-3 bg-slate-50 rounded-lg">
    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
      {label}
    </div>
    <div className="text-[13px] text-slate-900 break-words">{value}</div>
  </div>
);
