import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Spin,
  App,
  Modal,
  Form,
  Input,
  Select,
  Empty,
  Pagination,
  Button,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  PoweroffOutlined,
  ReloadOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  KeyOutlined,
  ClockCircleOutlined,
  LockOutlined,
  WarningOutlined,
  TeamOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { AdminService } from '@/services/AdminService';
import type { UserDetail, UserCreatePayload, UserUpdatePayload } from '@/services/AdminService';
import { c } from '../constants';

// ============================================================
// HELPERS
// ============================================================
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const ROLE_COLORS: Record<string, { color: string; bg: string }> = {
  ADMIN: { color: c.brand, bg: hexToRgba(c.brand, 0.1) },
  TRAINING_MANAGER: { color: c.purple, bg: hexToRgba(c.purple, 0.1) },
  ENTERPRISE: { color: c.success, bg: hexToRgba(c.success, 0.1) },
  STUDENT: { color: c.info, bg: hexToRgba(c.info, 0.1) },
};

const ALL_ROLES = ['ADMIN', 'TRAINING_MANAGER', 'ENTERPRISE', 'STUDENT'];

const STATUS_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  ACTIVE: { color: c.success, bg: hexToRgba(c.success, 0.1), label: 'Active' },
  INACTIVE: { color: c.error, bg: hexToRgba(c.error, 0.1), label: 'Inactive' },
  LOCKED: { color: c.warning, bg: hexToRgba(c.warning, 0.1), label: 'Locked' },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_COLORS[status] || STATUS_COLORS.INACTIVE;
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
// TYPES
// ============================================================
interface CreateFormValues {
  fullName: string;
  email: string;
  phone?: string;
  role: string;
}

interface EditFormValues {
  fullName: string;
  phone?: string;
}

