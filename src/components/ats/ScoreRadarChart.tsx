"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RadarDataset {
  label: string;
  scores: Record<string, number>;
  color: string; // Tailwind-like color or hex e.g. "rgb(124, 58, 237)"
}

interface ScoreRadarChartProps {
  /** Single dataset for simple mode */
  scores?: Record<string, number>;
  /** Multiple datasets for comparison mode */
  datasets?: RadarDataset[];
  size?: number;
  className?: string;
  showLabels?: boolean;
}

// Convert polar → cartesian
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

// Build SVG polygon points string from array of {x,y}
function pts(points: { x: number; y: number }[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

export function ScoreRadarChart({
  scores,
  datasets: inputDatasets,
  size = 280,
  className,
  showLabels = true,
}: ScoreRadarChartProps) {
  // Normalize datasets
  const datasets: RadarDataset[] = inputDatasets 
    ? inputDatasets 
    : scores 
      ? [{ label: "Current", scores, color: "124, 58, 237" }] // Default violet
      : [];

  if (datasets.length === 0) return null;

  // Use the first dataset to define axes
  const keys = Object.keys(datasets[0].scores);
  const n = keys.length;
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.35; // max radius
  const labelR = size * 0.45; // label ring

  // Grid rings: 25%, 50%, 75%, 100%
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
        >
          {/* ── Grid rings ── */}
          {rings.map((pct, ri) => {
            const ringR = R * pct;
            const ringPoints = Array.from({ length: n }).map((_, i) =>
              polar(cx, cy, ringR, (360 / n) * i)
            );
            return (
              <polygon
                key={ri}
                points={pts(ringPoints)}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={1}
              />
            );
          })}

          {/* ── Axis spokes ── */}
          {Array.from({ length: n }).map((_, i) => {
            const angleDeg = (360 / n) * i;
            const sp = polar(cx, cy, R, angleDeg);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={sp.x}
                y2={sp.y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />
            );
          })}

          {/* ── Multiple Polygons ── */}
          {datasets.map((ds, dIndex) => {
            const values = keys.map((k) => Math.min(100, Math.max(0, ds.scores[k] ?? 0)));
            const dataPoints = values.map((v, i) => {
              const angleDeg = (360 / n) * i;
              return polar(cx, cy, (v / 100) * R, angleDeg);
            });

            return (
              <motion.polygon
                key={ds.label}
                points={pts(dataPoints)}
                fill={`rgba(${ds.color}, ${datasets.length > 1 ? 0.15 : 0.2})`}
                stroke={`rgb(${ds.color})`}
                strokeWidth={2}
                strokeLinejoin="round"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: dIndex * 0.1 }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              />
            );
          })}

          {/* ── Labels ── */}
          {showLabels && keys.map((key, i) => {
            const angleDeg = (360 / n) * i;
            const lp = polar(cx, cy, labelR, angleDeg);
            const anchor =
              Math.abs(angleDeg % 360 - 180) < 10 ? "middle" :
              angleDeg % 360 > 180 ? "end" : 
              angleDeg % 360 === 0 ? "middle" : "start";

            return (
              <text
                key={key}
                x={lp.x}
                y={lp.y + 4}
                textAnchor={anchor}
                fontSize={8}
                fontWeight={900}
                fill="rgba(255,255,255,0.3)"
                className="uppercase tracking-[0.2em]"
              >
                {key}
              </text>
            );
          })}
        </svg>
      </div>

      {/* ── Comparison Legend ── */}
      <div className="flex flex-wrap justify-center gap-4">
        {datasets.map((ds) => {
          const avg = Object.values(ds.scores).reduce((a, b) => a + b, 0) / n;
          return (
            <div key={ds.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: `rgb(${ds.color})`, boxShadow: `0 0 8px rgb(${ds.color})` }} 
              />
              <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">{ds.label}</span>
              <span className="text-[10px] font-black text-white">{Math.round(avg)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
