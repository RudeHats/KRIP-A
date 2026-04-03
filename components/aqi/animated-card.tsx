"use client";

import { ReactNode, useState } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  glow?: string;
  onClick?: () => void;
}

export function AnimatedCard({
  children,
  className = "",
  delay = 0,
  hover = true,
  glow,
  onClick,
}: AnimatedCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hover) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };
  
  return (
    <div
      className={`
        glass-card rounded-2xl relative overflow-hidden
        transition-all duration-300 ease-out
        animate-fade-in
        ${hover ? "cursor-pointer" : ""}
        ${isHovered && hover ? "scale-[1.02] shadow-2xl" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "backwards",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      {/* Hover gradient spotlight */}
      {hover && isHovered && (
        <div
          className="absolute inset-0 opacity-30 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, ${glow || "rgba(59, 130, 246, 0.3)"} 0%, transparent 50%)`,
          }}
        />
      )}
      
      {/* Glow effect */}
      {glow && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-20"
          style={{
            boxShadow: `inset 0 0 30px ${glow}`,
          }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
