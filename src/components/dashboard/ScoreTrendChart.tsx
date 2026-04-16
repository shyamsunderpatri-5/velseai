"use client";

import { motion } from "framer-motion";

interface ScoreHistoryEntry {
  score: number;
  date: string;
}

interface ScoreTrendChartProps {
  history: ScoreHistoryEntry[];
}

export function ScoreTrendChart({ history }: ScoreTrendChartProps) {
  // If no history, show empty state
  if (!history || history.length < 2) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mb-4">
          <span className="text-white/20 text-xs font-black italic">!</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Data Influx Pending</p>
        <p className="text-[9px] font-medium text-white/10 mt-1 max-w-[150px]">Perform multiple audits to visualize your intelligence growth.</p>
      </div>
    );
  }

  // Normalize data for SVG
  const padding = 20;
  const width = 300;
  const height = 120;
  const maxScore = 100;
  
  const points = history.map((entry, i) => {
    const x = padding + (i * (width - 2 * padding)) / (history.length - 1);
    const y = height - padding - (entry.score * (height - 2 * padding)) / maxScore;
    return { x, y };
  });

  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(" L ")}`;
  const areaD = `${pathD} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full drop-shadow-[0_0_15px_rgba(139,92,246,0.15)]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradientStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>

        {/* Shadow Area */}
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          d={areaD}
          fill="url(#gradientArea)"
        />

        {/* Main Line */}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          d={pathD}
          fill="none"
          stroke="url(#gradientStroke)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data Points */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#000"
            stroke={i === points.length - 1 ? "#fff" : "#8b5cf6"}
            strokeWidth="2"
          />
        ))}
      </svg>
      
      {/* Dynamic Overlay Metrics */}
      <div className="absolute top-2 right-4 text-right">
        <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Growth Velocity</div>
        <div className="text-lg font-black text-white tabular-nums tracking-tighter">
          +{Math.round(history[history.length-1].score - history[0].score)}%
        </div>
      </div>
    </div>
  );
}
