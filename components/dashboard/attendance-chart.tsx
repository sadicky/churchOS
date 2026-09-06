"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Sparkles } from "lucide-react";
import type { AttendancePoint } from "@/services/dashboard.service";

interface AttendanceChartProps {
  data: AttendancePoint[];
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  if (!data || data.length === 0) {
    return null;
  }

  const maxAttendees = Math.max(...data.map((d) => d.total), 50);
  const minAttendees = Math.max(0, Math.min(...data.map((d) => d.total)) - 20);

  // SVG dimensions
  const svgWidth = 500;
  const svgHeight = 160;
  const paddingX = 30;
  const paddingY = 20;

  const widthAvailable = svgWidth - paddingX * 2;
  const heightAvailable = svgHeight - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * widthAvailable;
    const y =
      svgHeight -
      paddingY -
      ((d.total - minAttendees) / (maxAttendees - minAttendees || 1)) *
        heightAvailable;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;

  return (
    <Card className="p-5 border-border/50 bg-card/60 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/40">
        <div>
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            Fréquentation des Cultes
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Évolution de l&apos;affluence lors des derniers cultes dominicaux
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-brand-600" /> Culte Principal
          </span>
        </div>
      </div>

      <div className="pt-4">
        <div className="relative w-full h-[180px]">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area fill */}
            <path d={areaD} fill="url(#attendanceGradient)" />

            {/* Line */}
            <path
              d={pathD}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points */}
            {points.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIndex === i ? "6" : "4"}
                  className="fill-background stroke-primary stroke-[2.5] transition-all cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            ))}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <div
              className="absolute z-20 pointer-events-none rounded-md bg-popover/95 border border-border px-3 py-1.5 shadow-xl text-xs text-popover-foreground transform -translate-x-1/2 -translate-y-full mb-2 animate-fade-in"
              style={{
                left: `${(points[hoveredIndex].x / svgWidth) * 100}%`,
                top: `${(points[hoveredIndex].y / svgHeight) * 100}%`,
              }}
            >
              <p className="font-bold text-foreground">
                {points[hoveredIndex].data.total} participants
              </p>
              <div className="flex gap-2 text-[10px] text-muted-foreground mt-0.5">
                <span>Hommes: {points[hoveredIndex].data.men}</span>
                <span>Femmes: {points[hoveredIndex].data.women}</span>
                <span>Enfants: {points[hoveredIndex].data.children}</span>
              </div>
            </div>
          )}
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between items-center px-4 mt-2 text-[11px] text-muted-foreground">
          {data.map((d) => (
            <span key={d.date} className="truncate text-center">
              {d.date}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
