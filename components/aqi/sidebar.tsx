"use client";

import { useState, useEffect } from "react";
import { MapPin, Calendar, Thermometer, Droplets, Wind } from "lucide-react";
import { AQIData, getAQIColor } from "@/lib/aqi-data";
import { PollutantBar } from "./pollutant-bar";
import { CitySearch } from "./city-search";
import { HealthTipsCarousel } from "./health-tips-carousel";
import { AnimatedCard } from "./animated-card";

interface SidebarProps {
  data: AQIData;
  onCityChange: (city: string) => void;
}

export function Sidebar({ data, onCityChange }: SidebarProps) {
  const color = getAQIColor(data.aqi);
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  
  useEffect(() => {
    setMounted(true);
    setNow(new Date());
  }, []);
  
  return (
    <aside className="w-[280px] h-full glass-card border-r border-border p-5 flex flex-col gap-5 overflow-y-auto">
      {/* City Search */}
      <div className="animate-fade-in" style={{ animationDelay: "0ms" }}>
        <CitySearch currentCity={data.city} onCitySelect={onCityChange} />
      </div>
      
      {/* Location & Time */}
      <div className="space-y-3 animate-fade-in" style={{ animationDelay: "50ms" }}>
        <div className="flex items-center gap-2 text-foreground">
          <div className="p-1.5 rounded-lg bg-primary/20">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold">{data.city}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Calendar className="w-4 h-4" />
          <span>
            {mounted && now
              ? now.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })
              : "Loading..."}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Last updated: {mounted ? data.lastUpdated.toLocaleTimeString() : "--:--:--"}
        </div>
      </div>
      
      {/* Weather Info */}
      <div className="grid grid-cols-3 gap-2 animate-fade-in" style={{ animationDelay: "100ms" }}>
        {[
          { icon: Thermometer, label: "Temp", value: `${data.temperature}°C`, color: "text-orange-400", bg: "bg-orange-400/10" },
          { icon: Droplets, label: "Humidity", value: `${data.humidity}%`, color: "text-blue-400", bg: "bg-blue-400/10" },
          { icon: Wind, label: "Wind", value: `${data.windSpeed} km/h`, color: "text-cyan-400", bg: "bg-cyan-400/10" },
        ].map((item) => (
          <div 
            key={item.label}
            className="glass-card rounded-lg p-2 text-center hover:scale-105 transition-transform duration-200 cursor-default"
          >
            <div className={`w-8 h-8 mx-auto rounded-lg ${item.bg} flex items-center justify-center mb-1`}>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <span className="text-xs text-muted-foreground block">{item.label}</span>
            <span className="text-sm font-semibold text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
      
      {/* AQI Badge */}
      <div
        className="rounded-xl p-4 text-center transition-all duration-300 hover:scale-[1.02] animate-fade-in cursor-default"
        style={{
          animationDelay: "150ms",
          background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
          border: `1px solid ${color}30`,
          boxShadow: `0 0 30px ${color}10`,
        }}
      >
        <div 
          className="text-4xl font-bold transition-all duration-300"
          style={{ color, textShadow: `0 0 20px ${color}50` }}
        >
          {data.aqi}
        </div>
        <div className="text-sm font-medium mt-1" style={{ color }}>
          {data.category}
        </div>
        <div className="w-full h-1 rounded-full bg-secondary/50 mt-3 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: `${Math.min((data.aqi / 500) * 100, 100)}%`,
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}`,
            }}
          />
        </div>
      </div>
      
      {/* Health Advisory */}
      <div className="space-y-2 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Health Advisory
        </h3>
        <p className="text-sm text-foreground/80 leading-relaxed p-3 glass-card rounded-lg">
          {data.healthAdvisory}
        </p>
      </div>
      
      {/* Pollutants */}
      <div className="space-y-3 flex-1 animate-fade-in" style={{ animationDelay: "250ms" }}>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Pollutants
        </h3>
        <div className="space-y-4">
          {data.pollutants.map((pollutant, index) => (
            <PollutantBar
              key={pollutant.shortName}
              pollutant={pollutant}
              delay={300 + index * 100}
            />
          ))}
        </div>
      </div>
      
      {/* Health Tips */}
      <div className="animate-fade-in" style={{ animationDelay: "350ms" }}>
        <HealthTipsCarousel />
      </div>
    </aside>
  );
}
