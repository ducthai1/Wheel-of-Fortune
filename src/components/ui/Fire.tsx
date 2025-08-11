'use client'
import React, { useRef, useEffect, useState } from 'react';

interface Rocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
  ttl: number;
  age: number;
	delayExplosion: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  age: number;
  size: number;
  hue: number;
}

export default function FireworksButton() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    const rockets: Rocket[] = [];
    const particles: Particle[] = [];

    const rand = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    // Tăng gravity để rút ngắn thời gian bay (nhanh hơn)
    // Lưu ý: gravity tính theo "pixels per frame^2" trước khi scale theo dt
    const gravity = 0.18;

    /**
     * createRocket:
     * - fromX, fromY: điểm xuất phát (mép dưới chính giữa)
     * - angleOffset: góc lệch, dùng để tính vx
     * - power: scale cho tốc độ
     * - customVx/customVy: override nếu cần
     *
     * Logic:
     *  - chọn targetY sao cho không quá 1/3 màn hình (tức apex >= 2/3 * height)
     *  - tính vy0 dựa trên công thức vy0 = -sqrt(2 * g * dy) => đảm bảo bay lên
     */
    function createRocket(
      fromX: number,
      fromY: number,
      angleOffset = -Math.PI / 2,
      power = 1,
      customVx?: number,
      customVy?: number
    ) {
      // Đặt apex nằm trong khoảng [2/3, 0.85] * height -> không vượt quá 1/3 màn hình từ trên
      const targetY = rand(height * 0.36, height * 0.55);

      // dy = khoảng cách (dương) từ fromY xuống targetY
      const dy = Math.max(10, fromY - targetY);

      // Công thức vật lý: vy0 = -sqrt(2 * g * dy) (âm vì đi lên)
      const baseVy = -Math.sqrt(2 * gravity * dy);

      const vy = customVy ?? baseVy * rand(0.92, 1.08) * power;
      const vx =
        customVx ??
        Math.cos(angleOffset) * rand(0.8, 3.2) * (0.9 + Math.random() * 0.3) * power;

      rockets.push({
        x: fromX,
        y: fromY,
        vx,
        vy,
        size: rand(2, 3.5),
        hue: Math.floor(rand(0, 360)),
        ttl: rand(600, 1400), // backup TTL ngắn hơn (bay nhanh nên TTL nhỏ)
        age: 0,
				delayExplosion: Math.random() < 0.15 ? 0 : rand(200, 500), // 50% nổ chậm
      });
    }

    function explode(x: number, y: number, hue: number) {
      // Nhiều particle hơn để nhìn hoành tráng
      const count = 100 + Math.round(rand(-20, 30));
      for (let i = 0; i < count; i++) {
        const speed = rand(2.2, 6.5);
        const angle = (Math.PI * 2 * i) / count + rand(-0.1, 0.1);
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: rand(700, 1400),
          age: 0,
          size: rand(1, 3),
          hue: (hue + rand(-50, 50) + 360) % 360,
        });
      }
    }

    function update(dt: number) {
      // dt in ms; chuẩn hoá theo ~60fps frame (16.6667ms)
      const step = dt / 16.6667;

      for (let i = rockets.length - 1; i >= 0; i--) {
				const r = rockets[i];
				r.vy += gravity * step;
				r.x += r.vx * step;
				r.y += r.vy * step;
				r.age += dt;

				// Điều kiện nổ
				if (r.vy >= 0) {
					if (r.delayExplosion > 0) {
						r.delayExplosion -= dt;
						if (r.delayExplosion <= 0) {
							explode(r.x, r.y, r.hue);
							rockets.splice(i, 1);
						}
					} else {
						explode(r.x, r.y, r.hue);
						rockets.splice(i, 1);
					}
				} else if (r.age > r.ttl) {
					explode(r.x, r.y, r.hue);
					rockets.splice(i, 1);
				}
			}


      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += 0.03 * step;
        p.vx *= Math.pow(0.998, step);
        p.vy *= Math.pow(0.998, step);
        p.x += p.vx * step;
        p.y += p.vy * step;
        p.age += dt;
        if (p.age > p.life) particles.splice(i, 1);
      }
    }

    function draw() {
      // nền mờ để tạo trail nhẹ
      ctx.fillStyle = 'rgba(5, 6, 13, 0.28)';
      ctx.fillRect(0, 0, width, height);

      for (const r of rockets) {
        ctx.beginPath();
        ctx.fillStyle = `hsl(${r.hue}, 85%, 60%)`;
        ctx.arc(r.x, r.y, r.size, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const p of particles) {
        const lifeRatio = 1 - p.age / p.life;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${0.9 * lifeRatio})`;
        ctx.arc(p.x, p.y, Math.max(0.8, p.size * lifeRatio), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const onCreate = (e: Event) => {
      const custom = e as CustomEvent<{
        fromX: number;
        fromY: number;
        angleOffset?: number;
        power?: number;
        vx?: number;
        vy?: number;
      }>;
      if (custom?.detail?.fromX != null && custom?.detail?.fromY != null) {
        createRocket(
          custom.detail.fromX,
          custom.detail.fromY,
          custom.detail.angleOffset ?? -Math.PI / 2,
          custom.detail.power ?? 1,
          custom.detail.vx,
          custom.detail.vy
        );
      }
    };

    window.addEventListener('createRocket', onCreate);

    let last = performance.now();
    function loop(t: number) {
      const dt = t - last;
      last = t;
      update(dt);
      draw();
      animRef.current = requestAnimationFrame(loop);
    }

    ctx.fillStyle = '#05060d';
    ctx.fillRect(0, 0, width, height);
    animRef.current = requestAnimationFrame(loop);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('createRocket', onCreate);
    };
  }, []);

  function fire() {
    const canvas = canvasRef.current!;
    const startX = canvas.width / 2; // chính giữa ngang
    const startY = canvas.height; // sát mép dưới (vẫn thấy)

    // số lượng rocket
    const totalRockets = 55;

    for (let i = 0; i < totalRockets; i++) {
      // ±1 rad để tỏa rộng
      const angle = rand(-Math.PI / 2 - 1.0, -Math.PI / 2 + 1.0);
      // power khác nhau để có chút biến thiên (vẫn bay nhanh do gravity lớn)
      const power = rand(0.95, 1.18);

      const ev = new CustomEvent('createRocket', {
        detail: { fromX: startX, fromY: startY, angleOffset: angle, power },
      });
      window.dispatchEvent(ev);
    }

    setRunning(true);
    // timeout hơi ngắn vì bay nhanh
    setTimeout(() => setRunning(false), 1800);
  }

  // helper local (type-safe duplicate)
  function rand(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  return (
    <div className="fixed inset-0 pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute left-1/2 -translate-x-1/2 bottom-10 pointer-events-auto">
        <button
          onClick={fire}
          disabled={running}
          className={`px-6 py-3 rounded-full shadow-lg font-semibold transition-transform active:scale-95 ${
            running
              ? 'opacity-60'
              : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
          }`}
        >
          Bắn pháo hoa
        </button>
      </div>
      <div
        style={{ position: 'fixed', bottom: 14, left: 14 }}
        className="pointer-events-auto text-sm text-white/70"
      >
        Nhấn nút để bắn pháo 🎆
      </div>
    </div>
  );
}
