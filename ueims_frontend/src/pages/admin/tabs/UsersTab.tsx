import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Spin, App, Modal, Select, Tag, Tooltip, Badge } from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { AdminService } from '@/services/AdminService';
import { c } from '../constants';

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const ROLE_COLORS: Record<string, { color: string; bg: string }> = {
  SYSTEM_ADMIN: { color: c.brand, bg: hexToRgba(c.brand, 0.1) },
  TRAINING_MANAGER: { color: c.purple, bg: hexToRgba(c.purple, 0.1) },
  ENTERPRISE: { color: c.success, bg: hexToRgba(c.success, 0.1) },
  STUDENT: { color: c.info, bg: hexToRgba(c.info, 0.1) },
};

const ALL_ROLES = ['SYSTEM_ADMIN', 'TRAINING_MANAGER', 'ENTERPRISE', 'STUDENT'];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const { message } = App.useApp();
  const isActive = status === 'ACTIVE';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: c.radiusFull,
      background: isActive ? hexToRgba(c.success, 0.1) : hexToRgba(c.error, 0.1),
      color: isActive ? c.success : c.error,
      fontSize: 11, fontWeight: 700,
      border: `1px solid ${hexToRgba(isActive ? c.success : c.error, 0.3)}`,
    }}>
      {isActive ? <CheckCircleOutlined size={10} /> : <CloseCircleOutlined size={10} />}
      {status}
    </span>
  );
};

