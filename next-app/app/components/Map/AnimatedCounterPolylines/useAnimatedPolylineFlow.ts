"use client";

import { useEffect, useRef } from "react";
import { Polyline } from "leaflet";

export interface PolylineAnimationConfig {
  polyline: Polyline;
  speed: number;        // pixels per frame
  direction: 1 | -1;    // 1 = forward, -1 = reverse
  dashLength: number;   // px
  dashSpacing: number;  // px
  color: string;
  weight: number;
  opacity: number;
}

export function useAnimatedPolylineFlow(
  configs: PolylineAnimationConfig[]
) {
  const frameRef = useRef<number | null>(null);
  const offsetsRef = useRef(new WeakMap<Polyline, number>());

  useEffect(() => {
    if (!configs.length) return;

    configs.forEach(({ polyline, dashLength, dashSpacing, color, weight, opacity }) => {
      polyline.setStyle({
        dashArray: `${dashLength}, ${dashSpacing}`,
        color: color,
        weight: weight,
        opacity: opacity,
      });
    });

    const animate = () => {
      configs.forEach(
        ({ polyline, speed, direction }) => {
          const current = offsetsRef.current.get(polyline) ?? 0;
          const next = current + speed * direction;

          polyline.setStyle({
            dashOffset: `${next}px`,
          });

          offsetsRef.current.set(polyline, next);
        }
      );

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [configs]);
}
