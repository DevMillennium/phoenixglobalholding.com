"use client";

import { useEffect, useRef } from "react";

/**
 * Lluvia Matrix a pantalla completa (detrás del contenido), ligada al scroll.
 */
export function MatrixCanvasGlobal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = el.getContext("2d", { alpha: true });
    if (!ctx) return;

    const glyphs =
      "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾇﾈﾉﾊﾋﾌﾍﾎﾏ0123456789ＡＢＣＤＥＦ<>{}[];//const let";

    let width = 0;
    let height = 0;
    let dpr = 1;
    let columns = 0;
    const fontSize = 14;
    let drops: number[] = [];
    let rafId = 0;

    function mod(n: number, m: number) {
      return ((n % m) + m) % m;
    }

    function resize() {
      const node = el;
      const c = ctx;
      if (!node || !c) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      node.width = Math.floor(width * dpr);
      node.height = Math.floor(height * dpr);
      node.style.width = `${width}px`;
      node.style.height = `${height}px`;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.ceil(width / fontSize);
      drops = new Array(columns).fill(0).map(() => Math.random() * -80);
    }

    function frame() {
      if (reduced) return;
      const c = ctx;
      if (!c) return;
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;

      c.fillStyle = "rgba(2, 8, 6, 0.09)";
      c.fillRect(0, 0, width, height);
      c.font = `${fontSize}px ui-monospace, monospace`;

      const docHeight = Math.max(
        document.documentElement.scrollHeight || height,
        height,
      );
      const scrollRatio = docHeight > height ? scrollY / (docHeight - height) : 0;
      const scrollShift = scrollY * 0.22 + scrollRatio * height * 0.15;

      for (let i = 0; i < columns; i++) {
        const x = i * fontSize;
        const rawY = (drops[i] ?? 0) * fontSize + scrollShift;
        const y = mod(rawY, height + fontSize * 4) - fontSize * 2;
        const char = glyphs[(Math.random() * glyphs.length) | 0];
        const head = mod(rawY, height) < fontSize * 3;
        c.fillStyle = head
          ? "rgba(200, 255, 220, 0.9)"
          : "rgba(0, 255, 90, 0.5)";
        c.fillText(char, x, y);
        if (y > height + fontSize * 2 && Math.random() > 0.978) {
          drops[i] = 0;
        }
        drops[i] = (drops[i] ?? 0) + 0.48 + Math.random() * 0.32;
      }
      rafId = requestAnimationFrame(frame);
    }

    function start() {
      cancelAnimationFrame(rafId);
      resize();
      if (!el) return;
      if (reduced) {
        el.classList.add("matrix-canvas-global--static");
        return;
      }
      el.classList.remove("matrix-canvas-global--static");
      rafId = requestAnimationFrame(frame);
    }

    start();
    window.addEventListener("resize", start, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", start);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 mix-blend-screen opacity-[0.22]"
      width={400}
      height={800}
      aria-hidden
    />
  );
}
