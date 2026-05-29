import React from 'react';
import { Button, Layout, Typography, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ArrowRightOutlined, SearchOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title } = Typography;

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <Header style={{ 
        position: 'absolute', 
        zIndex: 10, 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'transparent', 
        padding: '0 60px',
        borderBottom: 'none',
        height: 100
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: '50%', 
            background: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#F26F21', 
            fontWeight: 900, 
            fontSize: 28 
          }}>
            e
          </div>
          <span style={{ color: 'white', fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>
            FPT University <br/> UEIMS
          </span>
        </div>

        {/* Navigation */}
        <Space size={40} style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }}>About ▾</a>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Work ▾</a>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Get Involved ▾</a>
        </Space>

        {/* Actions */}
        <Space size="middle">
          <Button type="default" ghost shape="round" style={{ borderColor: 'rgba(255,255,255,0.6)', color: 'white', height: 46, padding: '0 24px', fontWeight: 600 }}>
            Contact
          </Button>
          <Button 
            type="primary" 
            shape="round" 
            style={{ background: '#F26F21', borderColor: '#F26F21', height: 46, padding: '0 24px', fontWeight: 600 }}
            onClick={() => navigate('/login')}
          >
            Đăng nhập hệ thống
          </Button>
          <Button shape="circle" icon={<SearchOutlined />} style={{ height: 46, width: 46, border: 'none', color: '#000', fontWeight: 'bold' }} />
        </Space>
      </Header>

      {/* Hero Section */}
      <Content style={{ 
        height: '100vh',
        backgroundImage: 'linear-gradient(rgba(0, 32, 96, 0.4), rgba(0, 32, 96, 0.8)), url("https://daihoc.fpt.edu.vn/wp-content/uploads/2021/12/fpt-hcm.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        padding: '0 80px'
      }}>
        <div style={{ maxWidth: 900, marginTop: 80 }}>
          <Title style={{ 
            color: 'white', 
            fontSize: 84, 
            fontWeight: 800, 
            lineHeight: 1.05,
            marginBottom: 40,
            fontFamily: 'serif'
          }}>
            Kỳ thực tập xuất sắc là nền tảng <span style={{ color: '#F26F21' }}>cho sự nghiệp vững chắc.</span>
          </Title>
          
          <Button 
            size="large" 
            shape="round" 
            onClick={() => navigate('/login')}
            style={{ 
              height: 64, 
              padding: '6px 32px 6px 8px', 
              fontSize: 18, 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              border: 'none',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ 
              background: '#F26F21', 
              borderRadius: '50%', 
              width: 48, 
              height: 48, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white'
            }}>
              <ArrowRightOutlined />
            </div>
            Khám phá UEIMS
          </Button>
        </div>
      </Content>
    </Layout>
  );
};
