import React from 'react';
import { c } from '../constants';
import { AreaChart } from '../components/charts/AreaChart';
import { NeuSurface } from '../components/shared/NeuSurface';
import { SmallPill } from '../components/shared/SmallPill';

export const StatsTab: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    <NeuSurface style={{ padding: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: c.text, margin: 0 }}>Stats & Charts</h2>
      <p style={{ fontSize: 14, color: c.textMuted, marginTop: 6 }}>Visual reporting for interview outcomes, major allocation, and internship grading</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 18 }}>
        <div style={{ padding: 18, borderRadius: 18, background: '#fff', border: '1px solid rgba(226,232,240,.9)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: c.text }}>Pie Chart</div>
              <div style={{ fontSize: 12, color: c.textMuted, marginTop: 4 }}>Interview Pass / Fail</div>
            </div>
            <SmallPill color={c.primary}>68% pass</SmallPill>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 18 }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: `conic-gradient(${c.success} 0 68%, ${c.danger} 68% 100%)`, boxShadow: 'inset 0 0 0 18px #fff' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: c.success }} /><span>Pass: 68%</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: c.danger }} /><span>Fail: 32%</span></div>
            </div>
          </div>
        </div>
        <div style={{ padding: 18, borderRadius: 18, background: '#fff', border: '1px solid rgba(226,232,240,.9)' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: c.text }}>Bar Chart</div>
          <div style={{ fontSize: 12, color: c.textMuted, marginTop: 4 }}>Students by major across companies</div>
          <div style={{ display: 'flex', alignItems: 'end', gap: 12, height: 160, marginTop: 18 }}>
            {[{ label: 'SE', value: 82, color: c.primary }, { label: 'IA', value: 58, color: c.info }, { label: 'CE', value: 46, color: c.warning }, { label: 'AI', value: 41, color: c.success }].map((bar) => (
              <div key={bar.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'end', alignItems: 'center', gap: 8 }}>
                <div style={{ width: '100%', maxWidth: 48, height: `${bar.value}%`, borderRadius: '14px 14px 8px 8px', background: bar.color, boxShadow: `0 10px 20px ${bar.color}30` }} />
                <div style={{ fontSize: 12, color: c.textMuted, fontWeight: 700 }}>{bar.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: 18, borderRadius: 18, background: '#fff', border: '1px solid rgba(226,232,240,.9)' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: c.text }}>Line Chart</div>
          <div style={{ fontSize: 12, color: c.textMuted, marginTop: 4 }}>Internship grade distribution</div>
          <div style={{ height: 180, marginTop: 18 }}><AreaChart data={[6, 12, 18, 27, 35, 30, 19, 11, 5]} color={c.purple} /></div>
        </div>
      </div>
    </NeuSurface>
  </div>
);
