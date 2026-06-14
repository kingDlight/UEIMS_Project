import React, { useEffect, useState } from 'react';
import { Spin, message, Modal, Form, Input, InputNumber, DatePicker, Button, Select, Empty } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  PoweroffOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  DeleteOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { JobPostService } from '@/services/JobPostService';
import { api } from '@/services/api';
import { c } from '../constants';

// ============================================================
// TYPES
// ============================================================
interface Semester {
  semesterId: string;
  semesterCode?: string;
  name?: string;
  status?: string;
}

interface JobPost {
  jobPostId: string;
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  requiredSkills?: string;
  positionsCount: number;
  applicationDeadline: string;
  status: string;
  semester?: Semester;
  createdAt?: string;
}

// ============================================================
// HELPERS
// ============================================================
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = Number.parseInt(h.substring(0, 2), 16);
  const g = Number.parseInt(h.substring(2, 4), 16);
  const b = Number.parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const STATUS_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  OPEN: { color: c.success, bg: hexToRgba(c.success, 0.1), label: 'Open' },
  CLOSED: { color: c.error, bg: hexToRgba(c.error, 0.1), label: 'Closed' },
  PENDING: { color: c.warning, bg: hexToRgba(c.warning, 0.1), label: 'Pending' },
  DRAFT: { color: c.textMuted, bg: hexToRgba(c.textMuted, 0.1), label: 'Draft' },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_COLORS[status] || STATUS_COLORS.DRAFT;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: c.radiusFull,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.05em',
      border: `1px solid ${hexToRgba(cfg.color, 0.25)}`,
    }}>{cfg.label}</span>
  );
};

// ============================================================
// FORM VALUES TYPE
// ============================================================
interface FormValues {
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  requiredSkills?: string;
  positionsCount: number;
  applicationDeadline: Dayjs;
  semesterId: string;
}

