import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Modal, Form, Input, message } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { AuthService } from '@/services/AuthService';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  LockOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const mustChangePassword = (user as any)?.mustChangePassword;

  React.useEffect(() => {
    if (mustChangePassword) {
      setChangePasswordVisible(true);
    }
  }, [mustChangePassword]);

  const handleLogout = async () => {
    try {
      if (token) {
        await AuthService.logout(token);
      }
    } catch {
      // Vẫn tiếp tục logout local dù API lỗi
    } finally {
      logout();
      navigate('/login');
    }
  };

  const handleChangePassword = async (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    try {
      await AuthService.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      message.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      setChangePasswordVisible(false);
      if (mustChangePassword) {
        logout();
        navigate('/login');
      }
    } catch (error: any) {
      const code = error.response?.data?.code;
      if (code === 2002) {
        message.error('Mật khẩu cũ không chính xác!');
      } else if (code === 2003) {
        message.error('Mật khẩu xác nhận không khớp!');
      } else if (code === 1015) {
        message.error('Mật khẩu mới không hợp lệ. Phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt!');
      } else {
        message.error(error.response?.data?.message || 'Đổi mật khẩu thất bại!');
      }
    } finally {
      setLoading(false);
    }
  };

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: user?.email || 'Tài khoản' },
      { key: 'change-password', icon: <LockOutlined />, label: 'Đổi mật khẩu', onClick: () => setChangePasswordVisible(true) },
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', onClick: handleLogout, danger: true },
    ],
  };

  const sidebarItems = [
    { key: '/app/dashboard', icon: <DashboardOutlined />, label: 'Dashboard', onClick: () => navigate('/app/dashboard') },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: 18,
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {collapsed ? 'UE' : 'UEIMS System'}
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['/app/dashboard']}
          items={sidebarItems}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingRight: 24,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Dropdown menu={userMenu} placement="bottomRight">
            <div
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontWeight: 500 }}>{user?.fullName || user?.email || 'User'}</span>
              <div
                style={{
                  background: '#E67E22',
                  color: '#fff',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UserOutlined />
              </div>
            </div>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: 8,
          }}
        >
          <Outlet />
        </Content>
      </Layout>

      {/* Change Password Modal */}
      <Modal
        title="Đổi mật khẩu"
        open={changePasswordVisible}
        onCancel={() => !mustChangePassword && setChangePasswordVisible(false)}
        footer={null}
        destroyOnHidden
        closable={!mustChangePassword}
        maskClosable={!mustChangePassword}
        keyboard={!mustChangePassword}
      >
        <Form layout="vertical" onFinish={handleChangePassword}>
          <Form.Item
            name="oldPassword"
            label="Mật khẩu cũ"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu cũ" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu!' }]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            {!mustChangePassword && (
              <Button onClick={() => setChangePasswordVisible(false)} style={{ marginRight: 8 }}>
                Hủy
              </Button>
            )}
            <Button type="primary" htmlType="submit" loading={loading}>
              Xác nhận
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};
