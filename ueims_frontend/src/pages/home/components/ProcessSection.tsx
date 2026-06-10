import React from 'react';
import { steps } from '../constants';

export const ProcessSection = ({ isDark }: { isDark: boolean }) => (
  <section id="process" className={`py-20 md:py-28 px-6 md:px-12 relative z-10 border-b scroll-mt-20 transition-colors duration-300 ease-in-out ${isDark ? 'border-zinc-900' : 'border-slate-200'}`}>
    <div
      className="max-w-6xl mx-auto"
    >
      <div className="scroll-animate transition-all duration-700 ease-out text-center mb-16 md:mb-20">
        <span className="text-xs font-bold tracking-widest text-blue-500 uppercase">Quy Trình Hoạt Động</span>
        <h2 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold mt-3 mb-4 tracking-tight transition-colors duration-300 ease-in-out ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Bốn bước khép kín thông minh
        </h2>
        <p className={`text-sm sm:text-base max-w-xl mx-auto transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
          Vận hành đồng bộ nhịp nhàng giữa Nhà trường - Sinh viên - Doanh nghiệp.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((step, i) => (
          <div key={step.num} className={`scroll-animate transition-all duration-700 ease-out border rounded-xl p-6 relative overflow-hidden group transition-all duration-300 ease-in-out ${isDark ? 'bg-[#101524]/40 border-zinc-900' : 'bg-white border-slate-200 shadow-sm'}`}>
            {i < 3 && <div className={`hidden lg:block absolute top-[40%] right-[-16px] w-8 h-[1px] z-10 transition-colors duration-300 ease-in-out ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}></div>}
            <div className="text-3xl font-extrabold text-[#f37021]/40 group-hover:text-[#f37021]/70 mb-4 transition-colors">
              {step.num}
            </div>
            <h3 className={`text-sm font-bold mb-2 transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>{step.title}</h3>
            <p className={`text-xs leading-relaxed transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
