import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { LogoutOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/useAuthStore';
import { AuthService } from '@/services/AuthService';

export const NoRolePage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, token } = useAuthStore();

  const handleLogout = async () => {
    if (token) {
      try {
        await AuthService.logout(token);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    logout();
    navigate('/login');
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 24, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#fff', padding: 40, borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.08)', textAlign: 'center', maxWidth: 480 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid #ffedd5' }}>
          <SafetyCertificateOutlined style={{ fontSize: 36, color: '#ea580c' }} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Tài khoản chưa được phân quyền</h1>
        <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6, marginBottom: 32 }}>
          Tài khoản của bạn hiện chưa được gán bất kỳ vai trò nào trong hệ thống. Vui lòng liên hệ với quản trị viên để được cấp quyền truy cập.
        </p>
        <Button 
          type="primary" 
          size="large" 
          icon={<LogoutOutlined />} 
          onClick={handleLogout}
          style={{ background: '#ea580c', borderColor: '#ea580c', fontWeight: 600, height: 44, borderRadius: 12, width: '100%' }}
        >
          Đăng xuất
        </Button>
      </div>
    </div>
  );
};
