import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

const { Title } = Typography;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const onFinish = (values: any) => {
    // TODO: Gọi API đăng nhập ở đây
    // Mock dữ liệu tạm thời để test UI
    if (values.email === 'admin@ueims.edu' && values.password === '123456') {
      login(
        { id: '1', email: values.email, fullName: 'System Admin', roles: ['ADMIN'] },
        'mock-jwt-token-123456',
        'ADMIN'
      );
      message.success('Đăng nhập thành công!');
      navigate('/app/dashboard');
    } else {
      message.error('Sai email hoặc mật khẩu!');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, color: '#1677ff' }}>UEIMS</Title>
          <span style={{ color: '#8c8c8c' }}>University-Enterprise Internship</span>
        </div>

        <Form name="login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập Email!' }]}> 
            <Input prefix={<UserOutlined />} placeholder="Email đăng nhập" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}> 
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>Đăng nhập</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
