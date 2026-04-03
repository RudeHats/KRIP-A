"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, Home, Activity, Droplets, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { healthTips } from "@/lib/aqi-data";

const iconMap: Record<string, React.ReactNode> = {
  mask: <Shield className="w-5 h-5" />,
  home: <Home className="w-5 h-5" />,
  activity: <Activity className="w-5 h-5" />,
  droplets: <Droplets className="w-5 h-5" />,
  heart: <Heart className="w-5 h-5" />,
};

export function HealthTipsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isPaused, setIsPaused] = useState(false);
  
  const goToSlide = useCallback((index: number, dir: "left" | "right" = "right") => {
    if (isTransitioning) return;
    setDirection(dir);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning]);
  
  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % healthTips.length, "right");
  }, [currentIndex, goToSlide]);
  
  const prevSlide = useCallback(() => {
    goToSlide((currentIndex - 1 + healthTips.length) % healthTips.length, "left");
  }, [currentIndex, goToSlide]);
  
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);
  
  const currentTip = healthTips[currentIndex];
  
  return (
    <div 
      className="glass-card rounded-xl p-4 relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Health Tips
        </h3>
        
        {/* Navigation arrows - visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={prevSlide}
            className="p-1 rounded hover:bg-secondary transition-colors"
            disabled={isTransitioning}
          >
            <ChevronLeft className="w-3 h-3 text-muted-foreground" />
          </button>
          <button
            onClick={nextSlide}
            className="p-1 rounded hover:bg-secondary transition-colors"
            disabled={isTransitioning}
          >
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      </div>
      
      {/* Tip content */}
      <div className="relative overflow-hidden">
        <div
          className={`flex items-start gap-3 transition-all duration-300 ${
            isTransitioning 
              ? direction === "right" 
                ? "opacity-0 -translate-x-4" 
                : "opacity-0 translate-x-4"
              : "opacity-100 translate-x-0"
          }`}
        >
          <div className="p-2 rounded-lg bg-primary/20 text-primary shrink-0 transition-transform duration-300 hover:scale-110">
            {iconMap[currentTip.icon]}
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {currentTip.tip}
          </p>
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="flex justify-center gap-1.5 mt-4">
        {healthTips.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index, index > currentIndex ? "right" : "left")}
            className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
            style={{ 
              width: index === currentIndex ? "24px" : "6px",
              backgroundColor: index === currentIndex ? "transparent" : "rgba(148, 163, 184, 0.3)",
            }}
          >
            {index === currentIndex && (
              <>
                <div className="absolute inset-0 bg-muted-foreground/30 rounded-full" />
                <div 
                  className="absolute inset-0 bg-primary rounded-full origin-left"
                  style={{
                    animation: isPaused ? "none" : "progress 5s linear forwards",
                    animationPlayState: isPaused ? "paused" : "running",
                  }}
                />
              </>
            )}
          </button>
        ))}
      </div>
      
      {/* Progress animation keyframes */}
      <style jsx>{`
        @keyframes progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
