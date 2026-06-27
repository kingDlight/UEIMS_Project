import React, { useEffect, useRef } from 'react';

// ─── WebGL Fragment Shader (Aurora Drifting Blobs) ────────────────────────────
const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_texCoord;
  void main() {
    v_texCoord = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_dark; // 1.0 = dark, 0.0 = light

  varying vec2 v_texCoord;

  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 a0 = x - floor(x + 0.5);
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = v_texCoord;
    float time = u_time * 0.2;

    // Base: dark navy vs warm light
    vec3 color = mix(
      vec3(0.94, 0.94, 0.96),        // light base: #f0f0f5
      vec3(0.043, 0.047, 0.071),     // dark base: #0b0f12 (slightly deeper)
      u_dark
    );

    // Blob strength: more visible in both modes
    float blobStrengthDark  = 0.75;
    float blobStrengthLight = 0.18;
    float blobStrength = mix(blobStrengthLight, blobStrengthDark, u_dark);

    // Blob 1: Orange (#f37021) — top-left
    vec2 pos1 = vec2(0.12 + 0.10 * sin(time), 0.12 + 0.10 * cos(time * 0.9));
    float dist1 = length(uv - pos1);
    float blob1 = smoothstep(0.70, 0.0, dist1);
    color += blob1 * vec3(0.95, 0.44, 0.13) * blobStrength;

    // Blob 2: Blue (#00aeff) — bottom-right
    vec2 pos2 = vec2(0.88 + 0.09 * cos(time * 0.7), 0.85 + 0.09 * sin(time * 0.8));
    float dist2 = length(uv - pos2);
    float blob2 = smoothstep(0.70, 0.0, dist2);
    color += blob2 * vec3(0.0, 0.68, 1.0) * blobStrength;

    // Blob 3: Violet accent (#7c3aed) — center-roaming
    vec2 pos3 = vec2(0.5 + 0.20 * sin(time * 1.1), 0.5 + 0.20 * cos(time * 1.3));
    float dist3 = length(uv - pos3);
    float blob3 = smoothstep(0.45, 0.0, dist3);
    color += blob3 * vec3(0.48, 0.23, 0.93) * blobStrength * 0.55;

    // Subtle noise grain
    float noise = snoise(uv * 120.0 + time) * 0.018;
    color += noise;

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`;

// ─── WebGL Aurora Canvas ─────────────────────────────────────────────────────
const AuroraCanvas: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const progRef = useRef<WebGLProgram | null>(null);
  const uniformsRef = useRef<{ uTime: WebGLUniformLocation | null; uRes: WebGLUniformLocation | null; uMouse: WebGLUniformLocation | null; uDark: WebGLUniformLocation | null }>({ uTime: null, uRes: null, uMouse: null, uDark: null });
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const syncSize = () => {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncSize) : null;
    ro?.observe(canvas);
    syncSize();

    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;
    glRef.current = gl;

    const compileShader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    progRef.current = prog;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    uniformsRef.current = {
      uTime: gl.getUniformLocation(prog, 'u_time'),
      uRes: gl.getUniformLocation(prog, 'u_resolution'),
      uMouse: gl.getUniformLocation(prog, 'u_mouse'),
      uDark: gl.getUniformLocation(prog, 'u_dark'),
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        mouseRef.current = {
          x: (e.clientX - rect.left) / rect.width,
          y: 1.0 - (e.clientY - rect.top) / rect.height,
        };
      }
    };
    window.addEventListener('mousemove', onMouseMove);

    const render = (t: number) => {
      if (!gl || !prog) return;
      syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      const { uTime, uRes, uMouse, uDark } = uniformsRef.current;
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
      if (uDark) gl.uniform1f(uDark, isDark ? 1.0 : 0.0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      ro?.disconnect();
    };
  }, []);

  // Update isDark uniform live without re-initializing WebGL
  useEffect(() => {
    const gl = glRef.current;
    const { uDark } = uniformsRef.current;
    if (gl && uDark) {
      gl.uniform1f(uDark, isDark ? 1.0 : 0.0);
    }
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
};

// ─── Particle System ──────────────────────────────────────────────────────────
const Particles: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const PARTICLE_COUNT = 50;
    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = document.createElement('div');
      const size = Math.random() * 3 + 1;
      const left = Math.random() * 100;
      const duration = Math.random() * 15 + 10;
      const delay = Math.random() * 20;

      p.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        background: white;
        border-radius: 50%;
        opacity: 0;
        pointer-events: none;
        animation: ueims-rise-fade ${duration}s linear ${delay}s infinite;
      `;
      container.appendChild(p);
      particles.push(p);
    }

    return () => {
      particles.forEach(p => p.remove());
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

// ─── Main BackgroundEffects Component ────────────────────────────────────────
export const BackgroundEffects = ({ isDark }: { isDark: boolean }) => (
  <>
    {/* Global keyframe styles (injected once) */}
    <style>{`
      @keyframes ueims-rise-fade {
        0%   { transform: translateY(100vh); opacity: 0; }
        10%  { opacity: 0.6; }
        90%  { opacity: 0.6; }
        100% { transform: translateY(-10vh); opacity: 0; }
      }
      @keyframes ueims-spin-cw  { from { transform: rotate(0deg); }   to { transform: rotate(360deg); } }
      @keyframes ueims-spin-ccw { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
      @keyframes ueims-float {
        0%, 100% { transform: translateY(0) rotate(var(--rot, 0deg)); }
        50%       { transform: translateY(-18px) rotate(calc(var(--rot, 0deg) + 2deg)); }
      }
      @keyframes ueims-float-alt {
        0%, 100% { transform: translateY(0) rotate(var(--rot, 0deg)); }
        50%       { transform: translateY(-14px) rotate(calc(var(--rot, 0deg) - 2deg)); }
      }
      .ueims-ring-cw  { animation: ueims-spin-cw  40s linear infinite; }
      .ueims-ring-ccw { animation: ueims-spin-ccw 60s linear infinite; }
      .ueims-float    { animation: ueims-float     6s ease-in-out infinite; }
      .ueims-float-alt{ animation: ueims-float-alt 8s ease-in-out 2s infinite; }
    `}</style>

    {/* ── Root container: fixed, full screen, pointer-events: none ── */}
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">

      {/* 1. WebGL Aurora Shader (base layer) */}
      <AuroraCanvas isDark={isDark} />



      {/* 3a. Orbiting rings – Top Left */}
      <div className="absolute -top-64 -left-64 w-[800px] h-[800px] opacity-10 pointer-events-none">
        <div className="absolute inset-0 border border-white rounded-full ueims-ring-cw" />
        <div className={`absolute inset-8 border rounded-full ueims-ring-ccw ${isDark ? 'border-[#f37021]/50' : 'border-[#f37021]/30'}`} />
        <div className={`absolute inset-16 border rounded-full ueims-ring-cw ${isDark ? 'border-[#00aeff]/30' : 'border-[#00aeff]/20'}`} />
      </div>

      {/* 3b. Orbiting rings – Bottom Right */}
      <div className="absolute -bottom-96 -right-96 w-[1000px] h-[1000px] opacity-10 pointer-events-none">
        <div className="absolute inset-0 border border-white rounded-full ueims-ring-ccw" />
        <div className={`absolute inset-12 border rounded-full ueims-ring-cw ${isDark ? 'border-[#a97fff]/40' : 'border-[#a97fff]/20'}`} />
        <div className={`absolute inset-24 border rounded-full ueims-ring-ccw ${isDark ? 'border-[#8fcdff]/50' : 'border-[#8fcdff]/30'}`} />
      </div>

      {/* 4a. Glassmorphism panel – Top Right (orange glow) */}
      <div
        className={`ueims-float absolute top-28 right-28 w-64 h-80 rounded-2xl pointer-events-none
          backdrop-blur-xl border
          ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/30 border-white/50'}`}
        style={{
          '--rot': '12deg',
          boxShadow: `0 0 40px rgba(243, 112, 33, ${isDark ? '0.15' : '0.08'})`,
        } as React.CSSProperties}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />
      </div>

      {/* 4b. Glassmorphism panel – Bottom Left (blue glow) */}
      <div
        className={`ueims-float-alt absolute bottom-44 left-44 w-72 h-48 rounded-2xl pointer-events-none
          backdrop-blur-xl border
          ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/30 border-white/50'}`}
        style={{
          '--rot': '-8deg',
          boxShadow: `0 0 40px rgba(0, 174, 255, ${isDark ? '0.15' : '0.08'})`,
        } as React.CSSProperties}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-2xl" />
      </div>

      {/* 5. Particle system (floating white dots) */}
      <Particles />
    </div>
  </>
);
