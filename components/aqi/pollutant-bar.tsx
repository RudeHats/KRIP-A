"use client";

import { useEffect, useState } from "react";
import { PollutantData, getPollutantColor } from "@/lib/aqi-data";
import { Wind, Flame, Cloud, Droplets, Atom, Info } from "lucide-react";

interface PollutantBarProps {
  pollutant: PollutantData;
  delay: number;
}

const iconMap: Record<string, React.ReactNode> = {
  particles: <Droplets className="w-4 h-4" />,
  dust: <Wind className="w-4 h-4" />,
  molecule: <Atom className="w-4 h-4" />,
  ozone: <Cloud className="w-4 h-4" />,
  smoke: <Flame className="w-4 h-4" />,
};

const descriptionMap: Record<string, string> = {
  "PM2.5": "Fine particulate matter that can penetrate deep into lungs",
  "PM10": "Coarse particles from dust, pollen, and mold",
  "NO₂": "Nitrogen dioxide from vehicle emissions and power plants",
  "O₃": "Ground-level ozone formed by chemical reactions",
  "CO": "Carbon monoxide from incomplete combustion",
};

export function PollutantBar({ pollutant, delay }: PollutantBarProps) {
  const [width, setWidth] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const color = getPollutantColor(pollutant.value, pollutant.maxSafe);
  const percentage = Math.min((pollutant.value / pollutant.maxSafe) * 100, 150);
  const isOverLimit = pollutant.value > pollutant.maxSafe;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(Math.min(percentage, 100));
    }, delay);
    
    return () => clearTimeout(timer);
  }, [percentage, delay]);
  
  return (
    <div 
      className="space-y-2 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowTooltip(false);
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-md transition-all duration-300 ${
              isHovered ? "scale-110" : ""
            }`}
            style={{ backgroundColor: `${color}20` }}
          >
            <span style={{ color }}>{iconMap[pollutant.icon]}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-foreground">
              {pollutant.shortName}
            </span>
            {/* Info tooltip trigger */}
            <div className="relative">
              <button
                onClick={() => setShowTooltip(!showTooltip)}
                className="p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Info className="w-3 h-3 text-muted-foreground" />
              </button>
              {showTooltip && (
                <div 
                  className="absolute left-0 top-full mt-1 w-48 p-2 glass-card rounded-lg text-xs text-muted-foreground z-50 animate-fade-in shadow-lg"
                >
                  {descriptionMap[pollutant.shortName]}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span 
            className={`text-sm font-mono transition-all duration-300 ${
              isHovered ? "font-bold" : ""
            }`}
            style={{ color: isOverLimit ? color : undefined }}
          >
            {pollutant.value}
          </span>
          <span className="text-xs text-muted-foreground">
            {pollutant.unit}
          </span>
          {isOverLimit && (
            <span 
              className="text-[10px] px-1.5 py-0.5 rounded font-semibold animate-pulse"
              style={{ backgroundColor: `${color}20`, color }}
            >
              HIGH
            </span>
          )}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="relative">
        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
          {/* Background track with markers */}
          <div className="absolute inset-0 flex">
            <div className="flex-1 border-r border-secondary/30" />
            <div className="flex-1 border-r border-secondary/30" />
            <div className="flex-1 border-r border-secondary/30" />
            <div className="flex-1" />
          </div>
          
          {/* Progress fill */}
          <div
            className="h-full rounded-full relative transition-all ease-out"
            style={{
              width: `${width}%`,
              backgroundColor: color,
              boxShadow: `0 0 12px ${color}60`,
              transitionDuration: "1000ms",
              transitionDelay: `${delay}ms`,
            }}
          >
            {/* Animated shimmer on hover */}
            {isHovered && (
              <div 
                className="absolute inset-0 rounded-full animate-shimmer"
                style={{
                  background: `linear-gradient(90deg, transparent, ${color}80, transparent)`,
                  backgroundSize: "200% 100%",
                }}
              />
            )}
          </div>
        </div>
        
        {/* Safe limit marker */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-muted-foreground/50"
          style={{ left: `${Math.min((100 / percentage) * 100, 100)}%` }}
        />
      </div>
      
      {/* Scale labels */}
      <div className="flex justify-between text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        <span>0</span>
        <span className="text-center" style={{ color: isOverLimit ? color : undefined }}>
          Safe: {pollutant.maxSafe} {pollutant.unit}
        </span>
        <span>{Math.round(pollutant.maxSafe * 1.5)}</span>
      </div>
    </div>
  );
}
