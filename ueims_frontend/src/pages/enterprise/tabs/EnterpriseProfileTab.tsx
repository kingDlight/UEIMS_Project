import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Spin, App, Modal, Form, Input, Button, Upload, Popconfirm, Alert } from 'antd';
import { motion } from 'framer-motion';
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  IdcardOutlined,
  BankOutlined,
  FileTextOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { api } from '@/services/api';
import { c } from '../constants';

// ============================================================
// TYPES
// ============================================================
interface EnterpriseProfile {
  enterpriseId: string;
  companyName: string;
  taxCode: string;
  website: string;
  industry: string;
  description: string;
  address: string;
  logoUrl: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  status: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

const MAX_LOGO_DATA_URL_LENGTH = 500; // matches enterprises.logo_url length

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

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const map: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
    ACTIVE: { color: c.success, bg: hexToRgba(c.success, 0.1), label: 'Active', icon: <CheckCircleOutlined /> },
    APPROVED: { color: c.success, bg: hexToRgba(c.success, 0.1), label: 'Approved', icon: <CheckCircleOutlined /> },
    PENDING: { color: c.warning, bg: hexToRgba(c.warning, 0.1), label: 'Pending', icon: <ClockCircleOutlined /> },
    REJECTED: { color: c.error, bg: hexToRgba(c.error, 0.1), label: 'Rejected', icon: <CloseCircleOutlined /> },
    SUSPENDED: { color: c.error, bg: hexToRgba(c.error, 0.1), label: 'Suspended', icon: <CloseCircleOutlined /> },
  };
  const cfg = map[status ?? 'PENDING'] || map.PENDING;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: c.radiusFull,
      background: cfg.bg, color: cfg.color,
      fontSize: 12, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.05em',
      border: `1px solid ${hexToRgba(cfg.color, 0.3)}`,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: '14px 16px', borderRadius: c.radiusMd,
    background: c.bgLight, border: `1px solid ${c.border}`,
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: c.radiusMd,
      background: c.brandSubtle, color: c.brand,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>{icon}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: c.text, wordBreak: 'break-word' }}>
        {value || <span style={{ color: c.textMuted, fontStyle: 'italic' }}>Not provided</span>}
      </div>
    </div>
  </div>
);

