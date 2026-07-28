import React, { useEffect, useMemo, useState } from 'react';
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
import { api } from '@/services/api';
import { resolveEnterpriseLogo, enterpriseInitials } from '@/utils/enterpriseLogo';

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



// ============================================================
// HELPERS
// ============================================================

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const map: Record<string, { color: string; bg: string; borderColor: string; label: string; icon: React.ReactNode }> = {
    ACTIVE: { color: 'text-emerald-600', bg: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', label: 'Active', icon: <CheckCircleOutlined /> },
    APPROVED: { color: 'text-emerald-600', bg: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', label: 'Approved', icon: <CheckCircleOutlined /> },
    PENDING: { color: 'text-amber-500', bg: 'bg-amber-500/10', borderColor: 'border-amber-500/30', label: 'Pending', icon: <ClockCircleOutlined /> },
    REJECTED: { color: 'text-red-500', bg: 'bg-red-500/10', borderColor: 'border-red-500/30', label: 'Rejected', icon: <CloseCircleOutlined /> },
    SUSPENDED: { color: 'text-red-500', bg: 'bg-red-500/10', borderColor: 'border-red-500/30', label: 'Suspended', icon: <CloseCircleOutlined /> },
  };
  const cfg = map[status ?? 'PENDING'] || map.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${cfg.bg} ${cfg.color} ${cfg.borderColor}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
    <div className="w-9 h-9 rounded-xl bg-[#E67E22]/5 text-[#E67E22] flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-sm font-semibold text-slate-900 break-words">
        {value || <span className="text-slate-500 italic">Not provided</span>}
      </div>
    </div>
  </div>
);

// ============================================================
// INNER FORM COMPONENT (own form instance — survives destroyOnHidden)
// ============================================================
interface EditProfileFormProps {
  initialValues: Partial<EnterpriseProfile>;
  onCancel: () => void;
  onSubmit: (values: Partial<EnterpriseProfile>) => Promise<void>;
  saving: boolean;
  logoPreview: string | null;
  setLogoPreview: (url: string | null) => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  initialValues, onCancel, onSubmit, saving, logoPreview, setLogoPreview
}) => {
  const [form] = Form.useForm();
  const [dirty, setDirty] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    form.setFieldsValue(initialValues);
    setDirty(false);
  }, [initialValues, form]);

  const handleClearLogo = () => {
    form.setFieldValue('logoUrl', '');
    setLogoPreview(null);
  };

  const handleLogoUpload = (file: File) => {
    if (file.size > 500 * 1024) {
      message.error('Logo must be 500KB or smaller.');
      return Upload.LIST_IGNORE;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      form.setFieldValue('logoUrl', dataUrl);
      setLogoPreview(dataUrl);
    };
    reader.readAsDataURL(file);
    return Upload.LIST_IGNORE;
  };

  const handleCancel = () => {
    if (dirty) {
      Modal.confirm({
        title: 'Discard unsaved changes?',
        icon: <ExclamationCircleOutlined className="text-amber-500" />,
        content: 'You have unsaved changes in the edit form. Closing now will discard them.',
        okText: 'Discard',
        cancelText: 'Keep editing',
        okButtonProps: { danger: true },
        onOk: onCancel,
      });
    } else {
      onCancel();
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
    } catch (err) {
      // validation failed — antd highlights fields
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark="optional"
      onValuesChange={() => setDirty(true)}
    >
      <div className="grid grid-cols-2 gap-3">
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
              pattern: /^$|^(https?:\/\/)?([\w.-]+)\.([a-zA-Z]{2,})(\/\S*)?$/,
              message: 'Website must be a valid URL (e.g. https://example.com)',
            },
          ]}
        >
          <Input placeholder="https://example.com" maxLength={255} />
        </Form.Item>
        <div className="col-span-full">
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
        <div className="col-span-full">
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
        <div className="col-span-full">
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
          <div className="flex items-center gap-3 -mt-2">
            <Upload beforeUpload={handleLogoUpload} showUploadList={false} accept="image/*">
              <Button icon={<UploadOutlined />}>Upload Logo (max 500KB)</Button>
            </Upload>
            {logoPreview && (
              <div className="flex items-center gap-2">
                <img
                  src={logoPreview}
                  alt="logo preview"
                  className="w-10 h-10 rounded-lg object-contain bg-slate-50 border border-slate-200 p-0.5"
                />
                <Button type="text" size="small" icon={<CloseOutlined />} onClick={handleClearLogo}>
                  Remove
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="col-span-full">
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

      <div className="flex gap-2.5 justify-end mt-2 pt-4 border-t border-slate-200">
        <Button
          onClick={handleCancel}
          icon={<CloseOutlined />}
          className="rounded-xl"
        >
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={handleSave}
          loading={saving}
          icon={<SaveOutlined />}
          className="bg-[#E67E22] border-[#E67E22] rounded-xl font-bold hover:bg-[#D35400] hover:border-[#D35400]"
        >
          Save
        </Button>
      </div>
    </Form>
  );
};

