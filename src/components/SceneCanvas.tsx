"use client";
import { useEffect, useRef } from "react";
import { SCENES } from "@/scenes";

/** One full-screen canvas. Plays the scene for the current archive; freezes on one frame when motion is off. */
export default function SceneCanvas({ scene, still }: { scene: string; still: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const live = useRef({ scene, still });
  useEffect(() => {
    live.current = { scene, still };
  }, [scene, still]);

  useEffect(() => {
    const cv = ref.current!;
    const cx = cv.getContext("2d")!;
    const rm = matchMedia("(prefers-reduced-motion: reduce)");
    let W = 0, H = 0, raf = 0, drawn = "";
    const size = () => {
      W = cv.width = innerWidth;
      H = cv.height = innerHeight;
      drawn = "";
    };
    size();
    addEventListener("resize", size);
    const loop = (ts: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      const { scene, still } = live.current;
      const frozen = still || rm.matches;
      const key = scene + W + "x" + H + getComputedStyle(document.documentElement).getPropertyValue("--accent");
      if (frozen && drawn === key) return;
      const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#e0a458";
      const dens = W < 700 ? 0.55 : 1; // cap particles on small devices
      cx.clearRect(0, 0, W, H);
      (SCENES[scene] ?? SCENES.base)(cx, frozen ? 3 : ts / 1000, W, H, accent, dens);
      drawn = frozen ? key : "";
      cv.dataset.scene = scene;
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", size);
    };
  }, []);

  return <canvas id="bgc" ref={ref} aria-hidden="true" />;
}
