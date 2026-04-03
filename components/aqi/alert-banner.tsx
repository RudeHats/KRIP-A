"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X, Shield, Skull } from "lucide-react";
import { getAQIColor } from "@/lib/aqi-data";

interface AlertBannerProps {
  aqi: number;
  onDismiss: () => void;
}

export function AlertBanner({ aqi, onDismiss }: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const color = getAQIColor(aqi);
  
  useEffect(() => {
    if (aqi > 150) {
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [aqi]);
  
  const handleDismiss = () => {
    setIsDismissing(true);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };
  
  if (aqi <= 150 || !isVisible) return null;
  
  const getSeverityInfo = () => {
    if (aqi > 300) return { 
      message: "Hazardous air quality! Stay indoors immediately.",
      icon: Skull,
      level: "CRITICAL"
    };
    if (aqi > 200) return { 
      message: "Very unhealthy air quality. Avoid all outdoor activities.",
      icon: Shield,
      level: "SEVERE"
    };
    return { 
      message: "Unhealthy air quality. Limit outdoor exposure.",
      icon: AlertTriangle,
      level: "WARNING"
    };
  };
  
  const severity = getSeverityInfo();
  const Icon = severity.icon;
  
  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full mx-auto px-4 transition-all duration-300 ${
        isDismissing 
          ? "opacity-0 -translate-y-4" 
          : "opacity-100 translate-y-0 animate-slide-down"
      }`}
    >
      <div
        className="glass-card rounded-xl p-4 flex items-center gap-3 relative overflow-hidden"
        style={{
          borderColor: `${color}60`,
          borderWidth: "1px",
          boxShadow: `0 0 30px ${color}40, inset 0 0 30px ${color}10`,
        }}
      >
        {/* Animated gradient border effect */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
            animation: "shimmer 2s infinite",
          }}
        />
        
        {/* Pulsing glow */}
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none animate-pulse"
          style={{
            boxShadow: `inset 0 0 20px ${color}20`,
          }}
        />
        
        {/* Icon with animation */}
        <div
          className="p-2.5 rounded-lg relative"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon 
            className="w-5 h-5 animate-pulse" 
            style={{ color }} 
          />
          {/* Icon glow */}
          <div 
            className="absolute inset-0 rounded-lg animate-pulse-glow"
            style={{ backgroundColor: color, opacity: 0.3 }}
          />
        </div>
        
        <div className="flex-1 relative z-10">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-foreground">Air Quality Alert</p>
            <span 
              className="text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse"
              style={{ backgroundColor: `${color}30`, color }}
            >
              {severity.level}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {severity.message}
          </p>
        </div>
        
        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-lg hover:bg-secondary transition-all duration-200 hover:scale-110 active:scale-95 relative z-10"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
