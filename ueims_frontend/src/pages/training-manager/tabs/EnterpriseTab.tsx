import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Table, Modal, Button, Input, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Building2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import { EnterpriseService } from '@/services/EnterpriseService';
import type { Enterprise } from '../types';

// ============================================================
// COLOR UTILITY — hex-to-rgba for ghost style rendering
// ============================================================
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const cc = {
  brand: '#FF7A30',
  brandHover: '#E86A20',
  brandMuted: '#FFF3E8',
  brandSubtle: '#FFF8F0',
  brandStrong: '#9B4A10',
  success: '#10B981',
  successMuted: '#D1FAE5',
  successText: '#065F46',
  error: '#EF4444',
  errorMuted: '#FEE2E2',
  errorText: '#991B1B',
  warning: '#F59E0B',
  warningMuted: '#FEF3C7',
  warningText: '#92400E',
  info: '#3B82F6',
  infoMuted: '#DBEAFE',
  infoText: '#1E40AF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  surface: '#FFFFFF',
  bg: '#FFF3E8',
  border: '#E5E7EB',
  borderSubtle: '#F3F4F6',
  radiusSm: 6,
  radiusMd: 8,
  radiusLg: 12,
  radiusXl: 16,
  radiusFull: 9999,
  shadowSm: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
  shadowMd: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)',
  shadowLg: '0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04)',
  shadowBrand: '0 4px 12px rgba(255,122,48,0.25)',
};