// ============================================================
// MAIN COMPONENT (UC-35 + UC-36)
// ============================================================
export const EnterpriseProfileTab: React.FC = () => {
  const { message } = App.useApp();
  const [profile, setProfile] = useState<EnterpriseProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const initialValuesRef = useRef<Partial<EnterpriseProfile> | null>(null);

  // ============================================================
  // UC-35 Normal Flow: fetch & display enterprise profile
  // ============================================================
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/enterprises/my-profile');
      const data = (res.data?.result ?? res.data) as EnterpriseProfile;
      setProfile(data);
      setLogoPreview(data?.logoUrl || null);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Unable to load profile information at this time. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  // ============================================================
  // UC-36 Normal Flow step 2: open the edit form with current values
  // ============================================================
  const openEdit = () => {
    if (!profile) return;
    const initial: Partial<EnterpriseProfile> = {
      companyName: profile.companyName,
      taxCode: profile.taxCode,
      website: profile.website,
      industry: profile.industry,
      description: profile.description,
      address: profile.address,
      logoUrl: profile.logoUrl,
      contactPerson: profile.contactPerson,
      contactPhone: profile.contactPhone,
      contactEmail: profile.contactEmail,
    };
    initialValuesRef.current = initial;
    form.setFieldsValue(initial);
    setLogoPreview(profile.logoUrl || null);
    setEditOpen(true);
  };

  // ============================================================
  // UC-36 Alternative Flow 36.1: Cancel editing
  // - If form is dirty, confirm before discarding
  // - Always reset form to the read-only view's data
  // ============================================================
  const handleCancel = () => {
    form
      .validateFields()
      .then(() => {
        // Validation passed → no inline errors visible
        attemptCancel();
      })
      .catch(() => {
        // Form has validation errors → definitely dirty
        attemptCancel();
      });
  };

  const attemptCancel = () => {
    if (form.isFieldsTouched()) {
      Modal.confirm({
        title: 'Discard unsaved changes?',
        icon: <ExclamationCircleOutlined style={{ color: c.warning }} />,
        content: 'You have unsaved changes in the edit form. Closing now will discard them.',
        okText: 'Discard',
        cancelText: 'Keep editing',
        okButtonProps: { danger: true },
        onOk: () => closeEdit(),
      });
    } else {
      closeEdit();
    }
  };

  const closeEdit = () => {
    setEditOpen(false);
    if (initialValuesRef.current) {
      form.setFieldsValue(initialValuesRef.current);
    }
    form.resetFields();
    setLogoPreview(profile?.logoUrl || null);
  };

  // ============================================================
  // UC-36 Normal Flow step 3-4: Save (validate, submit)
  // ============================================================
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload = {
        ...values,
        contactPerson: (values.contactPerson ?? '').trim(),
        contactPhone: (values.contactPhone ?? '').trim(),
        contactEmail: (values.contactEmail ?? '').trim().toLowerCase(),
        companyName: (values.companyName ?? '').trim(),
        address: (values.address ?? '').trim(),
        website: (values.website ?? '').trim(),
        industry: (values.industry ?? '').trim(),
        description: values.description ?? '',
      };

      // UC-36: edit the currently authenticated enterprise's own profile
      await api.put('/enterprises/my-profile', payload);

      // UC-36 step 5: success message + back to read-only view with new data
      message.success('Profile updated successfully.');
      setEditOpen(false);
      form.resetFields();
      await fetchProfile();
    } catch (err: any) {
      if (err?.errorFields) {
        // UC-36 Exception 36.0.E1
        message.error('Please fill in all required fields.');
      } else {
        message.error(err.response?.data?.message || 'Failed to update profile.');
      }
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // Logo upload: convert to base64 (kept inline so no separate file
  // hosting is required). Data URLs grow quickly, so we enforce a
  // size + length cap that matches the backend's logo_url column.
  // ============================================================
  const handleLogoUpload: UploadProps['beforeUpload'] = (file) => {
    if (!file.type.startsWith('image/')) {
      message.error('Logo must be an image file (PNG/JPG/SVG).');
      return Upload.LIST_IGNORE;
    }
    const isLt500Kb = file.size / 1024 < 500;
    if (!isLt500Kb) {
      message.error('Logo must be smaller than 500KB to fit the URL field.');
      return Upload.LIST_IGNORE;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (dataUrl.length > MAX_LOGO_DATA_URL_LENGTH) {
        message.error('Encoded logo is too large. Please use a smaller image or a public URL.');
        return;
      }
      form.setFieldValue('logoUrl', dataUrl);
      setLogoPreview(dataUrl);
      message.success('Logo loaded.');
    };
    reader.readAsDataURL(file);
    return Upload.LIST_IGNORE; // prevent antd default upload
  };

  const handleClearLogo = () => {
    form.setFieldValue('logoUrl', '');
    setLogoPreview(null);
  };

  const isSuspended = useMemo(() => profile?.status === 'SUSPENDED', [profile]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: c.textMuted }}>
        No profile data found.
      </div>
    );
  }

  const initials = (profile.companyName || 'EN').substring(0, 2).toUpperCase();

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
            <h2 style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: '0 0 4px' }}>Enterprise Profile</h2>
            <p style={{ fontSize: 13, color: c.textMuted, margin: 0 }}>View and manage your company information</p>
          </div>
          {!editOpen && (
            <Popconfirm
              title="Edit Profile"
              description="Open the editor to update your company information?"
              okText="Continue"
              cancelText="Cancel"
              disabled={isSuspended}
              onConfirm={openEdit}
            >
              <motion.button
                whileHover={isSuspended ? undefined : { y: -1 }}
                whileTap={isSuspended ? undefined : { scale: 0.98 }}
                disabled={isSuspended}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px', borderRadius: c.radiusMd,
                  background: isSuspended ? c.textMuted : c.brand,
                  color: '#fff', fontWeight: 700, fontSize: 13,
                  border: 'none', cursor: isSuspended ? 'not-allowed' : 'pointer',
                  opacity: isSuspended ? 0.6 : 1,
                  boxShadow: isSuspended ? 'none' : c.shadowBrand,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                <EditOutlined /> Edit Profile
              </motion.button>
            </Popconfirm>
          )}
        </motion.div>

        {isSuspended && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16, borderRadius: c.radiusMd }}
            message="Your account is suspended. Editing is disabled until the issue is resolved."
          />
        )}

        {/* READ-ONLY VIEW (UC-35) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          style={{
            background: c.surface, borderRadius: c.radiusLg,
            border: `1px solid ${c.border}`, boxShadow: c.shadowSm,
            overflow: 'hidden', marginBottom: 20,
          }}
        >
          {/* Company Hero */}
          <div style={{
            background: `linear-gradient(135deg, ${c.brand} 0%, ${c.brandHover} 100%)`,
            padding: '32px 28px', color: '#fff',
            display: 'flex', alignItems: 'center', gap: 20,
          }}>
            {profile.logoUrl ? (
              <img src={profile.logoUrl} alt="logo"
                style={{ width: 84, height: 84, borderRadius: c.radiusLg, background: '#fff', objectFit: 'contain', padding: 8, boxShadow: c.shadowMd }} />
            ) : (
              <div style={{
                width: 84, height: 84, borderRadius: c.radiusLg,
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 800, color: '#fff',
                border: '2px solid rgba(255,255,255,0.3)',
              }}>{initials}</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.01em' }}>{profile.companyName}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {profile.industry && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, opacity: 0.9 }}>
                    <BankOutlined /> {profile.industry}
                  </span>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#fff', textDecoration: 'underline', opacity: 0.9 }}>
                    <GlobalOutlined /> {profile.website}
                  </a>
                )}
                <StatusBadge status={profile.status} />
              </div>
            </div>
          </div>

          {/* Rejection reason warning (if any) */}
          {profile.status === 'REJECTED' && profile.rejectionReason && (
            <div style={{ margin: '16px 24px', padding: '12px 16px', borderRadius: c.radiusMd, background: c.errorMuted, border: `1px solid ${hexToRgba(c.error, 0.3)}`, color: c.error, fontSize: 13 }}>
              <strong>Rejection reason:</strong> {profile.rejectionReason}
            </div>
          )}

          {/* Info grid */}
          <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <InfoRow icon={<IdcardOutlined />} label="Tax Code" value={profile.taxCode} />
            <InfoRow icon={<BankOutlined />} label="Industry / Field" value={profile.industry} />
            <InfoRow icon={<EnvironmentOutlined />} label="Address" value={profile.address} />
            <InfoRow icon={<GlobalOutlined />} label="Website" value={profile.website} />
            <InfoRow icon={<UserOutlined />} label="Contact Person" value={profile.contactPerson} />
            <InfoRow icon={<PhoneOutlined />} label="Contact Phone" value={profile.contactPhone} />
            <div style={{ gridColumn: '1 / -1' }}>
              <InfoRow icon={<MailOutlined />} label="Contact Email" value={profile.contactEmail} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <InfoRow icon={<FileTextOutlined />} label="Company Description" value={profile.description} />
            </div>
            {profile.updatedAt && (
              <div style={{ gridColumn: '1 / -1', fontSize: 12, color: c.textMuted, textAlign: 'right' }}>
                Last updated: {new Date(profile.updatedAt).toLocaleString()}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* EDIT MODAL (UC-36) */}
      <Modal
        title={
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: c.text, fontSize: 16 }}>
            <EditOutlined style={{ marginRight: 8, color: c.brand }} />
            Edit Enterprise Profile
          </div>
        }
        open={editOpen}
        // UC-36 Alt 36.1: Cancel button (also used by Esc / backdrop click)
        onCancel={handleCancel}
        width={720}
        footer={null}
        maskClosable={false}
        destroyOnClose
        styles={{ content: { borderRadius: c.radiusLg, padding: '24px 28px' }, header: { borderBottom: 'none', marginBottom: 16, padding: 0 }, body: { padding: 0 } }}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark="optional"
          // Mark fields as required per UC-36 Exception 36.0.E1
          // (Enterprise Name, Address, Contact Person are mandatory; Phone & Email too)
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item
              name="companyName"
              label="Enterprise Name"
              rules={[{ required: true, whitespace: true, message: 'Enterprise name is required' }]}
            >
              <Input placeholder="FPT Software" maxLength={500} showCount />
            </Form.Item>
            <Form.Item name="taxCode" label="Tax Code (read-only)" tooltip="Tax code is set during registration and cannot be changed here.">
              <Input placeholder="0123456789" disabled />
            </Form.Item>
            <Form.Item name="industry" label="Industry / Field">
              <Input placeholder="Software, Banking, ..." maxLength={100} />
            </Form.Item>
            <Form.Item
              name="website"
              label="Website"
              rules={[
                {
                  pattern: /^(https?:\/\/)?[\w.-]+\.[a-zA-Z]{2,}.*$/,
                  message: 'Website must be a valid URL (e.g. https://example.com)',
                },
              ]}
            >
              <Input placeholder="https://example.com" maxLength={255} />
            </Form.Item>
            <div style={{ gridColumn: '1 / -1' }}>
              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, whitespace: true, message: 'Address is required' }]}
              >
                <Input placeholder="Street, District, City" maxLength={500} showCount />
              </Form.Item>
            </div>
            <Form.Item
              name="contactPerson"
              label="Representative / Contact Person"
              rules={[{ required: true, whitespace: true, message: 'Contact person is required' }]}
            >
              <Input placeholder="John Doe" maxLength={255} />
            </Form.Item>
            <Form.Item
              name="contactPhone"
              label="Contact Phone"
              rules={[
                { required: true, whitespace: true, message: 'Contact phone is required' },
                { pattern: /^[+0-9\-\s()]{6,20}$/, message: 'Phone format is invalid' },
              ]}
            >
              <Input placeholder="+84 xxx xxx xxx" maxLength={20} />
            </Form.Item>
            <div style={{ gridColumn: '1 / -1' }}>
              <Form.Item
                name="contactEmail"
                label="Contact Email"
                rules={[
                  { required: true, whitespace: true, message: 'Contact email is required' },
                  { type: 'email', message: 'Contact email must be a valid email address' },
                ]}
              >
                <Input placeholder="contact@company.com" maxLength={255} />
              </Form.Item>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Form.Item
                name="logoUrl"
                label="Logo (URL or upload)"
                tooltip="Upload an image (max 500KB) or paste a public URL. The logo URL must not exceed 500 characters."
              >
                <Input
                  placeholder="https://... or upload below"
                  prefix={<UploadOutlined />}
                  maxLength={500}
                  onChange={(e) => setLogoPreview((e.target.value as string) || null)}
                />
              </Form.Item>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: -8 }}>
                <Upload beforeUpload={handleLogoUpload} showUploadList={false} accept="image/*">
                  <Button icon={<UploadOutlined />}>Upload Logo (max 500KB)</Button>
                </Upload>
                {logoPreview && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img
                      src={logoPreview}
                      alt="logo preview"
                      style={{
                        width: 40, height: 40, borderRadius: c.radiusSm,
                        objectFit: 'contain', background: c.bgLight, border: `1px solid ${c.border}`,
                        padding: 2,
                      }}
                    />
                    <Button type="text" size="small" icon={<CloseOutlined />} onClick={handleClearLogo}>
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Form.Item
                name="description"
                label="Company Description"
                rules={[{ required: true, whitespace: true, message: 'Description is required' }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Brief introduction about your company..."
                  maxLength={5000}
                  showCount
                />
              </Form.Item>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8, paddingTop: 16, borderTop: `1px solid ${c.border}` }}>
            <Button
              onClick={handleCancel}
              icon={<CloseOutlined />}
              style={{ borderRadius: c.radiusMd }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSave}
              loading={saving}
              icon={<SaveOutlined />}
              style={{ background: c.brand, borderColor: c.brand, borderRadius: c.radiusMd, fontWeight: 700 }}
            >
              Save
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
