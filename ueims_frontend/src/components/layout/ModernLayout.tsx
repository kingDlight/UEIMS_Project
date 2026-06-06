import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Avatar, Modal, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { BellOutlined, DownOutlined } from '@ant-design/icons';
import { SmallPill } from '@/pages/training-manager/components/shared/SmallPill';
import { floatingNotifications } from '@/pages/training-manager/data';
import { useAuthStore } from '@/stores/useAuthStore';
import { AuthService } from '@/services/AuthService';
import { api } from '@/services/api';
import './ModernLayout.css';

export interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface ModernLayoutProps {
  navItems: NavItem[];
  children: React.ReactNode;
  defaultRoute?: string;
  basePath?: string; // e.g. "/app/tm-dashboard"
}

export const ModernLayout: React.FC<ModernLayoutProps> = ({ 
  navItems, 
  children,
  defaultRoute = 'dashboard',
  basePath = '/app/tm-dashboard'
}) => {
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationMenuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { tab } = useParams<{ tab: string }>();

  // Determine current active tab
  const activeTab = tab || defaultRoute;

  const { user, token, logout } = useAuthStore();
  const [realName, setRealName] = useState(user?.fullName || 'User');
  const [myProfile, setMyProfile] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (accountMenuRef.current && !accountMenuRef.current.contains(target)) setAccountOpen(false);
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(target)) setNotificationOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const res = await api.get('/users/myInfo');
        setMyProfile(res.data);
        if (res.data?.fullName) {
          setRealName(res.data.fullName);
        }
      } catch (e) {
        console.error('Failed to fetch myInfo', e);
      }
    };
    if (token) {
      fetchMyInfo();
    }
  }, [token]);

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

  const handleNavigate = (key: string) => {
    navigate(`${basePath}/${key}`);
  };

  return (
    <div className="modern-layout-wrapper">
      <div className="modern-layout-container">
        
        {/* Header Navbar */}
        <div className="modern-header-navbar">
          <div className="modern-header-content">
            <div className="modern-brand-logo">UEIMS</div>
            <div className="modern-nav-items">
              {/* Visible pills: first 7 items */}
              {navItems.slice(0, 7).map((item) => {
                const isActive = activeTab === item.key;
                return (
                  <div
                    key={item.key}
                    onClick={() => handleNavigate(item.key)}
                    className={`modern-nav-item ${isActive ? 'active' : 'inactive'}`}
                  >
                    <span style={{ fontSize: 14 }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                );
              })}

              {/* More dropdown: remaining items */}
              {navItems.length > 7 && (() => {
                const moreItems: MenuProps['items'] = navItems.slice(7).map((item) => ({
                  key: item.key,
                  label: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15 }}>{item.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                    </div>
                  ),
                  onClick: () => handleNavigate(item.key),
                }));

                const isMoreActive = navItems.slice(7).some((item) => activeTab === item.key);

                return (
                  <Dropdown menu={{ items: moreItems }} trigger={['click']} placement="bottomRight">
                    <div
                      className={`modern-nav-item ${isMoreActive ? 'active' : 'inactive'}`}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      <span style={{ fontSize: 14 }}><DownOutlined /></span>
                      <span>More</span>
                    </div>
                  </Dropdown>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Floating Bottom Bar */}
        <div className="modern-bottom-bar-wrapper">
          <div className="modern-bottom-bar">
            <div className="modern-bottom-bar-bg" />
            
            <div ref={notificationMenuRef} style={{ position: 'relative', zIndex: 1, flex: '0 0 auto' }}>
              <div 
                onClick={() => { setNotificationOpen((prev) => !prev); setAccountOpen(false); }} 
                className="modern-bell-icon-wrapper"
              >
                <BellOutlined style={{ fontSize: 18 }} />
                <div className="modern-bell-badge" />
              </div>
            </div>
            
            <div className="modern-bar-divider" />
            
            <div ref={accountMenuRef} style={{ position: 'relative', zIndex: 1, flex: '1 1 auto' }}>
              <div 
                onClick={() => { setAccountOpen((prev) => !prev); setNotificationOpen(false); }} 
                className="modern-account-wrapper"
              >
                <div className="modern-account-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: '#fff' }}>
                  {realName ? realName.substring(0, 2) : 'U'}
                </div>
                <div className="modern-account-info">
                  <div className="modern-account-name">{realName}</div>
                  <div className="modern-account-email">{user?.email || 'admin@ueims.com'}</div>
                </div>
              </div>
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(233,101,0,.18), transparent)', pointerEvents: 'none' }} />
          </div>

          {/* Notification Dropdown */}
          {notificationOpen && (
            <div onMouseDown={(e) => e.stopPropagation()} className="modern-floating-menu">
              <div className="modern-floating-menu-arrow" style={{ left: 32 }} />
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(233,101,0,.10)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>Alerts</div>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>Latest reminders and urgent items</div>
                </div>
                <SmallPill color="#E96500" glow>3 new</SmallPill>
              </div>
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {floatingNotifications.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 16, background: 'rgba(255,255,255,.78)', border: '1px solid rgba(233,101,0,.08)', boxShadow: '0 8px 18px rgba(15,23,42,.04)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.tone, boxShadow: `0 0 0 4px ${item.tone}20`, marginTop: 4 }} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: '#1e293b' }}>{item.title}</div>
                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>{item.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account Dropdown */}
          {accountOpen && (
            <div onMouseDown={(e) => e.stopPropagation()} className="modern-floating-menu">
              <div className="modern-floating-menu-arrow" style={{ left: 110 }} />
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(233,101,0,.10)' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {realName}
                </div>
                <div style={{ fontSize: 11.5, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email || 'admin@ueims.com'}
                </div>
              </div>
              <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['View Profile', 'Change Password', 'Logout'].map((item) => (
                  <div 
                    key={item} 
                    onClick={() => {
                      setAccountOpen(false);
                      if (item === 'Logout') handleLogout();
                      if (item === 'Change Password') navigate('/change-password');
                      if (item === 'View Profile') setProfileOpen(true);
                    }} 
                    className="modern-menu-item"
                    style={{ color: item === 'Logout' ? '#ef4444' : '#1e293b' }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Page Content */}
        <div>{children}</div>
      </div>

      {/* Profile Modal */}
      <Modal 
        open={profileOpen} 
        onCancel={() => setProfileOpen(false)} 
        footer={null} 
        closable={false}
        bodyStyle={{ padding: 0, borderRadius: 24, overflow: 'hidden' }}
        width={400}
        modalRender={(modal) => (
          <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 60px rgba(15,23,42,.12)' }}>
            {modal}
          </div>
        )}
      >
        <div style={{ background: 'linear-gradient(135deg, #E96500, #FF8A5A)', padding: '32px 24px 24px', position: 'relative', textAlign: 'center' }}>
          <div onClick={() => setProfileOpen(false)} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 12, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>✕</div>
          <div style={{ width: 80, height: 80, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '4px solid rgba(255,255,255,.3)', background: '#fff', color: '#E96500', fontSize: 32, fontWeight: 900, boxShadow: '0 8px 24px rgba(233,101,0,.3)' }}>
            {myProfile?.fullName ? myProfile.fullName.substring(0, 2).toUpperCase() : 'U'}
          </div>
          <div style={{ color: '#fff', fontSize: 20, fontWeight: 800, marginTop: 12 }}>{myProfile?.fullName || 'Đang tải...'}</div>
          <div style={{ color: 'rgba(255,255,255,.9)', fontSize: 13, fontWeight: 500, marginTop: 4 }}>{myProfile?.roles?.map((r: any) => r.roleName.replace('ROLE_', '')).join(', ') || 'User'}</div>
        </div>
        <div style={{ background: '#fff', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Email', value: myProfile?.email },
            { label: 'Số điện thoại', value: myProfile?.phone || 'Chưa cập nhật' },
            { label: 'Trạng thái', value: <span style={{ padding: '4px 10px', borderRadius: 8, background: myProfile?.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2', color: myProfile?.status === 'ACTIVE' ? '#10b981' : '#ef4444', fontWeight: 800, fontSize: 11 }}>{myProfile?.status}</span> },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: i === 2 ? 0 : 16, borderBottom: i === 2 ? 'none' : '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 700 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};
