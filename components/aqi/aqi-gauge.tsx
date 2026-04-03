"use client";

import { useEffect, useState } from "react";
import { getAQIColor, getAQICategory } from "@/lib/aqi-data";

interface AQIGaugeProps {
  value: number;
  maxValue?: number;
}

export function AQIGauge({ value, maxValue = 500 }: AQIGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [strokeOffset, setStrokeOffset] = useState(628);
  const [isHovered, setIsHovered] = useState(false);
  
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const color = getAQIColor(value);
  const category = getAQICategory(value);
  
  useEffect(() => {
    // Animate the number counter with easing
    const duration = 1500;
    const startTime = Date.now();
    
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      
      setAnimatedValue(Math.round(easedProgress * value));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
    
    // Animate the stroke
    const targetOffset = circumference - (value / maxValue) * circumference;
    setTimeout(() => {
      setStrokeOffset(targetOffset);
    }, 100);
  }, [value, maxValue, circumference]);
  
  // Calculate tick marks for the gauge
  const tickMarks = [];
  for (let i = 0; i <= 10; i++) {
    const angle = (i / 10) * 360 - 90;
    const x1 = 120 + (radius + 5) * Math.cos((angle * Math.PI) / 180);
    const y1 = 120 + (radius + 5) * Math.sin((angle * Math.PI) / 180);
    const x2 = 120 + (radius + 12) * Math.cos((angle * Math.PI) / 180);
    const y2 = 120 + (radius + 12) * Math.sin((angle * Math.PI) / 180);
    tickMarks.push({ x1, y1, x2, y2, major: i % 5 === 0 });
  }
  
  return (
    <div 
      className="relative flex items-center justify-center cursor-pointer transition-transform duration-300"
      style={{ transform: isHovered ? "scale(1.02)" : "scale(1)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer glow ring - animated */}
      <div
        className="absolute w-[280px] h-[280px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}${isHovered ? "60" : "40"} 0%, transparent 70%)`,
          animation: "pulse-glow 2s ease-in-out infinite",
          transition: "all 0.3s ease",
        }}
      />
      
      {/* Secondary glow ring */}
      <div
        className="absolute w-[300px] h-[300px] rounded-full opacity-30"
        style={{
          background: `conic-gradient(from 0deg, ${color}00, ${color}40, ${color}00)`,
          animation: "spin 8s linear infinite",
        }}
      />
      
      {/* SVG Gauge */}
      <svg
        width="240"
        height="240"
        viewBox="0 0 240 240"
        className="transform -rotate-90"
      >
        <defs>
          {/* Gradient for the progress arc */}
          <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="50%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.8" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Drop shadow */}
          <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor={color} floodOpacity="0.6"/>
          </filter>
        </defs>
        
        {/* Background circle with subtle pattern */}
        <circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke="rgba(148, 163, 184, 0.08)"
          strokeWidth="20"
        />
        
        {/* Tick marks */}
        {tickMarks.map((tick, i) => (
          <line
            key={i}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke="rgba(148, 163, 184, 0.3)"
            strokeWidth={tick.major ? 2 : 1}
            className="origin-center"
            style={{ transform: "rotate(90deg)", transformOrigin: "120px 120px" }}
          />
        ))}
        
        {/* Progress circle with glow */}
        <circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeOffset}
          filter="url(#dropShadow)"
          style={{
            transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        
        {/* Inner decorative circles */}
        <circle
          cx="120"
          cy="120"
          r={radius - 25}
          fill="none"
          stroke={color}
          strokeWidth="1"
          opacity="0.2"
          strokeDasharray="4 8"
        />
        
        <circle
          cx="120"
          cy="120"
          r={radius - 35}
          fill="none"
          stroke="rgba(148, 163, 184, 0.1)"
          strokeWidth="1"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        {/* Main value */}
        <div className="relative">
          <span
            className="text-6xl font-bold tracking-tight transition-all duration-300"
            style={{ 
              color,
              textShadow: `0 0 30px ${color}60`,
              transform: isHovered ? "scale(1.05)" : "scale(1)",
            }}
          >
            {animatedValue}
          </span>
        </div>
        
        {/* Label */}
        <span className="text-sm text-muted-foreground mt-1 uppercase tracking-widest">
          AQI
        </span>
        
        {/* Category badge */}
        <span
          className="text-base font-semibold mt-3 px-4 py-1.5 rounded-full transition-all duration-300"
          style={{
            backgroundColor: `${color}20`,
            color,
            boxShadow: isHovered ? `0 0 20px ${color}40` : "none",
          }}
        >
          {category}
        </span>
      </div>
    </div>
  );
}