// ============================================================
// MAIN COMPONENT (UC-06 → UC-11)
// ============================================================
export const UsersTab: React.FC = () => {
  const { message } = App.useApp();
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Search + filter (mirrors JobPostManagementTab pattern)
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  // Modals
  const [viewing, setViewing] = useState<UserDetail | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm] = Form.useForm<CreateFormValues>();
  const [editing, setEditing] = useState<UserDetail | null>(null);
  const [editForm] = Form.useForm<EditFormValues>();
  const [savingEdit, setSavingEdit] = useState(false);

  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    user: UserDetail | null;
    nextStatus: string;
  }>({ open: false, user: null, nextStatus: 'ACTIVE' });
  const [savingStatus, setSavingStatus] = useState(false);

  const [assignModal, setAssignModal] = useState<{ open: boolean; user: UserDetail | null }>({
    open: false, user: null,
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [savingRoles, setSavingRoles] = useState(false);

  // ========== FETCH LIST (UC-06.0 Step 2) ==========
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Try to capture current user id for "cannot edit own status" guard
    try {
      const token = localStorage.getItem('token') || '';
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1] || ''));
        setCurrentUserId(payload?.userId || payload?.sub || null);
      }
    } catch {
      // ignore
    }
  }, []);

  // ========== VIEW DETAILS (UC-07) ==========
  const openView = async (user: UserDetail) => {
    setViewing(user);
    setViewLoading(true);
    try {
      const detail = await AdminService.getUserById(user.userId);
      setViewing(detail ?? user);
    } catch {
      // keep current snapshot
    } finally {
      setViewLoading(false);
    }
  };

  // ========== CREATE (UC-08) ==========
  const openCreate = () => {
    createForm.resetFields();
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      setCreating(true);
      const payload: UserCreatePayload = {
        email: values.email,
        fullName: values.fullName,
        phone: values.phone,
      };
      await AdminService.createUser(payload);
      // After account is created, assign the selected role so it's not orphan
      const created = await AdminService.getUsers();
      const found = (Array.isArray(created) ? created : []).find(
        (u: UserDetail) => u.email === values.email,
      );
      if (found && values.role) {
        try {
          await AdminService.assignRole(found.userId, values.role);
        } catch (err: any) {
          message.warning('User created but role assignment failed. Assign role manually.');
        }
      }
      message.success('User created successfully. Temporary password emailed.');
      setCreateOpen(false);
      createForm.resetFields();
      await fetchUsers();
    } catch (err: any) {
      if (err.errorFields) {
        message.error('Please complete all required fields.');
      } else {
        message.error(err.response?.data?.message || 'Failed to create user.');
      }
    } finally {
      setCreating(false);
    }
  };

  // ========== EDIT (UC-09) ==========
  const openEdit = (user: UserDetail) => {
    setEditing(user);
    editForm.setFieldsValue({
      fullName: user.fullName,
      phone: user.phone || '',
    });
  };

  const handleEdit = async () => {
    if (!editing) return;
    try {
      const values = await editForm.validateFields();
      setSavingEdit(true);
      const payload: UserUpdatePayload = {
        fullName: values.fullName,
        phone: values.phone,
      };
      await AdminService.updateUser(editing.userId, payload);
      message.success('User information updated.');
      setEditing(null);
      editForm.resetFields();
      await fetchUsers();
    } catch (err: any) {
      if (err.errorFields) {
        message.error('Please complete all required fields.');
      } else {
        message.error(err.response?.data?.message || 'Failed to update user.');
      }
    } finally {
      setSavingEdit(false);
    }
  };

  // ========== STATUS (UC-10) ==========
  const requestStatusChange = (user: UserDetail) => {
    const next = user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    setStatusModal({ open: true, user, nextStatus: next });
  };

  const confirmStatusChange = async () => {
    if (!statusModal.user) return;
    setSavingStatus(true);
    try {
      if (statusModal.nextStatus === 'LOCKED') {
        await AdminService.updateUserStatus(statusModal.user.userId, 'LOCKED');
        message.success('User account has been locked.');
      } else if (statusModal.nextStatus === 'ACTIVE') {
        await AdminService.updateUserStatus(statusModal.user.userId, 'ACTIVE');
        message.success('User account has been unlocked.');
      } else {
        await AdminService.updateUserStatus(statusModal.user.userId, statusModal.nextStatus);
        message.success('User status updated.');
      }
      setStatusModal({ open: false, user: null, nextStatus: 'ACTIVE' });
      await fetchUsers();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setSavingStatus(false);
    }
  };

  // ========== ASSIGN ROLES (UC-11) ==========
  const openAssign = (user: UserDetail) => {
    setSelectedRoles([...(user.roles || [])]);
    setAssignModal({ open: true, user });
  };

  const handleAssignRoles = async () => {
    if (!assignModal.user) return;
    setSavingRoles(true);
    try {
      const currentRoles = assignModal.user.roles || [];
      const toAdd = selectedRoles.filter(r => !currentRoles.includes(r));
      const toRemove = currentRoles.filter(r => !selectedRoles.includes(r));

      await Promise.all([
        ...toAdd.map(role => AdminService.assignRole(assignModal.user!.userId, role)),
        ...toRemove.map(role => AdminService.revokeRole(assignModal.user!.userId, role)),
      ]);

      message.success('Roles updated.');
      setAssignModal({ open: false, user: null });
      await fetchUsers();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to update roles.');
    } finally {
      setSavingRoles(false);
    }
  };

  // ========== FILTER + PAGINATE (mirrors JobPostManagementTab) ==========
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = !searchTerm ||
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || (u.roles || []).includes(roleFilter);
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, roleFilter, statusFilter]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

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
            <h2 style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: '0 0 4px' }}>User Management</h2>
            <p style={{ fontSize: 13, color: c.textMuted, margin: 0 }}>Manage user accounts, profile info, status and role assignments</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button icon={<ReloadOutlined />} onClick={fetchUsers} style={{ borderRadius: c.radiusMd }}>
              Refresh
            </Button>
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
              <PlusOutlined /> Add New User
            </motion.button>
          </div>
        </motion.div>

        {/* SEARCH + FILTERS */}
        {users.length > 0 && (
          <div style={{
            display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center',
            background: c.surface, padding: 12, borderRadius: c.radiusMd,
            border: `1px solid ${c.border}`,
          }}>
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              prefix={<UserOutlined style={{ color: c.textMuted }} />}
              style={{ flex: 1, borderRadius: c.radiusMd }}
            />
            <Select
              value={roleFilter}
              onChange={setRoleFilter}
              style={{ width: 170 }}
              options={[
                { value: 'ALL', label: 'All roles' },
                ...ALL_ROLES.map(r => ({ value: r, label: r.replace('_', ' ') })),
              ]}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
              options={[
                { value: 'ALL', label: 'All statuses' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
              ]}
            />
            <span style={{ fontSize: 12, color: c.textMuted, whiteSpace: 'nowrap' }}>
              {filteredUsers.length} of {users.length}
            </span>
          </div>
        )}

        {/* LIST */}
        {users.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ background: c.surface, borderRadius: c.radiusLg, border: `1px solid ${c.border}`, padding: 60 }}
          >
            <Empty
              image={<TeamOutlined style={{ fontSize: 48, color: c.textMuted }} />}
              description={
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 4 }}>No users yet</div>
                  <div style={{ fontSize: 13, color: c.textMuted }}>Click "Add New User" to provision the first account</div>
                </div>
              }
            />
          </motion.div>
        ) : filteredUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ background: c.surface, borderRadius: c.radiusLg, border: `1px solid ${c.border}`, padding: 60 }}
          >
            <Empty
              image={<UserOutlined style={{ fontSize: 48, color: c.textMuted }} />}
              description={
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 4 }}>No matching users</div>
                  <div style={{ fontSize: 13, color: c.textMuted }}>Try changing your search or filter</div>
                </div>
              }
            />
          </motion.div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
              <AnimatePresence>
                {paginatedUsers.map((user, i) => {
                  const isSelf = currentUserId === user.userId;
                  return (
                    <motion.div
                      key={user.userId}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      style={{
                        background: c.surface, borderRadius: c.radiusLg,
                        border: `1px solid ${c.border}`, boxShadow: c.shadowSm,
                        overflow: 'hidden', display: 'flex', flexDirection: 'column',
                      }}
                    >
                      {/* Card header */}
                      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${c.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: '50%',
                            background: hexToRgba(c.brand, 0.12),
                            color: c.brand, fontWeight: 800, fontSize: 16,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: 0, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {user.fullName}
                            </h3>
                            <div style={{ fontSize: 12, color: c.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {user.email}
                            </div>
                          </div>
                          <StatusBadge status={user.status} />
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {(user.roles || []).length === 0 ? (
                            <span style={{ fontSize: 11, color: c.textMuted, fontStyle: 'italic' }}>No roles assigned</span>
                          ) : (user.roles || []).map(role => {
                            const cfg = ROLE_COLORS[role] || { color: c.textMuted, bg: hexToRgba(c.textMuted, 0.1) };
                            return (
                              <span key={role} style={{ padding: '2px 8px', borderRadius: c.radiusFull, fontSize: 10, fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${hexToRgba(cfg.color, 0.3)}` }}>
                                {role.replace('_', ' ')}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Card meta */}
                      <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: c.textSecondary }}>
                          <PhoneOutlined style={{ color: c.brand }} />
                          <span>{user.phone || <em style={{ color: c.textMuted }}>No phone</em>}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: c.textSecondary }}>
                          <CalendarOutlined style={{ color: c.brand }} />
                          <span>Created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
                        </div>
                        {user.lastLogin && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: c.textSecondary }}>
                            <ClockCircleOutlined style={{ color: c.brand }} />
                            <span>Last login: {new Date(user.lastLogin).toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Card actions */}
                      <div style={{ padding: '12px 18px', borderTop: `1px solid ${c.border}`, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Button size="small" icon={<EyeOutlined />} onClick={() => openView(user)} style={{ borderRadius: c.radiusMd, flex: 1 }}>
                          View
                        </Button>
                        <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(user)} style={{ borderRadius: c.radiusMd, flex: 1 }}>
                          Edit
                        </Button>
                        <Tooltip title={isSelf ? 'You cannot change your own status' : 'Change status'}>
                          <Button
                            size="small"
                            icon={user.status === 'ACTIVE' ? <PoweroffOutlined /> : <CheckCircleOutlined />}
                            onClick={() => requestStatusChange(user)}
                            disabled={isSelf}
                            style={{
                              borderRadius: c.radiusMd, flex: 1,
                              color: user.status === 'ACTIVE' ? c.error : c.success,
                              borderColor: hexToRgba(user.status === 'ACTIVE' ? c.error : c.success, 0.3),
                              background: user.status === 'ACTIVE' ? c.errorMuted : c.successMuted,
                              fontWeight: 700,
                            }}
                          >
                            {user.status === 'ACTIVE' ? 'Lock' : 'Unlock'}
                          </Button>
                        </Tooltip>
                        <Button size="small" icon={<KeyOutlined />} onClick={() => openAssign(user)} style={{ borderRadius: c.radiusMd, flex: 1 }}>
                          Roles
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredUsers.length}
                onChange={setCurrentPage}
                showSizeChanger={false}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} users`}
              />
            </div>
          </>
        )}
      </div>

      {/* ========== VIEW DETAILS MODAL (UC-07) ========== */}
      <Modal
        title={
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: c.text, fontSize: 16 }}>
            <EyeOutlined style={{ marginRight: 8, color: c.brand }} /> User Details
          </div>
        }
        open={!!viewing}
        onCancel={() => setViewing(null)}
        footer={null}
        width={680}
        styles={{ content: { borderRadius: c.radiusLg, padding: '24px 28px' }, header: { borderBottom: 'none', marginBottom: 16, padding: 0 }, body: { padding: 0 } }}
      >
        {viewing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Spin spinning={viewLoading}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: hexToRgba(c.brand, 0.12),
                  color: c.brand, fontWeight: 800, fontSize: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {viewing.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: c.text, margin: 0 }}>{viewing.fullName}</h2>
                  <div style={{ fontSize: 13, color: c.textMuted, marginTop: 2 }}>{viewing.email}</div>
                  <div style={{ marginTop: 6 }}>
                    <StatusBadge status={viewing.status} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                <Field icon={<PhoneOutlined />} label="Phone" value={viewing.phone || '—'} />
                <Field icon={<SafetyCertificateOutlined />} label="Auth Provider" value={viewing.authProvider || 'LOCAL'} />
                <Field icon={<CalendarOutlined />} label="Created At" value={viewing.createdAt ? new Date(viewing.createdAt).toLocaleString() : '—'} />
                <Field icon={<ClockCircleOutlined />} label="Last Login" value={viewing.lastLogin ? new Date(viewing.lastLogin).toLocaleString() : 'Never'} />
                {typeof viewing.failedLoginAttempts === 'number' && (
                  <Field
                    icon={<WarningOutlined />}
                    label="Failed Login Attempts"
                    value={viewing.failedLoginAttempts.toString()}
                  />
                )}
                {viewing.mustChangePassword !== undefined && (
                  <Field
                    icon={<LockOutlined />}
                    label="Must Change Password"
                    value={viewing.mustChangePassword ? 'Yes' : 'No'}
                  />
                )}
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>
                  Assigned Roles
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(viewing.roles || []).length === 0 ? (
                    <span style={{ fontSize: 12, color: c.textMuted, fontStyle: 'italic' }}>No roles assigned</span>
                  ) : (viewing.roles || []).map(role => {
                    const cfg = ROLE_COLORS[role] || { color: c.textMuted, bg: hexToRgba(c.textMuted, 0.1) };
                    return (
                      <span key={role} style={{ padding: '4px 10px', borderRadius: c.radiusFull, fontSize: 12, fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${hexToRgba(cfg.color, 0.3)}` }}>
                        {role.replace('_', ' ')}
                      </span>
                    );
                  })}
                </div>
              </div>
            </Spin>
          </div>
        )}
      </Modal>

      {/* ========== CREATE USER MODAL (UC-08) ========== */}
      <Modal
        title={
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: c.text, fontSize: 16 }}>
            <PlusOutlined style={{ marginRight: 8, color: c.brand }} /> Add New User
          </div>
        }
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        footer={null}
        width={560}
        styles={{ content: { borderRadius: c.radiusLg, padding: '24px 28px' }, header: { borderBottom: 'none', marginBottom: 16, padding: 0 }, body: { padding: 0 } }}
      >
        <Form form={createForm} layout="vertical" requiredMark="optional">
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: 'Full name is required' }]}
          >
            <Input placeholder="Jane Doe" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="user@ueims.edu.vn" />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input prefix={<PhoneOutlined />} placeholder="Optional" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please choose an initial role' }]}
            extra="A random temporary password will be generated and emailed to the user."
          >
            <Select placeholder="Select a role">
              {ALL_ROLES.map(r => (
                <Select.Option key={r} value={r}>{r.replace('_', ' ')}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8, paddingTop: 16, borderTop: `1px solid ${c.border}` }}>
            <Button onClick={() => setCreateOpen(false)} style={{ borderRadius: c.radiusMd }}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleCreate}
              loading={creating}
              style={{ background: c.brand, borderColor: c.brand, borderRadius: c.radiusMd, fontWeight: 700 }}
            >
              Create Account
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ========== EDIT USER MODAL (UC-09) ========== */}
      <Modal
        title={
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: c.text, fontSize: 16 }}>
            <EditOutlined style={{ marginRight: 8, color: c.brand }} /> Edit User — {editing?.fullName}
          </div>
        }
        open={!!editing}
        onCancel={() => setEditing(null)}
        footer={null}
        width={520}
        styles={{ content: { borderRadius: c.radiusLg, padding: '24px 28px' }, header: { borderBottom: 'none', marginBottom: 16, padding: 0 }, body: { padding: 0 } }}
      >
        {editing && (
          <Form form={editForm} layout="vertical" requiredMark="optional">
            <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: c.radiusMd, background: c.brandMuted, border: `1px solid ${hexToRgba(c.brand, 0.2)}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase' }}>Email (read-only)</div>
              <div style={{ fontSize: 14, color: c.text, fontWeight: 600, marginTop: 2 }}>{editing.email}</div>
            </div>
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[{ required: true, message: 'Full name is required' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Phone">
              <Input prefix={<PhoneOutlined />} />
            </Form.Item>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8, paddingTop: 16, borderTop: `1px solid ${c.border}` }}>
              <Button onClick={() => setEditing(null)} style={{ borderRadius: c.radiusMd }}>Cancel</Button>
              <Button
                type="primary"
                onClick={handleEdit}
                loading={savingEdit}
                style={{ background: c.brand, borderColor: c.brand, borderRadius: c.radiusMd, fontWeight: 700 }}
              >
                Save Changes
              </Button>
            </div>
          </Form>
        )}
      </Modal>

      {/* ========== STATUS CHANGE CONFIRMATION (UC-10) ========== */}
      <Modal
        open={statusModal.open}
        onCancel={() => setStatusModal({ open: false, user: null, nextStatus: 'ACTIVE' })}
        footer={null}
        width={420}
        centered
        styles={{ content: { borderRadius: c.radiusLg, padding: '24px 28px' }, header: { display: 'none' }, body: { padding: 0 } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: statusModal.nextStatus === 'INACTIVE' || statusModal.nextStatus === 'LOCKED' ? c.errorMuted : c.successMuted,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: statusModal.nextStatus === 'INACTIVE' || statusModal.nextStatus === 'LOCKED' ? c.error : c.success,
          }}>
            <WarningOutlined style={{ fontSize: 28 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: c.text, margin: '0 0 6px' }}>
              {statusModal.nextStatus === 'INACTIVE' || statusModal.nextStatus === 'LOCKED' ? 'Deactivate this user?' : 'Reactivate this user?'}
            </h3>
            <p style={{ fontSize: 13, color: c.textMuted, margin: 0, lineHeight: 1.5 }}>
              {statusModal.nextStatus === 'INACTIVE' || statusModal.nextStatus === 'LOCKED'
                ? 'Active sessions will be terminated immediately and the user will be unable to log in.'
                : 'The user will regain access and be able to log in normally.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <Button
              block
              onClick={() => setStatusModal({ open: false, user: null, nextStatus: 'ACTIVE' })}
              style={{ borderRadius: c.radiusMd }}
            >
              Cancel
            </Button>
            <Button
              block
              type="primary"
              danger={statusModal.nextStatus === 'INACTIVE' || statusModal.nextStatus === 'LOCKED'}
              loading={savingStatus}
              onClick={confirmStatusChange}
              style={{
                borderRadius: c.radiusMd, fontWeight: 700,
                background: statusModal.nextStatus === 'INACTIVE' || statusModal.nextStatus === 'LOCKED' ? c.error : c.success,
                borderColor: statusModal.nextStatus === 'INACTIVE' || statusModal.nextStatus === 'LOCKED' ? c.error : c.success,
              }}
            >
              Yes, {statusModal.nextStatus === 'INACTIVE' || statusModal.nextStatus === 'LOCKED' ? 'Deactivate' : 'Reactivate'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========== ASSIGN ROLES MODAL (UC-11) ========== */}
      <Modal
        title={
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: c.text, fontSize: 16 }}>
            <KeyOutlined style={{ marginRight: 8, color: c.brand }} /> Assign Roles — {assignModal.user?.fullName}
          </div>
        }
        open={assignModal.open}
        onCancel={() => setAssignModal({ open: false, user: null })}
        footer={null}
        width={520}
        styles={{ content: { borderRadius: c.radiusLg, padding: '24px 28px' }, header: { borderBottom: 'none', marginBottom: 16, padding: 0 }, body: { padding: 0 } }}
      >
        <p style={{ fontSize: 13, color: c.textSecondary, margin: '0 0 12px' }}>
          Select roles for <strong>{assignModal.user?.email}</strong>.
        </p>
        <Select
          mode="multiple"
          maxTagCount="responsive"
          value={selectedRoles}
          onChange={setSelectedRoles}
          style={{ width: '100%' }}
          placeholder="Select a role..."
          options={ALL_ROLES.map(r => ({ value: r, label: r.replace('_', ' ') }))}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 16, borderTop: `1px solid ${c.border}`, marginTop: 16 }}>
          <Button onClick={() => setAssignModal({ open: false, user: null })} style={{ borderRadius: c.radiusMd }}>Cancel</Button>
          <Button
            type="primary"
            onClick={handleAssignRoles}
            loading={savingRoles}
            style={{ background: c.brand, borderColor: c.brand, borderRadius: c.radiusMd, fontWeight: 700 }}
          >
            Save Configuration
          </Button>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================
// SUB COMPONENTS
// ============================================================
const Field: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div style={{ padding: '10px 12px', borderRadius: c.radiusMd, background: c.bg, border: `1px solid ${c.border}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase' }}>
      {icon} {label}
    </div>
    <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginTop: 4, wordBreak: 'break-word' }}>{value}</div>
  </div>
);
