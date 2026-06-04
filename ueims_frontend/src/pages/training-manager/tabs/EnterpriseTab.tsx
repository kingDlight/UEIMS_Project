import React, { useEffect, useMemo, useState } from 'react';
import { Input, Modal, Spin } from 'antd';
import { c } from '../constants';
import type { Enterprise } from '../types';
import { NeuSurface } from '../components/shared/NeuSurface';
import { SmallPill } from '../components/shared/SmallPill';
import { EnterpriseService } from '@/services/EnterpriseService';

const getStatusColor = (status: Enterprise['status']) => {
  if (status === 'APPROVED') return c.success;
  if (status === 'REJECTED') return c.danger;
  return c.warning;
};

const getStatusLabel = (status: Enterprise['status']) => {
  if (status === 'APPROVED') return 'Approved';
  if (status === 'REJECTED') return 'Rejected';
  return 'Pending';
};

export const EnterpriseTab: React.FC = () => {
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState<Enterprise | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const pendingCount = useMemo(
    () => enterprises.filter((enterprise) => enterprise.status === 'PENDING').length,
    [enterprises]
  );

  const loadEnterprises = async () => {
    try {
      setLoading(true);
      const data = await EnterpriseService.getAllEnterprises();
      setEnterprises(data);
    } catch (error) {
      console.error('Failed to fetch enterprises:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEnterprises();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      setSubmitting(true);
      await EnterpriseService.updateEnterpriseStatus(id, 'APPROVED');
      await loadEnterprises();
    } catch (error) {
      console.error('Failed to approve enterprise:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const openRejectModal = (enterprise: Enterprise) => {
    setSelectedEnterprise(enterprise);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedEnterprise || !rejectionReason.trim()) return;

    try {
      setSubmitting(true);
      await EnterpriseService.updateEnterpriseStatus(
        selectedEnterprise.enterpriseId,
        'REJECTED',
        rejectionReason.trim()
      );
      setRejectModalOpen(false);
      setSelectedEnterprise(null);
      setRejectionReason('');
      await loadEnterprises();
    } catch (error) {
      console.error('Failed to reject enterprise:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <NeuSurface style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: c.text, margin: 0 }}>Enterprise List</h2>
              <p style={{ fontSize: 14, color: c.textMuted, marginTop: 6 }}>Review newly registered enterprises and manage approval decisions</p>
            </div>
            <SmallPill>{loading ? 'Loading...' : `${enterprises.length} enterprises`}</SmallPill>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
              <Spin size="large" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {enterprises.map((enterprise) => (
                <div key={enterprise.enterpriseId} style={{ padding: '16px 18px', borderRadius: 18, background: '#fff', border: '1px solid rgba(226,232,240,.9)', boxShadow: '0 4px 16px rgba(15,23,42,.04)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr .8fr auto', gap: 16, alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: c.text }}>{enterprise.companyName}</div>
                      <div style={{ fontSize: 11.5, color: c.textMuted, marginTop: 3 }}>{enterprise.contactPerson} · {enterprise.contactEmail}</div>
                    </div>
                    <div style={{ fontSize: 12.5, color: c.textMuted }}>
                      <div>TAX {enterprise.taxCode}</div>
                      <div style={{ marginTop: 4 }}>{enterprise.industry}</div>
                    </div>
                    <div style={{ fontSize: 12.5, color: c.textMuted }}>{enterprise.address}</div>
                    <SmallPill color={getStatusColor(enterprise.status)}>{getStatusLabel(enterprise.status)}</SmallPill>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <button style={{ padding: '9px 12px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', color: c.text, fontWeight: 700, cursor: 'pointer' }}>View Legal Profile</button>
                      <button
                        onClick={() => void handleApprove(enterprise.enterpriseId)}
                        disabled={submitting || enterprise.status === 'APPROVED'}
                        style={{ padding: '9px 12px', borderRadius: 12, border: 'none', background: enterprise.status === 'APPROVED' ? '#bbf7d0' : c.success, color: '#fff', fontWeight: 800, cursor: submitting || enterprise.status === 'APPROVED' ? 'not-allowed' : 'pointer', opacity: submitting || enterprise.status === 'APPROVED' ? 0.7 : 1 }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openRejectModal(enterprise)}
                        disabled={submitting}
                        style={{ padding: '9px 12px', borderRadius: 12, border: 'none', background: c.danger, color: '#fff', fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: 12.5, color: c.textMuted, lineHeight: 1.6, marginTop: 10 }}>
                    {enterprise.rejectionReason ? `Rejection reason: ${enterprise.rejectionReason}` : `Pending approvals in queue: ${pendingCount}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </NeuSurface>
      </div>

      <Modal
        title={selectedEnterprise ? `Reject ${selectedEnterprise.companyName}` : 'Reject Enterprise'}
        open={rejectModalOpen}
        onOk={() => void handleRejectSubmit()}
        onCancel={() => {
          if (submitting) return;
          setRejectModalOpen(false);
          setSelectedEnterprise(null);
          setRejectionReason('');
        }}
        okText="Submit"
        okButtonProps={{ disabled: !rejectionReason.trim(), loading: submitting, danger: true }}
        cancelButtonProps={{ disabled: submitting }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <div style={{ fontSize: 13, color: c.textMuted }}>Enter rejection reason for this enterprise registration.</div>
          <Input.TextArea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            rows={4}
            placeholder="Nhập lý do từ chối"
            maxLength={500}
          />
        </div>
      </Modal>
    </>
  );
};
