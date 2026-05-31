import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  UserOutlined, 
  LogoutOutlined,
  DashboardOutlined 
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout, danger: true },
    ],
  };

  // Mock Sidebar Items based on Role (will expand later)
  const sidebarItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard', onClick: () => navigate('/dashboard') },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 18, borderBottom: '1px solid #f0f0f0' }}>
          {collapsed ? 'UE' : 'UEIMS System'}
        </div>
        <Menu mode="inline" defaultSelectedKeys={['/dashboard']} items={sidebarItems} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 500 }}>{user?.fullName || 'User'}</span>
              <div style={{ background: '#1677ff', color: '#fff', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserOutlined />
              </div>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#fff', borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