// ============================================================
// MAIN COMPONENT (UC-37 + UC-38)
// ============================================================
export const JobPostManagementTab: React.FC = () => {
  const [posts, setPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<JobPost | null>(null);
  const [viewingPost, setViewingPost] = useState<JobPost | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<{ open: boolean; post: JobPost | null; nextStatus: string }>({
    open: false, post: null, nextStatus: 'OPEN',
  });
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  // ========== FETCH LIST (UC-37.0 Step 2) ==========
  const fetchPosts = async () => {
    try {
      setLoading(true);
      // The /active endpoint only returns OPEN ones, we want all (BR-29: own posts).
      // Backend doesn't have a "by enterprise" filter endpoint, so we filter client-side
      // and rely on the @PreAuthorize ENTERPRISE for create/edit/delete.
      const res = await api.get('/job-posts');
      const data: any[] = res.data?.result ?? res.data ?? [];
      setPosts(data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to load recruitment data. Please refresh the page or try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesters = async () => {
    try {
      const res = await api.get('/semesters');
      const data: any[] = res.data?.data ?? res.data ?? res.data?.result ?? [];
      // Filter only OPEN/ACTIVE semesters (BR-30: cannot post in CLOSED/LOCKED)
      const eligible = (data || []).filter((s: Semester) => s.status !== 'CLOSED' && s.status !== 'LOCKED');
      setSemesters(eligible);
    } catch {
      // Silent: don't block list view if semesters fail
      setSemesters([]);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchSemesters();
  }, []);

  // ========== CREATE / EDIT (UC-37.1, UC-37.2) ==========
  const openCreate = () => {
    setEditingPost(null);
    form.resetFields();
    form.setFieldsValue({ positionsCount: 1 });
    setFormOpen(true);
  };

  const openEdit = (post: JobPost) => {
    setEditingPost(post);
    form.setFieldsValue({
      title: post.title,
      description: post.description,
      requirements: post.requirements,
      benefits: post.benefits,
      requiredSkills: post.requiredSkills,
      positionsCount: post.positionsCount,
      applicationDeadline: dayjs(post.applicationDeadline),
      semesterId: post.semester?.semesterId,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = {
        title: values.title,
        description: values.description,
        requirements: values.requirements,
        benefits: values.benefits,
        requiredSkills: values.requiredSkills,
        positionsCount: values.positionsCount,
        applicationDeadline: values.applicationDeadline.format('YYYY-MM-DD'),
        semester: { semesterId: values.semesterId },
        status: editingPost?.status ?? 'OPEN',
      };
      if (editingPost) {
        await JobPostService.update(editingPost.jobPostId, payload);
        message.success('Job post updated successfully.');
      } else {
        await JobPostService.create(payload);
        message.success('Job post created successfully.');
      }
      setFormOpen(false);
      await fetchPosts();
    } catch (err: any) {
      if (err.errorFields) {
        message.error('Please complete all required fields.');
      } else {
        message.error(err.response?.data?.message || 'Failed to save job post.');
      }
    } finally {
      setSaving(false);
    }
  };

  // ========== TOGGLE STATUS (UC-38) ==========
  const requestToggle = (post: JobPost) => {
    const next = post.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    setConfirmToggle({ open: true, post, nextStatus: next });
  };

  const confirmToggleAction = async () => {
    if (!confirmToggle.post) return;
    try {
      setToggling(true);
      await api.patch(`/job-posts/${confirmToggle.post.jobPostId}/status`, null, {
        params: { status: confirmToggle.nextStatus },
      });
      message.success('Post status updated successfully.');
      setConfirmToggle({ open: false, post: null, nextStatus: 'OPEN' });
      await fetchPosts();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to change post status. Please try again.');
    } finally {
      setToggling(false);
    }
  };

  const daysUntil = (deadline: string) => {
    const diff = dayjs(deadline).diff(dayjs(), 'day');
    if (diff < 0) return { text: 'Expired', color: c.error };
    if (diff === 0) return { text: 'Due today', color: c.warning };
    if (diff <= 3) return { text: `${diff}d left`, color: c.warning };
    return { text: `${diff}d left`, color: c.textMuted };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '0 0 40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}
        >
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: '0 0 4px' }}>Recruitment Posts</h2>
            <p style={{ fontSize: 13, color: c.textMuted, margin: 0 }}>Manage your job postings — create, edit, and toggle visibility</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button icon={<ReloadOutlined />} onClick={fetchPosts} style={{ borderRadius: c.radiusMd }}>Refresh</Button>
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCreate}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', borderRadius: c.radiusMd,
                background: c.brand, color: '#fff', fontWeight: 700, fontSize: 13,
                border: 'none', cursor: 'pointer', boxShadow: c.shadowBrand,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <PlusOutlined /> Create New Post
            </motion.button>
          </div>
        </motion.div>

        {/* LIST */}
        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ background: c.surface, borderRadius: c.radiusLg, border: `1px solid ${c.border}`, padding: 60 }}
          >
            <Empty
              image={<FileTextOutlined style={{ fontSize: 48, color: c.textMuted }} />}
              description={
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 4 }}>No job posts yet</div>
                  <div style={{ fontSize: 13, color: c.textMuted }}>Click "Create New Post" to publish your first recruitment</div>
                </div>
              }
            />
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
            <AnimatePresence>
              {posts.map((post, i) => {
                const deadline = daysUntil(post.applicationDeadline);
                return (
                  <motion.div
                    key={post.jobPostId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    style={{
                      background: c.surface, borderRadius: c.radiusLg,
                      border: `1px solid ${c.border}`, boxShadow: c.shadowSm,
                      overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    }}
                  >
                    {/* Card header */}
                    <div style={{ padding: '16px 18px', borderBottom: `1px solid ${c.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: 0, lineHeight: 1.3, flex: 1 }}>
                          {post.title}
                        </h3>
                        <StatusBadge status={post.status} />
                      </div>
                      <div style={{ fontSize: 12, color: c.textMuted, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.description}
                      </div>
                    </div>

                    {/* Card meta */}
                    <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: c.textSecondary }}>
                        <TeamOutlined style={{ color: c.brand }} />
                        <span><strong>{post.positionsCount}</strong> position{post.positionsCount > 1 ? 's' : ''}</span>
                      </div>
                      {post.semester && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: c.textSecondary }}>
                          <EnvironmentOutlined style={{ color: c.brand }} />
                          <span>{post.semester.name || post.semester.semesterCode}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: c.textSecondary }}>
                        <CalendarOutlined style={{ color: c.brand }} />
                        <span>Deadline: {dayjs(post.applicationDeadline).format('MMM D, YYYY')}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: deadline.color, padding: '2px 8px', borderRadius: c.radiusFull, background: hexToRgba(deadline.color, 0.1) }}>
                          {deadline.text}
                        </span>
                      </div>
                      {post.requiredSkills && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                          {post.requiredSkills.split(',').slice(0, 4).map((s, idx) => (
                            <span key={idx} style={{ padding: '2px 8px', borderRadius: c.radiusFull, background: c.brandSubtle, color: c.brand, fontSize: 11, fontWeight: 600 }}>
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card actions */}
                    <div style={{ padding: '12px 18px', borderTop: `1px solid ${c.border}`, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Button size="small" icon={<EyeOutlined />} onClick={() => setViewingPost(post)} style={{ borderRadius: c.radiusMd, flex: 1 }}>
                        View
                      </Button>
                      <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(post)} style={{ borderRadius: c.radiusMd, flex: 1 }}>
                        Edit
                      </Button>
                      <Button
                        size="small"
                        icon={post.status === 'OPEN' ? <PoweroffOutlined /> : <ReloadOutlined />}
                        onClick={() => requestToggle(post)}
                        style={{
                          borderRadius: c.radiusMd, flex: 1,
                          color: post.status === 'OPEN' ? c.error : c.success,
                          borderColor: post.status === 'OPEN' ? hexToRgba(c.error, 0.3) : hexToRgba(c.success, 0.3),
                          background: post.status === 'OPEN' ? c.errorMuted : c.successMuted,
                          fontWeight: 700,
                        }}
                      >
                        {post.status === 'OPEN' ? 'Close' : 'Reopen'}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        title={
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: c.text, fontSize: 16 }}>
            {editingPost ? <><EditOutlined style={{ marginRight: 8, color: c.brand }} />Edit Job Post</> : <><PlusOutlined style={{ marginRight: 8, color: c.brand }} />Create New Job Post</>}
          </div>
        }
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        width={720}
        footer={null}
        styles={{ content: { borderRadius: c.radiusLg, padding: '24px 28px' }, header: { borderBottom: 'none', marginBottom: 16, padding: 0 }, body: { padding: 0 } }}
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item name="title" label="Job Title" rules={[{ required: true, message: 'Job title is required' }]}>
            <Input placeholder="Frontend Developer Intern" maxLength={255} />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="semesterId" label="Semester" rules={[{ required: true, message: 'Semester is required' }]}>
              <Select placeholder="Select a semester" disabled={!!editingPost}>
                {semesters.map(s => (
                  <Select.Option key={s.semesterId} value={s.semesterId}>
                    {s.name || s.semesterCode} {s.status ? `(${s.status})` : ''}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="positionsCount" label="Positions" rules={[{ required: true, message: 'Number of positions is required' }]}>
              <InputNumber min={1} max={100} style={{ width: '100%' }} />
            </Form.Item>
            <div style={{ gridColumn: '1 / -1' }}>
              <Form.Item name="applicationDeadline" label="Application Deadline" rules={[{ required: true, message: 'Deadline is required' }]}>
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </div>
          </div>

          <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Description is required' }]}>
            <Input.TextArea rows={4} placeholder="What will the intern do? What will they learn?" />
          </Form.Item>

          <Form.Item name="requirements" label="Requirements">
            <Input.TextArea rows={3} placeholder="Required skills, experience, year of study..." />
          </Form.Item>

          <Form.Item name="requiredSkills" label="Required Skills (comma-separated)">
            <Input placeholder="React, TypeScript, Git, English" />
          </Form.Item>

          <Form.Item name="benefits" label="Benefits">
            <Input.TextArea rows={2} placeholder="Stipend, mentorship, certificates..." />
          </Form.Item>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8, paddingTop: 16, borderTop: `1px solid ${c.border}` }}>
            <Button onClick={() => setFormOpen(false)} style={{ borderRadius: c.radiusMd }}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleSave}
              loading={saving}
              style={{ background: c.brand, borderColor: c.brand, borderRadius: c.radiusMd, fontWeight: 700 }}
            >
              {editingPost ? 'Save Changes' : 'Submit'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* VIEW DETAIL MODAL */}
      <Modal
        title={<div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: c.text, fontSize: 16 }}>Job Post Details</div>}
        open={!!viewingPost}
        onCancel={() => setViewingPost(null)}
        footer={null}
        width={680}
        styles={{ content: { borderRadius: c.radiusLg, padding: '24px 28px' }, header: { borderBottom: 'none', marginBottom: 16, padding: 0 }, body: { padding: 0 } }}
      >
        {viewingPost && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: 0, flex: 1 }}>{viewingPost.title}</h2>
              <StatusBadge status={viewingPost.status} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ padding: '10px 12px', borderRadius: c.radiusMd, background: c.bgLight, border: `1px solid ${c.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase' }}>Positions</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>{viewingPost.positionsCount}</div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: c.radiusMd, background: c.bgLight, border: `1px solid ${c.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase' }}>Deadline</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>{dayjs(viewingPost.applicationDeadline).format('MMM D, YYYY')}</div>
              </div>
            </div>
            {[
              { label: 'Description', value: viewingPost.description },
              { label: 'Requirements', value: viewingPost.requirements },
              { label: 'Benefits', value: viewingPost.benefits },
              { label: 'Required Skills', value: viewingPost.requiredSkills },
            ].map(s => s.value && (
              <div key={s.label}>
                <div style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
                <div style={{ padding: '12px 14px', borderRadius: c.radiusMd, background: c.bgLight, border: `1px solid ${c.border}`, fontSize: 13, color: c.text, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* TOGGLE CONFIRMATION MODAL (UC-38 Step 2) */}
      <Modal
        open={confirmToggle.open}
        onCancel={() => setConfirmToggle({ open: false, post: null, nextStatus: 'OPEN' })}
        footer={null}
        width={420}
        centered
        styles={{ content: { borderRadius: c.radiusLg, padding: '24px 28px' }, header: { display: 'none' }, body: { padding: 0 } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: confirmToggle.nextStatus === 'CLOSED' ? c.errorMuted : c.successMuted,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: confirmToggle.nextStatus === 'CLOSED' ? c.error : c.success,
          }}>
            <WarningOutlined style={{ fontSize: 28 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: c.text, margin: '0 0 6px' }}>
              {confirmToggle.nextStatus === 'CLOSED' ? 'Close this job posting?' : 'Reopen this job posting?'}
            </h3>
            <p style={{ fontSize: 13, color: c.textMuted, margin: 0, lineHeight: 1.5 }}>
              {confirmToggle.nextStatus === 'CLOSED'
                ? 'Once closed, students will no longer see this post and cannot submit new applications.'
                : 'Reopening will make this post visible to students again and allow new applications.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <Button block onClick={() => setConfirmToggle({ open: false, post: null, nextStatus: 'OPEN' })} style={{ borderRadius: c.radiusMd }}>
              Cancel
            </Button>
            <Button
              block
              type="primary"
              danger={confirmToggle.nextStatus === 'CLOSED'}
              loading={toggling}
              onClick={confirmToggleAction}
              style={{
                borderRadius: c.radiusMd, fontWeight: 700,
                background: confirmToggle.nextStatus === 'CLOSED' ? c.error : c.success,
                borderColor: confirmToggle.nextStatus === 'CLOSED' ? c.error : c.success,
              }}
            >
              Yes, {confirmToggle.nextStatus === 'CLOSED' ? 'Close' : 'Reopen'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