// ============================================================
// MAIN COMPONENT (UC-35 + UC-36)
// ============================================================
export const EnterpriseProfileTab: React.FC = () => {
  const { message } = App.useApp();
  const [profile, setProfile] = useState<EnterpriseProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [editInitial, setEditInitial] = useState<Partial<EnterpriseProfile>>({});
  const [editKey, setEditKey] = useState(0);

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
    setEditInitial(initial);
    setLogoPreview(profile.logoUrl || null);
    setEditKey((k) => k + 1);
    setEditOpen(true);
  };

  const handleEditSubmit = async (values: Partial<EnterpriseProfile>) => {
    setSaving(true);
    try {
      const res = await api.put('/enterprises/my-profile', values);
      const updated = (res.data?.result ?? res.data ?? values) as EnterpriseProfile;
      setProfile(updated);
      setLogoPreview(updated?.logoUrl || null);
      setEditOpen(false);
      message.success('Profile updated successfully.');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const isSuspended = useMemo(() => profile?.status === 'SUSPENDED', [profile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-10 text-center text-slate-500">
        No profile data found.
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
          className="flex items-center justify-between mb-5"
        >
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 m-0 mb-1">Enterprise Profile</h2>
            <p className="text-sm text-slate-500 m-0">View and manage your company information</p>
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
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm text-white border-none transition-shadow
                  ${isSuspended ? 'bg-slate-500 cursor-not-allowed opacity-60' : 'bg-[#E67E22] cursor-pointer hover:shadow-[0_8px_22px_rgba(230,126,34,0.22)]'}`}
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
            className="mb-4 rounded-xl"
            message="Your account is suspended. Editing is disabled until the issue is resolved."
          />
        )}

        {/* READ-ONLY VIEW (UC-35) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-5"
        >
          {/* Company Hero */}
          <div className="bg-gradient-to-br from-[#E67E22]/40 to-[#D35400] px-7 py-8 text-white flex items-center gap-5">
            {(() => {
              const resolvedLogo = resolveEnterpriseLogo(profile.companyName, profile.logoUrl);
              return resolvedLogo ? (
                <img src={resolvedLogo} alt="logo"
                  className="w-[84px] h-[84px] rounded-2xl bg-white object-contain p-2 shadow-md"
                  onError={(e) => {
                    // Fallback to initials if the CDN URL fails to load
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }} />
              ) : (
                <div className="w-[84px] h-[84px] rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-extrabold text-white border-2 border-white/30">
                  {enterpriseInitials(profile.companyName)}
                </div>
              );
            })()}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold m-0 mb-1.5 tracking-tight">{profile.companyName}</h1>
              <div className="flex items-center gap-2.5 flex-wrap">
                {profile.industry && (
                  <span className="inline-flex items-center gap-1 text-sm opacity-90">
                    <BankOutlined /> {profile.industry}
                  </span>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-white underline opacity-90 hover:opacity-100">
                    <GlobalOutlined /> {profile.website}
                  </a>
                )}
                <StatusBadge status={profile.status} />
              </div>
            </div>
          </div>

          {/* Rejection reason warning (if any) */}
          {profile.status === 'REJECTED' && profile.rejectionReason && (
            <div className="mx-6 my-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-500 text-sm">
              <strong>Rejection reason:</strong> {profile.rejectionReason}
            </div>
          )}

          {/* Info grid */}
          <div className="p-6 grid grid-cols-2 gap-3">
            <InfoRow icon={<IdcardOutlined />} label="Tax Code" value={profile.taxCode} />
            <InfoRow icon={<BankOutlined />} label="Industry / Field" value={profile.industry} />
            <InfoRow icon={<EnvironmentOutlined />} label="Address" value={profile.address} />
            <InfoRow icon={<GlobalOutlined />} label="Website" value={profile.website} />
            <InfoRow icon={<UserOutlined />} label="Contact Person" value={profile.contactPerson} />
            <InfoRow icon={<PhoneOutlined />} label="Contact Phone" value={profile.contactPhone} />
            <div className="col-span-full">
              <InfoRow icon={<MailOutlined />} label="Contact Email" value={profile.contactEmail} />
            </div>
            <div className="col-span-full">
              <InfoRow icon={<FileTextOutlined />} label="Company Description" value={profile.description} />
            </div>
            {profile.updatedAt && (
              <div className="col-span-full text-xs text-slate-500 text-right">
                Last updated: {new Date(profile.updatedAt).toLocaleString()}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* EDIT MODAL (UC-36) */}
      <Modal
        title={
          <div className="font-sans font-bold text-slate-900 text-base flex items-center">
            <EditOutlined className="mr-2 text-[#E67E22]" />
            Edit Enterprise Profile
          </div>
        }
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        width={720}
        footer={null}
        maskClosable={false}
        destroyOnHidden
        styles={{ content: { borderRadius: 16, padding: '24px 28px' }, header: { borderBottom: 'none', marginBottom: 16, padding: 0 }, body: { padding: 0 } }}
      >
        {editOpen && (
          <EditProfileForm
            key={editKey}
            initialValues={editInitial}
            onCancel={() => setEditOpen(false)}
            onSubmit={handleEditSubmit}
            saving={saving}
            logoPreview={logoPreview}
            setLogoPreview={setLogoPreview}
          />
        )}
      </Modal>
    </div>
  );
};
