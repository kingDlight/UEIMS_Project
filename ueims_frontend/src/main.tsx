import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { App as AntdApp } from 'antd'
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
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
