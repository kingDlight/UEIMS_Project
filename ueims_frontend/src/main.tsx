import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { App as AntdApp } from 'antd'
import './index.css'
import AppComponent from './App.tsx'
import './i18n/config';
import { initDeviceId } from './utils/device'
if (!localStorage.getItem('i18nextLng')) {
  localStorage.setItem('i18nextLng', 'en');
}

initDeviceId();

createRoot(document.getElementById('root')!).render(
  <Suspense fallback={<div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
    <AntdApp>
      <AppComponent />
    </AntdApp>
  </Suspense>,
)
