"use client";

import { useState, useRef, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void | Promise<void>;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: "default" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
}

export function AnimatedButton({
  children,
  onClick,
  className = "",
  disabled = false,
  loading = false,
  variant = "default",
  size = "md",
}: AnimatedButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    // Create ripple effect
    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      
      setRipples((prev) => [...prev, { x, y, id }]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    }
    
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    
    if (onClick) {
      await onClick();
    }
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };
  
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "hover:bg-secondary text-foreground",
    glass: "glass-card hover:bg-secondary/80 text-foreground",
  };
  
  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden rounded-lg font-medium
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${isPressed ? "scale-95" : "scale-100 hover:scale-[1.02]"}
        ${className}
      `}
    >
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-[ripple_0.6s_ease-out]"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 10,
            height: 10,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
      
      {/* Content */}
      <span className={`flex items-center justify-center gap-2 ${loading ? "opacity-0" : ""}`}>
        {children}
      </span>
      
      {/* Loading spinner */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
        </span>
      )}
    </button>
  );
}