const RejectModal: React.FC<{
  open: boolean;
  enterprise: Enterprise | null;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}> = ({ open, enterprise, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const charCount = reason.trim().length;
  const isValid = charCount >= 20;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    await onSubmit(reason.trim());
    setSubmitting(false);
    setReason('');
  };

  const handleClose = () => {
    if (submitting) return;
    setReason('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={480}
      centered
      destroyOnClose
      styles={{
        mask: { background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' },
        content: {
          borderRadius: 16,
          boxShadow: cc.shadowLg,
          border: `1px solid ${cc.border}`,
          padding: 0,
          overflow: 'hidden',
        },
        header: { display: 'none' },
        body: { padding: 0 },
      }}
    >
      <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: cc.radiusMd, background: cc.errorMuted,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <XCircle size={20} color={cc.error} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: cc.textPrimary, margin: 0, lineHeight: 1.3 }}>
            Reject Enterprise Registration
          </h3>
          {enterprise && (
            <p style={{ fontSize: 13, color: cc.textSecondary, margin: '4px 0 0' }}>
              {enterprise.companyName}
            </p>
          )}
        </div>
      </div>

      <div style={{ padding: '16px 24px 24px' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px',
          borderRadius: cc.radiusMd, background: cc.warningMuted, border: `1px solid ${cc.warning}25`, marginBottom: 16,
        }}>
          <AlertTriangle size={14} color={cc.warning} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: cc.warningText, lineHeight: 1.4 }}>
            <strong>BR-15:</strong> A minimum of 20 characters is required for the rejection reason. The enterprise will be notified via email.
          </span>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: cc.textPrimary, marginBottom: 6 }}>
            Reason for rejection <span style={{ color: cc.error }}>*</span>
          </label>
          <Input.TextArea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Describe the reason for rejecting this enterprise registration..."
            maxLength={500}
            showCount
            style={{
              borderRadius: cc.radiusMd,
              borderColor: !isValid && charCount > 0 ? cc.error : cc.border,
              resize: 'none', fontSize: 13, lineHeight: 1.6,
            }}
          />
        </div>

        {charCount > 0 && charCount < 20 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 11, color: cc.error, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <AlertTriangle size={11} />
            {20 - charCount} more characters required
          </motion.div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <Button onClick={handleClose} disabled={submitting} style={{
            borderRadius: cc.radiusMd, borderColor: cc.border, color: cc.textSecondary,
            fontWeight: 600, fontSize: 13, height: 38,
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            loading={submitting}
            style={{
              borderRadius: cc.radiusMd,
              background: isValid ? cc.error : cc.errorMuted,
              borderColor: 'transparent',
              color: isValid ? '#fff' : cc.error,
              fontWeight: 600, fontSize: 13, height: 38,
              boxShadow: isValid ? '0 4px 12px rgba(239,68,68,0.25)' : 'none',
            }}
          >
            Submit Rejection
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const ApprovalRow: React.FC<{
  enterprise: Enterprise;
  index: number;
  onApprove: (id: string) => void;
  onReject: (enterprise: Enterprise) => void;
  submitting: boolean;
}> = ({ enterprise, index, onApprove, onReject, submitting }) => {
  const [expanded, setExpanded] = useState(false);
  const isApproved = enterprise.status === 'APPROVED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: [0.32, 0.72, 0, 1] }}
      style={{
        background: cc.surface,
        border: `1px solid ${cc.border}`,
        borderRadius: cc.radiusLg,
        overflow: 'hidden',
        boxShadow: cc.shadowSm,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
        <div style={{
          width: 42, height: 42, borderRadius: cc.radiusMd, background: cc.brandMuted,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Building2 size={20} color={cc.brand} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: cc.textPrimary, letterSpacing: '-0.01em' }}>
              {enterprise.companyName}
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
              borderRadius: cc.radiusFull,
              backgroundColor: isApproved ? hexToRgba(cc.success, 0.06) : hexToRgba(cc.warning, 0.06),
              border: `1px solid ${isApproved ? hexToRgba(cc.success, 0.25) : hexToRgba(cc.warning, 0.25)}`,
              color: isApproved ? cc.success : cc.warning,
              fontSize: 10, fontWeight: 700, fontFamily: 'Inter, sans-serif',
            }}>
              {isApproved ? 'Approved' : 'Pending'}
            </span>
          </div>
          <div style={{ fontSize: 12, color: cc.textSecondary, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{enterprise.industry}</span>
            <span style={{ color: cc.border }}>|</span>
            <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{enterprise.taxCode}</span>
          </div>
        </div>
        <motion.button
          onClick={() => setExpanded(!expanded)}
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            width: 32, height: 32, borderRadius: cc.radiusMd, background: 'transparent',
            border: `1px solid ${cc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: cc.textSecondary, flexShrink: 0,
          }}
        >
          <ChevronDown size={16} />
        </motion.button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: `1px solid ${cc.borderSubtle}`, padding: '14px 16px', background: cc.bg }}>
              <div className="ent-info-grid">
                {[
                  { label: 'Contact Person', value: enterprise.contactPerson },
                  { label: 'Email', value: enterprise.contactEmail },
                  { label: 'Address', value: enterprise.address },
                  { label: 'Industry', value: enterprise.industry },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 13, color: cc.textPrimary, fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
              {!isApproved && (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <Button
                    onClick={() => onReject(enterprise)}
                    disabled={submitting}
                    style={{ borderRadius: cc.radiusMd, borderColor: cc.error, color: cc.error, fontWeight: 600, fontSize: 13, height: 36 }}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => onApprove(enterprise.enterpriseId)}
                    loading={submitting}
                    style={{
                      borderRadius: cc.radiusMd, background: cc.success, borderColor: cc.success,
                      color: '#fff', fontWeight: 600, fontSize: 13, height: 36, boxShadow: '0 4px 12px rgba(16,185,129,0.25)',
                    }}
                  >
                    Approve
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const AllEnterprisesTable: React.FC<{ data: Enterprise[] }> = ({ data }) => {
  const columns: ColumnsType<Enterprise> = [
    {
      title: 'Company',
      dataIndex: 'companyName',
      key: 'companyName',
      render: (name: string, record: Enterprise) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: cc.radiusSm, background: cc.brandMuted,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 size={16} color={cc.brand} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: cc.textPrimary }}>{name}</div>
            <div style={{ fontSize: 11, color: cc.textMuted }}>{record.industry}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Contact',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      render: (person: string) => <span style={{ fontSize: 13, color: cc.textPrimary }}>{person}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'contactEmail',
      key: 'contactEmail',
      render: (email: string) => <span style={{ fontSize: 12, color: cc.info, fontFamily: 'monospace' }}>{email}</span>,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => <span style={{ fontSize: 12, color: cc.textSecondary }}>{address}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const approved = status === 'APPROVED';
        const color = approved ? cc.success : cc.warning;
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 6,
            backgroundColor: hexToRgba(color, 0.06),
            border: `1px solid ${hexToRgba(color, 0.25)}`,
            color, fontSize: 11, fontWeight: 600,
          }}>
            {approved ? 'Approved' : 'Pending'}
          </span>
        );
      },
    },
  ];

  return (
    <div style={{ overflowX: 'auto', maxWidth: '100%', minWidth: 0 }}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="enterpriseId"
        pagination={false}
        scroll={{ x: 800 }}
        style={{ background: cc.surface, borderRadius: cc.radiusLg, overflow: 'hidden' }}
      />
    </div>
  );
};

export const EnterpriseTab: React.FC = () => {
  const [activeView, setActiveView] = useState<'pending' | 'all'>('pending');
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState<Enterprise | null>(null);

  const pendingCount = useMemo(
    () => enterprises.filter((e) => e.status === 'PENDING').length,
    [enterprises]
  );

  const loadEnterprises = async () => {
    try {
      setLoading(true);
      const data = await EnterpriseService.getAllEnterprises();
      setEnterprises(data);
    } catch {
      setEnterprises([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadEnterprises(); }, []);

  const handleApprove = async (id: string) => {
    try {
      setSubmitting(true);
      await EnterpriseService.updateEnterpriseStatus(id, 'APPROVED');
      await loadEnterprises();
      void message.success('Enterprise approved successfully');
    } catch {
      void message.error('Failed to approve enterprise');
    } finally {
      setSubmitting(false);
    }
  };

  const openRejectModal = (enterprise: Enterprise) => {
    setSelectedEnterprise(enterprise);
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (reason: string) => {
    if (!selectedEnterprise) return;
    try {
      await EnterpriseService.updateEnterpriseStatus(selectedEnterprise.enterpriseId, 'REJECTED', reason);
      setRejectModalOpen(false);
      setSelectedEnterprise(null);
      await loadEnterprises();
      void message.success('Enterprise rejected');
    } catch {
      void message.error('Failed to reject enterprise');
    }
  };

  const pendingEnterprises = enterprises.filter((e) => e.status === 'PENDING');

  return (
    <div className="ent-container" style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .ent-container { padding-bottom: 40px; }
        .ent-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
        @media (max-width: 768px) {
          .ent-container { padding-bottom: 100px !important; }
          .ent-info-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: cc.textPrimary, margin: 0, letterSpacing: '-0.02em' }}>
            Enterprise Management
          </h1>
          <p style={{ fontSize: 13, color: cc.textSecondary, margin: '4px 0 0' }}>
            Review and manage enterprise registrations for OJT placements
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 0, background: cc.surface,
          border: `1px solid ${cc.border}`, borderRadius: cc.radiusMd, padding: 4, marginBottom: 20, boxShadow: cc.shadowSm,
        }}>
          {(['pending', 'all'] as const).map((view) => (
            <motion.button
              key={view}
              onClick={() => setActiveView(view)}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 18px',
                borderRadius: cc.radiusMd, fontSize: 13,
                fontWeight: activeView === view ? 700 : 500,
                color: activeView === view ? '#fff' : cc.textSecondary,
                background: activeView === view ? cc.brand : 'transparent',
                border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s', boxShadow: activeView === view ? cc.shadowBrand : 'none',
              }}
            >
              {view === 'pending' ? 'Pending Approval' : 'All Enterprises'}
              {view === 'pending' && pendingCount > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 18, height: 18, borderRadius: '50%',
                  background: activeView === view ? '#fff' : cc.error,
                  color: activeView === view ? cc.brand : '#fff',
                  fontSize: 10, fontWeight: 800,
                }}>
                  {pendingCount}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeView === 'pending' && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Showing {pendingEnterprises.length} pending registrations
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: cc.textSecondary, fontWeight: 500 }}>
                  Sort: <strong style={{ color: cc.textPrimary }}>Oldest First</strong>
                </div>
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 240 }}>
                  <span style={{ color: cc.textMuted, fontSize: 14 }}>Loading enterprises...</span>
                </div>
              ) : pendingEnterprises.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: 'center', padding: '48px 24px', background: cc.surface, borderRadius: cc.radiusLg, border: `1px solid ${cc.borderSubtle}` }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: cc.radiusMd, background: cc.successMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <CheckCircle2 size={24} color={cc.success} />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: cc.textPrimary }}>All caught up!</div>
                  <div style={{ fontSize: 13, color: cc.textSecondary, marginTop: 4 }}>No pending enterprise registrations at the moment.</div>
                </motion.div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pendingEnterprises.map((enterprise, i) => (
                    <ApprovalRow
                      key={enterprise.enterpriseId}
                      enterprise={enterprise}
                      index={i}
                      onApprove={handleApprove}
                      onReject={openRejectModal}
                      submitting={submitting}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeView === 'all' && (
            <motion.div
              key="all"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            >
              <AllEnterprisesTable data={enterprises.filter((e) => e.status === 'APPROVED')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <RejectModal
        open={rejectModalOpen}
        enterprise={selectedEnterprise}
        onClose={() => { setRejectModalOpen(false); setSelectedEnterprise(null); }}
        onSubmit={handleRejectSubmit}
      />
    </div>
  );
};

export default EnterpriseTab;
