import React, { useCallback, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message, Form, Input, InputNumber, Select, Skeleton, Empty, Typography, Button } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  PhoneOutlined,
  BankOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { api } from '@/services/api';
import { StudentProfileService } from '@/services/StudentProfileService';

const { Title, Text } = Typography;

const cc = {
  brand: '#E96500',
  brandMuted: '#FFF3E8',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  surface: '#FFFFFF',
  borderSubtle: '#F3F4F6',
  border: '#E5E7EB',
  success: '#10B981',
  successMuted: '#D1FAE5',
  radiusLg: 12,
  radiusMd: 8,
  shadowSm: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
  shadowMd: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)',
};

export const ProfileTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['myProfile'],
    queryFn: async () => {
      const res = await api.get('/users/myInfo');
      return res.data;
    },
  });

  const { data: studentProfile, isLoading: loadingStudent } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: async () => {
      const res = await StudentProfileService.getById(profile?.id);
      return res.data;
    },
    enabled: !!profile?.id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => StudentProfileService.update(studentProfile?.id, data),
    onSuccess: () => {
      messageApi.success('Cập nhật hồ sơ thành công!');
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
    },
    onError: () => messageApi.error('Cập nhật thất bại!'),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File vượt quá 5MB. Vui lòng chọn file nhỏ hơn.');
      }
      if (file.type !== 'application/pdf') {
        throw new Error('Chỉ chấp nhận file định dạng PDF.');
      }
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/student-profiles/upload-cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      messageApi.success('Upload CV thành công!');
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
    },
    onError: (err: any) => messageApi.error(err?.message || 'Upload thất bại!'),
  });

  const handleUpload = useCallback((file: File) => {
    setUploading(true);
    uploadMutation.mutateAsync(file).finally(() => setUploading(false));
    return false;
  }, [uploadMutation]);

  const handleSubmit = (values: any) => {
    updateMutation.mutate(values);
  };

  const cardStyle: React.CSSProperties = {
    background: cc.surface,
    borderRadius: cc.radiusLg,
    border: `1px solid ${cc.borderSubtle}`,
    boxShadow: cc.shadowSm,
    overflow: 'hidden',
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 700,
    color: cc.textPrimary,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  if (isLoading || loadingStudent) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 40px' }}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 40px' }}>
        <Empty description="Không thể tải hồ sơ" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 40px' }}>
      {contextHolder}

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          ...cardStyle,
          background: `linear-gradient(135deg, ${cc.brand}, #FF8A5A)`,
          padding: '24px 28px',
          marginBottom: 20,
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 900, color: '#fff',
            border: '3px solid rgba(255,255,255,0.4)',
          }}>
            {profile?.fullName?.substring(0, 2).toUpperCase() || 'SV'}
          </div>
          <div>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>{profile?.fullName || 'Sinh viên'}</Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>{profile?.email}</Text>
          </div>
        </div>
      </motion.div>

      {/* Info Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        style={cardStyle}
      >
        <div style={{ padding: '24px 28px' }}>
          <div style={sectionTitle}>
            <UserOutlined style={{ color: cc.brand }} />
            Thông tin cá nhân
          </div>

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              fullName: profile?.fullName || '',
              phone: studentProfile?.phone || '',
              major: studentProfile?.major || '',
              gpa: studentProfile?.gpa || undefined,
              address: studentProfile?.address || '',
              skills: studentProfile?.skills?.join(', ') || '',
              currentSemester: studentProfile?.currentSemester || 1,
            }}
            onFinish={handleSubmit}
          >
            <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
              <Input prefix={<UserOutlined style={{ color: cc.textMuted }} />} placeholder="Nguyễn Văn A" />
            </Form.Item>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input prefix={<PhoneOutlined style={{ color: cc.textMuted }} />} placeholder="0912xxx" />
              </Form.Item>
              <Form.Item name="major" label="Chuyên ngành">
                <Input prefix={<BankOutlined style={{ color: cc.textMuted }} />} placeholder="Công nghệ phần mềm" />
              </Form.Item>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Form.Item name="gpa" label="GPA" rules={[{ type: 'number', min: 0, max: 4, message: 'GPA từ 0.0 - 4.0' }]}>
                <InputNumber min={0} max={4} step={0.1} placeholder="3.5" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="currentSemester" label="Học kỳ hiện tại">
                <Select placeholder="Chọn học kỳ">
                  {[1,2,3,4,5,6,7,8,9].map(v => (
                    <Select.Option key={v} value={v}>Học kỳ {v}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <Form.Item name="address" label="Địa chỉ">
              <Input placeholder="Quận 1, TP. HCM" />
            </Form.Item>

            <Form.Item name="skills" label="Kỹ năng (cách nhau bằng dấu phẩy)">
              <Input placeholder="ReactJS, Java, PostgreSQL, Spring Boot" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                htmlType="submit"
                loading={updateMutation.isPending}
                style={{ background: cc.brand, borderColor: cc.brand }}
              >
                Lưu thông tin
              </Button>
            </Form.Item>
          </Form>
        </div>
      </motion.div>

      {/* CV Upload Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        style={{ ...cardStyle, marginTop: 20 }}
      >
        <div style={{ padding: '24px 28px' }}>
          <div style={sectionTitle}>
            <FileTextOutlined style={{ color: cc.brand }} />
            CV của bạn
          </div>

          {studentProfile?.cvPath ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', borderRadius: cc.radiusMd,
              background: cc.successMuted,
              border: `1px solid ${cc.success}30`,
            }}>
              <FileTextOutlined style={{ fontSize: 24, color: cc.success }} />
              <div style={{ flex: 1 }}>
                <Text strong style={{ color: cc.textPrimary }}>CV đã tải lên</Text>
                <br />
                <Text style={{ fontSize: 12, color: cc.textMuted }}>{studentProfile.cvPath}</Text>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = cc.brand; }}
              onDragLeave={(e) => { e.currentTarget.style.borderColor = cc.border; }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = cc.border;
                const file = e.dataTransfer.files[0];
                if (file) handleUpload(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${cc.border}`,
                borderRadius: cc.radiusLg,
                padding: '40px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                background: cc.brandMuted,
              }}
            >
              <FileTextOutlined style={{ fontSize: 40, color: cc.textMuted, marginBottom: 12 }} />
              <div style={{ fontSize: 14, color: cc.textSecondary, marginBottom: 4 }}>
                Kéo thả file CV vào đây, hoặc <span style={{ color: cc.brand, fontWeight: 600 }}>click để chọn</span>
              </div>
              <div style={{ fontSize: 12, color: cc.textMuted }}>
                Định dạng PDF, tối đa 5MB
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              />
            </div>
          )}

          {uploading && (
            <div style={{ marginTop: 12 }}>
              <Text style={{ color: cc.textSecondary }}>Đang tải lên...</Text>
            </div>
          )}
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 600px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
