import React, { useEffect, useMemo, useState } from 'react';
import { Spin, App, Modal, Form, Input, InputNumber, DatePicker, Button, Select, Empty, Pagination } from 'antd';
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
  currentApplicationCount?: number;
  full?: boolean;
  applicationDeadline: string;
  status: string;
  semester?: Semester;
  createdAt?: string;
}

// ============================================================
// HELPERS
// ============================================================
const STATUS_COLORS: Record<string, { color: string; bg: string; borderColor: string; label: string }> = {
  OPEN: { color: 'text-emerald-600', bg: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', label: 'Open' },
  CLOSED: { color: 'text-red-500', bg: 'bg-red-500/10', borderColor: 'border-red-500/30', label: 'Closed' },
  PENDING: { color: 'text-amber-500', bg: 'bg-amber-500/10', borderColor: 'border-amber-500/30', label: 'Pending' },
  DRAFT: { color: 'text-slate-500', bg: 'bg-slate-500/10', borderColor: 'border-slate-500/30', label: 'Draft' },
  EXPIRED: { color: 'text-red-700', bg: 'bg-red-500/15', borderColor: 'border-red-500/40', label: 'Expired' },
  FULL: { color: 'text-orange-700', bg: 'bg-orange-500/10', borderColor: 'border-orange-500/40', label: 'Full' },
};

// BR-49: a post is "Full" the moment its runtime open count reaches 0.
// FIX 049: `positionsCount` is the runtime open-positions count, so the
// authoritative check is simply `positionsCount <= 0`. We also keep the
// `full` flag the backend populates as a fast-path so enterprise views
// don't need to round-trip a separate count.
const isFullPost = (post: JobPost): boolean => {
  if (post.status !== 'OPEN') return false;
  if (post.full === true) return true;
  return (post.positionsCount ?? 0) <= 0;
};

// Derived status: deadline-aware. Stored status OPEN + past deadline => EXPIRED.
// FULL takes priority over EXPIRED for visual clarity — if a post is both full
// and past-deadline, "Full" is what an enterprise should act on first.
const isExpiredPost = (post: JobPost): boolean => {
  if (post.status !== 'OPEN' || !post.applicationDeadline) return false;
  return new Date(post.applicationDeadline) < new Date();
};

const effectiveStatus = (post: JobPost): string => {
  if (isFullPost(post)) return 'FULL';
  return isExpiredPost(post) ? 'EXPIRED' : post.status;
};

const StatusBadge: React.FC<{ post: JobPost }> = ({ post }) => {
  const status = effectiveStatus(post);
  const cfg = STATUS_COLORS[status] || STATUS_COLORS.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${cfg.bg} ${cfg.color} ${cfg.borderColor}`}>
      {cfg.label}
    </span>
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
  const { message } = App.useApp();
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

  // Pagination + filter (mirrors JobBoardTab pattern)
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  // ========== FETCH LIST (UC-37.0 Step 2) ==========
  const fetchPosts = async () => {
    try {
      setLoading(true);
      // The /active endpoint only returns OPEN ones, we want all (BR-29: own posts).
      // Backend doesn't have a "by enterprise" filter endpoint, so we filter client-side
      // and rely on the @PreAuthorize ENTERPRISE for create/edit/delete.
      const res = await api.get('/job-posts/my-posts');
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
    // `positionsCount` IS the current number of open positions — the same value
    // the enterprise originally posted. It is not a "historical quota" we must
    // add onto; the enterprise can edit it freely to whatever they want open
    // right now (BR-49). The only floor is the number of students who already
    // hold a slot — we cannot reopen fewer than we have committed.
    const taken = post.currentApplicationCount ?? 0;
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
    if (diff < 0) return { text: 'Expired', color: 'text-red-500', bg: 'bg-red-50' };
    if (diff === 0) return { text: 'Due today', color: 'text-amber-500', bg: 'bg-amber-50' };
    if (diff <= 3) return { text: `${diff}d left`, color: 'text-amber-500', bg: 'bg-amber-50' };
    return { text: `${diff}d left`, color: 'text-slate-500', bg: 'bg-slate-50' };
  };

  // ========== FILTER + PAGINATE (client-side, mirrors JobBoardTab) ==========
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = !searchTerm ||
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || effectiveStatus(post) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [posts, searchTerm, statusFilter]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPosts.slice(start, start + pageSize);
  }, [filteredPosts, currentPage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="pb-10 font-sans">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-5"
        >
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 m-0 mb-1">Recruitment Posts</h2>
            <p className="text-[13px] text-slate-500 m-0">Manage your job postings — create, edit, and toggle visibility</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button icon={<ReloadOutlined />} onClick={fetchPosts} className="rounded-xl flex-1 sm:flex-none">Refresh</Button>
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E67E22] text-white font-bold text-[13px] border-none cursor-pointer shadow-[0_8px_22px_rgba(230,126,34,0.22)] font-sans flex-1 sm:flex-none"
            >
              <PlusOutlined /> Create New Post
            </motion.button>
          </div>
        </motion.div>

        {/* SEARCH + STATUS FILTER */}
        {posts.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-5 items-stretch sm:items-center bg-white p-3 rounded-xl border border-slate-200">
            <Input
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              className="flex-1 rounded-xl"
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-40"
              options={[
                { value: 'ALL', label: 'All statuses' },
                { value: 'OPEN', label: 'Open' },
                { value: 'CLOSED', label: 'Closed' },
                { value: 'EXPIRED', label: 'Expired' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'DRAFT', label: 'Draft' },
              ]}
            />
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {filteredPosts.length} of {posts.length}
            </span>
          </div>
        )}

        {/* LIST */}
        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-slate-200 p-16 text-center"
          >
            <Empty
              image={<FileTextOutlined className="text-[48px] text-slate-400" />}
              description={
                <div>
                  <div className="text-[15px] font-semibold text-slate-900 mb-1">No job posts yet</div>
                  <div className="text-[13px] text-slate-500">Click "Create New Post" to publish your first recruitment</div>
                </div>
              }
            />
          </motion.div>
        ) : filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-slate-200 p-16 text-center"
          >
            <Empty
              image={<FileTextOutlined className="text-[48px] text-slate-400" />}
              description={
                <div>
                  <div className="text-[15px] font-semibold text-slate-900 mb-1">No matching posts</div>
                  <div className="text-[13px] text-slate-500">Try changing your search or status filter</div>
                </div>
              }
            />
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-4">
              <AnimatePresence>
                {paginatedPosts.map((post, i) => {
                const deadline = daysUntil(post.applicationDeadline);
                return (
                  <motion.div
                    key={post.jobPostId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
                  >
                    {/* Card header */}
                    <div className="p-4 px-4.5 border-b border-slate-200">
                      <div className="flex items-start justify-between gap-2.5 mb-2.5">
                        <h3 className="text-[15px] font-bold text-slate-900 m-0 leading-tight flex-1">
                          {post.title}
                        </h3>
                        <StatusBadge post={post} />
                      </div>
                      <div className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {post.description}
                      </div>
                    </div>

                    {/* Card meta */}
                    <div className="p-3 px-4.5 flex flex-col gap-2 flex-1">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <TeamOutlined className="text-[#E67E22]" />
                        <span>
                          {/* FIX 049: `positionsCount` IS the runtime open
                              count (auto-maintained by triggers), so we render
                              it directly. Subtracting currentApplicationCount
                              again would double-count. */}
                          <strong>{Math.max(0, post.positionsCount ?? 0)}</strong>{' '}
                          position{Math.max(0, post.positionsCount ?? 0) !== 1 ? 's' : ''} open
                          <span className="text-slate-400 ml-1">
                            ({post.currentApplicationCount ?? 0} applied)
                          </span>
                        </span>
                      </div>
                      {post.semester && (
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <EnvironmentOutlined className="text-[#E67E22]" />
                          <span>{post.semester.name || post.semester.semesterCode}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <CalendarOutlined className="text-[#E67E22]" />
                        <span>Deadline: {dayjs(post.applicationDeadline).format('MMM D, YYYY')}</span>
                        <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full ${deadline.color} ${deadline.bg}`}>
                          {deadline.text}
                        </span>
                      </div>
                      {post.requiredSkills && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {post.requiredSkills.split(',').slice(0, 4).map((s, idx) => (
                            <span key={s.trim()} className="px-2 py-0.5 rounded-full bg-[#E67E22]/5 text-[#E67E22] text-[11px] font-semibold">
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card actions */}
                    <div className="p-3 px-4.5 border-t border-slate-200 flex gap-2 flex-wrap">
                      <Button size="small" icon={<EyeOutlined />} onClick={() => setViewingPost(post)} className="rounded-xl flex-1">
                        View
                      </Button>
                      <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(post)} className="rounded-xl flex-1">
                        Edit
                      </Button>
                      <Button
                        size="small"
                        icon={post.status === 'OPEN' ? <PoweroffOutlined /> : <ReloadOutlined />}
                        onClick={() => requestToggle(post)}
                        disabled={isExpiredPost(post) || isFullPost(post)}
                        title={
                          isExpiredPost(post)
                            ? 'Cannot toggle — deadline has passed'
                            : isFullPost(post)
                            ? 'Full — edit to add more positions or close the post'
                            : undefined
                        }
                        className={`rounded-xl flex-1 font-bold ${
                          isExpiredPost(post) || isFullPost(post)
                            ? 'text-slate-400 border-slate-200 bg-slate-50'
                            : post.status === 'OPEN'
                            ? 'text-red-500 border-red-500/30 bg-red-50 hover:bg-red-100 hover:border-red-500/50'
                            : 'text-emerald-500 border-emerald-500/30 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-500/50'
                        }`}
                      >
                        {isExpiredPost(post) ? 'Expired' : isFullPost(post) ? 'Full' : post.status === 'OPEN' ? 'Close' : 'Reopen'}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
              </AnimatePresence>
            </div>
            <div className="flex justify-center mt-6">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredPosts.length}
                onChange={setCurrentPage}
                showSizeChanger={false}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} posts`}
              />
            </div>
          </>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        title={
          <div className="font-sans font-bold text-slate-900 text-base flex items-center">
            {editingPost ? <><EditOutlined className="mr-2 text-[#E67E22]" />Edit Job Post</> : <><PlusOutlined className="mr-2 text-[#E67E22]" />Create New Job Post</>}
          </div>
        }
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        width={720}
        footer={null}
        styles={{ content: { borderRadius: 16, padding: '24px 28px' }, header: { borderBottom: 'none', marginBottom: 16, padding: 0 }, body: { padding: 0 } }}
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item name="title" label="Job Title" rules={[{ required: true, message: 'Job title is required' }]}>
            <Input placeholder="Frontend Developer Intern" maxLength={255} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="semesterId" label="Semester" rules={[{ required: true, message: 'Semester is required' }]}>
              <Select placeholder="Select a semester" disabled={!!editingPost}>
                {semesters.map(s => (
                  <Select.Option key={s.semesterId} value={s.semesterId}>
                    {s.name || s.semesterCode} {s.status ? `(${s.status})` : ''}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="positionsCount"
              label="Open positions"
              rules={[{ required: true, message: 'Number of open positions is required' }]}
              extra={
                <span className="text-xs">
                  {(() => {
                    if (editingPost) {
                      const applied = editingPost.currentApplicationCount ?? 0;
                      const currentOpen = editingPost.positionsCount ?? 0;
                      const total = applied + currentOpen;
                      return (
                        <>
                          Currently <strong>{applied}</strong> student{applied !== 1 ? 's have' : ' has'} applied
                          out of <strong>{total}</strong> total quota ({currentOpen} open).{' '}
                          Type a number to set <strong>how many MORE students</strong> you want
                          to accept — <strong>0</strong> closes new applications but keeps existing ones.
                        </>
                      );
                    }
                    return 'How many students you want to accept in total. You can change this anytime — increase or decrease the cap as long as you don\'t go below existing applicants.';
                  })()}
                </span>
              }
            >
              <InputNumber
                min={0}
                max={1000}
                className="w-full"
                addonAfter={
                  <span className="text-slate-500 text-xs">slots open</span>
                }
              />
            </Form.Item>
            <div className="col-span-full">
              <Form.Item name="applicationDeadline" label="Application Deadline" rules={[{ required: true, message: 'Deadline is required' }]}>
                <DatePicker
                  className="w-full"
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

          <div className="flex gap-2.5 justify-end mt-2 pt-4 border-t border-slate-200">
            <Button onClick={() => setFormOpen(false)} className="rounded-xl">Cancel</Button>
            <Button
              type="primary"
              onClick={handleSave}
              loading={saving}
              className="bg-[#E67E22] border-[#E67E22] rounded-xl font-bold hover:bg-[#D35400] hover:border-[#D35400]"
            >
              {editingPost ? 'Save Changes' : 'Submit'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* VIEW DETAIL MODAL */}
      <Modal
        title={<div className="font-sans font-bold text-slate-900 text-base">Job Post Details</div>}
        open={!!viewingPost}
        onCancel={() => setViewingPost(null)}
        footer={null}
        width={680}
        styles={{ content: { borderRadius: 16, padding: '24px 28px' }, header: { borderBottom: 'none', marginBottom: 16, padding: 0 }, body: { padding: 0 } }}
      >
        {viewingPost && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-slate-900 m-0 flex-1">{viewingPost.title}</h2>
              <StatusBadge post={viewingPost} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Open positions</div>
                {/* FIX 049: positionsCount is the runtime open count; show
                    total quota too so enterprise can see "open / total". */}
                <div className="text-[14px] font-semibold text-slate-900">
                  {Math.max(0, viewingPost.positionsCount ?? 0)}
                  <span className="text-slate-400 font-normal text-xs ml-1">
                    / {(viewingPost.positionsCount ?? 0) + (viewingPost.currentApplicationCount ?? 0)} total
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Deadline</div>
                <div className="text-[14px] font-semibold text-slate-900">{dayjs(viewingPost.applicationDeadline).format('MMM D, YYYY')}</div>
              </div>
            </div>
            {[
              { label: 'Description', value: viewingPost.description },
              { label: 'Requirements', value: viewingPost.requirements },
              { label: 'Benefits', value: viewingPost.benefits },
              { label: 'Required Skills', value: viewingPost.requiredSkills },
            ].map(s => s.value && (
              <div key={s.label}>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{s.label}</div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[13px] text-slate-900 leading-relaxed whitespace-pre-wrap">{s.value}</div>
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
        styles={{ content: { borderRadius: 16, padding: '24px 28px' }, header: { display: 'none' }, body: { padding: 0 } }}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-[28px] ${confirmToggle.nextStatus === 'CLOSED' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
            <WarningOutlined />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-slate-900 m-0 mb-1.5">
              {confirmToggle.nextStatus === 'CLOSED' ? 'Close this job posting?' : 'Reopen this job posting?'}
            </h3>
            <p className="text-[13px] text-slate-500 m-0 leading-relaxed">
              {confirmToggle.nextStatus === 'CLOSED'
                ? 'Once closed, students will no longer see this post and cannot submit new applications.'
                : 'Reopening will make this post visible to students again and allow new applications.'}
            </p>
          </div>
          <div className="flex gap-2.5 w-full">
            <Button block onClick={() => setConfirmToggle({ open: false, post: null, nextStatus: 'OPEN' })} className="rounded-xl">
              Cancel
            </Button>
            <Button
              block
              type="primary"
              danger={confirmToggle.nextStatus === 'CLOSED'}
              loading={toggling}
              onClick={confirmToggleAction}
              className={`rounded-xl font-bold ${confirmToggle.nextStatus === 'CLOSED' ? 'bg-red-500 border-red-500 hover:bg-red-600' : 'bg-emerald-500 border-emerald-500 hover:bg-emerald-600'}`}
            >
              Yes, {confirmToggle.nextStatus === 'CLOSED' ? 'Close' : 'Reopen'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
