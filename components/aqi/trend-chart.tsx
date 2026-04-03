"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { TrendDataPoint, getAQIColor } from "@/lib/aqi-data";

interface TrendChartProps {
  data: TrendDataPoint[];
  currentAqi: number;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const color = getAQIColor(value);
    
    return (
      <div className="glass-card rounded-lg p-3 border border-border">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-lg font-bold" style={{ color }}>
          AQI: {value}
        </p>
      </div>
    );
  }
  return null;
}

export function TrendChart({ data, currentAqi }: TrendChartProps) {
  const [isAnimated, setIsAnimated] = useState(false);
  const color = getAQIColor(currentAqi);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.5} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            interval="preserveStartEnd"
            tickFormatter={(value) => {
              const parts = value.split(":");
              return `${parts[0]}${value.includes("AM") ? "a" : "p"}`;
            }}
          />
          
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            domain={[0, 300]}
            ticks={[0, 100, 200, 300]}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Area
            type="monotone"
            dataKey="aqi"
            stroke={color}
            strokeWidth={2}
            fill="url(#aqiGradient)"
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${color}60)`,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
