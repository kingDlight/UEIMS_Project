import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { AuthService } from '@/services/AuthService';
import { useAuthStore } from '@/stores/useAuthStore';
import { extractUserFromToken } from '@/utils/jwt';
import { getRedirectPath } from '@/utils/roleRedirect';

const { Title, Text } = Typography;

export const ChangePasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token, refreshToken, loginWithTokens, logout } = useAuthStore();

  const onFinish = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      setLoading(true);
      await AuthService.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      message.success('Đổi mật khẩu thành công! Hãy tiếp tục công việc.');
      
      // We must "refresh" the token to get a new one where mustChangePassword is false
      // But since we are already authenticated, we can just navigate to dashboard and the interceptor handles it?
      // No, let's just log out and force a re-login for security, or we can just redirect!
      if (token) {
        const payload = extractUserFromToken(token);
        const redirectPath = getRedirectPath(payload?.roles || []);
        
        // Temporarily log them out so they use the new password to get a fresh token!
        // This is the safest way to clear the mustChangePassword claim.
        message.info('Vui lòng đăng nhập lại với mật khẩu mới.');
        logout();
        navigate('/login');
      } else {
        navigate('/login');
      }

    } catch (error: any) {
      console.error('Change password failed', error);
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.';
      if (errorMsg === 'INVALID_PASSWORD') {
        message.error('Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.');
      } else if (errorMsg === 'WRONG_PASSWORD') {
        message.error('Mật khẩu cũ không chính xác.');
      } else {
        message.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: 40, borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.08)', width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, background: 'rgba(230, 126, 34, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#e67e22', fontSize: 28 }}>
            <LockOutlined />
          </div>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}>Đổi mật khẩu bảo mật</Title>
          <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
            Vì lý do bảo mật, bạn bắt buộc phải đổi mật khẩu ở lần đăng nhập đầu tiên.
          </Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="oldPassword"
            label={<Text strong>Mật khẩu hiện tại (mặc định)</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
          >
            <Input.Password size="large" placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label={<Text strong>Mật khẩu mới</Text>}
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
                message: 'Mật khẩu phải gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
              }
            ]}
          >
            <Input.Password size="large" placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={<Text strong>Xác nhận mật khẩu mới</Text>}
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            style={{ marginTop: 8, height: 48, borderRadius: 12, fontWeight: 700, background: '#e67e22' }}
          >
            Đổi mật khẩu & Tiếp tục
          </Button>
          
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Text type="secondary">
              Hoặc <a onClick={() => { logout(); navigate('/login'); }} style={{ color: '#e67e22', fontWeight: 600 }}>đăng xuất</a> và quay lại sau
            </Text>
          </div>
        </Form>
      </div>
    </div>
  );
};
