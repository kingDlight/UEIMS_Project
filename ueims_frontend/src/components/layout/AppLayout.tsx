import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Modal, Form, Input, App } from 'antd';
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
import { useTranslation } from 'react-i18next';

const { Header, Sider, Content } = Layout;

export const AppLayout: React.FC = () => {
  const { message } = App.useApp();
  const { t } = useTranslation('common');
  const [collapsed, setCollapsed] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
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
      navigate('/login', { replace: true });
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
      message.success(t('layout.passwordChangeSuccess'));
      form.resetFields();
      setChangePasswordVisible(false);
      if (mustChangePassword) {
        // Issue #224: Delay redirect so the success toast is visible before navigating
        setTimeout(() => {
          logout();
          navigate('/login', { replace: true });
        }, 1500);
      }
    } catch (error: any) {
      const code = error.response?.data?.code;
      if (code === 2002) {
        message.error(t('layout.invalidCurrentPassword'));
      } else if (code === 2003) {
        message.error(t('layout.passwordMismatch'));
      } else if (code === 1015) {
        message.error(t('layout.passwordPolicy'));
      } else {
        message.error(error.response?.data?.message || t('layout.passwordChangeFail'));
      }
    } finally {
      setLoading(false);
    }
  };

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: user?.email || t('layout.userFallback') },
      { key: 'change-password', icon: <LockOutlined />, label: t('layout.changePassword'), onClick: () => setChangePasswordVisible(true) },
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: t('layout.logout'), onClick: handleLogout, danger: true },
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
        title={t('layout.changePassword')}
        open={changePasswordVisible}
        onCancel={() => !mustChangePassword && setChangePasswordVisible(false)}
        footer={null}
        destroyOnHidden
        closable={!mustChangePassword}
        maskClosable={!mustChangePassword}
        keyboard={!mustChangePassword}
      >
        <Form form={form} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item
            name="oldPassword"
            label={t('layout.currentPassword')}
            rules={[{ required: true, message: t('layout.passwordRequired') }]}
          >
            <Input.Password placeholder={t('layout.currentPasswordPlaceholder')} />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label={t('layout.newPassword')}
            rules={[
              { required: true, message: t('layout.passwordRequired') },
              { min: 8, message: t('layout.passwordMinLength') },
            ]}
          >
            <Input.Password placeholder={t('layout.newPasswordPlaceholder')} />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={t('layout.confirmPassword')}
            rules={[{ required: true, message: t('layout.confirmPasswordRequired') }]}
          >
            <Input.Password placeholder={t('layout.confirmPasswordPlaceholder')} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            {!mustChangePassword && (
              <Button onClick={() => setChangePasswordVisible(false)} style={{ marginRight: 8 }}>
                {t('layout.cancel')}
              </Button>
            )}
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('layout.saveChanges')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};