export const UsersTab: React.FC = () => {
  const { message } = App.useApp();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [assignModal, setAssignModal] = useState<{ open: boolean; user: any }>({ open: false, user: null });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [savingRoles, setSavingRoles] = useState(false);
  const [statusModal, setStatusModal] = useState<{ open: boolean; user: any; newStatus: string }>({ open: false, user: null, newStatus: 'ACTIVE' });
  const [savingStatus, setSavingStatus] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

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

  const openAssignModal = (user: any) => {
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
        ...toAdd.map(role => AdminService.assignRole(assignModal.user.userId, role)),
        ...toRemove.map(role => AdminService.revokeRole(assignModal.user.userId, role)),
      ]);

      message.success(`Roles updated for ${assignModal.user.fullName}`);
      setAssignModal({ open: false, user: null });
      fetchUsers();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to update roles.');
    } finally {
      setSavingRoles(false);
    }
  };

  const handleStatusChange = async () => {
    if (!statusModal.user) return;
    setSavingStatus(true);
    try {
      await AdminService.updateUserStatus(statusModal.user.userId, statusModal.newStatus);
      message.success('User status updated.');
      setStatusModal({ open: false, user: null, newStatus: 'ACTIVE' });
      fetchUsers();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setSavingStatus(false);
    }
  };

  const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
    <div style={{ background: c.surface, borderRadius: c.radiusLg, border: `1px solid ${c.border}`, boxShadow: c.shadowSm, overflow: 'hidden', ...style }}>
      {children}
    </div>
  );

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 20px 40px' }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

          {/* Header */}
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: 0 }}>User Management</h2>
              <p style={{ fontSize: 13, color: c.textSecondary, margin: '4px 0 0' }}>Manage user accounts and role assignments</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: c.textMuted }}>
                {filteredUsers.length} of {users.length} users
              </span>
            </div>
          </div>

          {/* Filters */}
          <Card style={{ padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <SearchOutlined style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: c.textMuted }} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: c.radiusMd, border: `1px solid ${c.border}`, fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', color: c.text }}
                />
              </div>
              <Select
                value={roleFilter}
                onChange={val => { setRoleFilter(val); setCurrentPage(1); }}
                style={{ minWidth: 160 }}
                options={[
                  { value: 'ALL', label: 'All Roles' },
                  ...ALL_ROLES.map(r => ({ value: r, label: r.replace('_', ' ') })),
                ]}
              />
              <Select
                value={statusFilter}
                onChange={val => { setStatusFilter(val); setCurrentPage(1); }}
                style={{ minWidth: 140 }}
                options={[
                  { value: 'ALL', label: 'All Status' },
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'INACTIVE', label: 'Inactive' },
                  { value: 'LOCKED', label: 'Locked' },
                ]}
              />
            </div>
          </Card>

          {/* User Table */}
          <Card>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: c.neutralBg, borderBottom: `1px solid ${c.border}` }}>
                    {['User', 'Email', 'Phone', 'Roles', 'Status', 'Created', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: c.textMuted, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: c.textMuted, fontSize: 13 }}>No users match your filters</td>
                    </tr>
                  ) : paginatedUsers.map((user, idx) => (
                    <tr key={user.userId ?? idx} style={{ borderBottom: idx < paginatedUsers.length - 1 ? `1px solid ${c.borderSubtle}` : 'none` }`}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: hexToRgba(c.brand, 0.1), color: c.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                            {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{user.fullName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: c.textSecondary }}>{user.email}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: c.textMuted }}>{user.phone || '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {(user.roles || []).length === 0 ? (
                            <span style={{ fontSize: 12, color: c.textMuted }}>No roles</span>
                          ) : (user.roles || []).map(role => {
                            const cfg = ROLE_COLORS[role] || { color: c.textMuted, bg: hexToRgba(c.textMuted, 0.1) };
                            return (
                              <span key={role} style={{ padding: '2px 8px', borderRadius: c.radiusFull, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${hexToRgba(cfg.color, 0.3)}` }}>
                                {role.replace('_', ' ')}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}><StatusBadge status={user.status} /></td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: c.textMuted, whiteSpace: 'nowrap' }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Tooltip title="Assign Roles">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openAssignModal(user)}
                              style={{ width: 32, height: 32, borderRadius: c.radiusMd, border: `1px solid ${c.border}`, background: c.neutralBg, color: c.brand, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <KeyOutlined size={14} />
                            </motion.button>
                          </Tooltip>
                          <Tooltip title="Change Status">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setStatusModal({ open: true, user, newStatus: user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
                              style={{ width: 32, height: 32, borderRadius: c.radiusMd, border: `1px solid ${c.border}`, background: c.neutralBg, color: user.status === 'ACTIVE' ? c.error : c.success, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              {user.status === 'ACTIVE' ? <CloseCircleOutlined size={14} /> : <CheckCircleOutlined size={14} />}
                            </motion.button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredUsers.length > pageSize && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 16, borderTop: `1px solid ${c.border}` }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {Array.from({ length: Math.ceil(filteredUsers.length / pageSize) }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        width: 36, height: 36, borderRadius: c.radiusMd,
                        border: `1px solid ${currentPage === page ? c.brand : c.border}`,
                        background: currentPage === page ? c.brand : 'transparent',
                        color: currentPage === page ? '#fff' : c.textSecondary,
                        fontSize: 13, fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

        </motion.div>
      </div>

      {/* Assign Roles Modal */}
      <Modal
        title={
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: c.text, fontSize: 15 }}>
            <KeyOutlined style={{ marginRight: 8, color: c.brand }} />
            Assign Roles — {assignModal.user?.fullName}
          </div>
        }
        open={assignModal.open}
        onCancel={() => setAssignModal({ open: false, user: null })}
        footer={null}
        width={480}
        styles={{ content: { borderRadius: c.radiusLg, padding: '24px' }, body: { padding: 0 } }}
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: c.textSecondary, margin: '0 0 12px' }}>
            Select roles for <strong>{assignModal.user?.email}</strong>. Changes take effect immediately.
          </p>
          <Select
            mode="multiple"
            value={selectedRoles}
            onChange={setSelectedRoles}
            style={{ width: '100%' }}
            placeholder="Select roles..."
            options={ALL_ROLES.map(r => ({ value: r, label: r.replace('_', ' ') }))}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 16, borderTop: `1px solid ${c.border}` }}>
          <button
            onClick={() => setAssignModal({ open: false, user: null })}
            style={{ padding: '8px 16px', borderRadius: c.radiusMd, border: `1px solid ${c.border}`, background: 'transparent', color: c.textSecondary, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleAssignRoles}
            disabled={savingRoles}
            style={{ padding: '8px 16px', borderRadius: c.radiusMd, border: 'none', background: c.brand, color: '#fff', fontSize: 13, fontWeight: 700, cursor: savingRoles ? 'not-allowed' : 'pointer', opacity: savingRoles ? 0.6 : 1 }}
          >
            {savingRoles ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </Modal>

      {/* Status Change Modal */}
      <Modal
        title={
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: c.text, fontSize: 15 }}>
            <SafetyCertificateOutlined style={{ marginRight: 8, color: c.brand }} />
            Change User Status
          </div>
        }
        open={statusModal.open}
        onCancel={() => setStatusModal({ open: false, user: null, newStatus: 'ACTIVE' })}
        footer={null}
        width={420}
        centered
        styles={{ content: { borderRadius: c.radiusLg, padding: '24px' } }}
      >
        <p style={{ fontSize: 13, color: c.textSecondary, margin: '0 0 16px' }}>
          Set status for <strong>{statusModal.user?.fullName}</strong>:
        </p>
        <Select
          value={statusModal.newStatus}
          onChange={val => setStatusModal(s => ({ ...s, newStatus: val }))}
          style={{ width: '100%', marginBottom: 16 }}
          options={[
            { value: 'ACTIVE', label: 'Active — User can log in normally' },
            { value: 'INACTIVE', label: 'Inactive — User temporarily disabled' },
            { value: 'LOCKED', label: 'Locked — User locked due to security' },
          ]}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={() => setStatusModal({ open: false, user: null, newStatus: 'ACTIVE' })}
            style={{ padding: '8px 16px', borderRadius: c.radiusMd, border: `1px solid ${c.border}`, background: 'transparent', color: c.textSecondary, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleStatusChange}
            disabled={savingStatus}
            style={{ padding: '8px 16px', borderRadius: c.radiusMd, border: 'none', background: c.brand, color: '#fff', fontSize: 13, fontWeight: 700, cursor: savingStatus ? 'not-allowed' : 'pointer', opacity: savingStatus ? 0.6 : 1 }}
          >
            {savingStatus ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </Modal>
    </div>
  );
};
