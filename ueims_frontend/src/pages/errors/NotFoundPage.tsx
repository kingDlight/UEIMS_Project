import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Result } from 'antd';
import { HomeOutlined, ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('common');

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        padding: 24,
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background blobs */}
      <div
        style={{
          position: 'absolute',
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #ffedd5 0%, transparent 70%)',
          top: -120,
          right: -120,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #fed7aa 0%, transparent 70%)',
          bottom: -100,
          left: -100,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          background: '#fff',
          padding: '56px 48px',
          borderRadius: 24,
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          textAlign: 'center',
          maxWidth: 520,
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: '#fff7ed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            border: '1px solid #ffedd5',
          }}
        >
          <SearchOutlined style={{ fontSize: 44, color: '#ea580c' }} />
        </div>

        {/* Big 404 number */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            lineHeight: 1,
            color: '#ea580c',
            letterSpacing: -4,
            marginBottom: 8,
            fontFamily: 'Inter, sans-serif',
            background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </div>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: 12,
          }}
        >
          {t('notFound.title', 'Page Not Found')}
        </h1>

        <p
          style={{
            fontSize: 15,
            color: '#64748b',
            lineHeight: 1.6,
            marginBottom: 8,
          }}
        >
          {t('notFound.description', "The page you're looking for doesn't exist or has been moved.")}
        </p>

        {location.pathname && (
          <div
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 13,
              color: '#475569',
              fontFamily: 'monospace',
              marginBottom: 32,
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={location.pathname}
          >
            {location.pathname}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            type="primary"
            size="large"
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
            style={{
              background: '#ea580c',
              borderColor: '#ea580c',
              fontWeight: 600,
              height: 44,
              borderRadius: 12,
              minWidth: 140,
            }}
          >
            {t('notFound.backHome', 'Back to Home')}
          </Button>
          <Button
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{
              fontWeight: 600,
              height: 44,
              borderRadius: 12,
              borderColor: '#cbd5e1',
              color: '#475569',
              minWidth: 140,
            }}
          >
            {t('notFound.goBack', 'Go Back')}
          </Button>
        </div>
      </div>
    </div>
  );
};
