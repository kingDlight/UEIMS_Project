import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from 'antd'
import './index.css'
import AppComponent from './App.tsx'
import { initDeviceId } from './utils/device'

initDeviceId();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App>
      <AppComponent />
    </App>
  </StrictMode>,
)
