"use client";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
}: SkeletonProps) {
  const baseClasses = "animate-shimmer bg-secondary/50";
  
  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };
  
  const style: React.CSSProperties = {
    width: width || "100%",
    height: height || (variant === "text" ? "1em" : "100%"),
  };
  
  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Pre-built skeleton components for common dashboard elements
export function GaugeSkeleton() {
  return (
    <div className="flex flex-col items-center p-6">
      <Skeleton variant="circular" width={200} height={200} />
      <div className="mt-6 flex gap-4">
        <Skeleton width={60} height={50} className="rounded-lg" />
        <Skeleton width={60} height={50} className="rounded-lg" />
        <Skeleton width={60} height={50} className="rounded-lg" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="p-6">
      <Skeleton width={150} height={20} className="mb-4" />
      <div className="flex items-end gap-1 h-[200px]">
        {Array.from({ length: 24 }).map((_, i) => (
          <Skeleton
            key={i}
            width="100%"
            height={`${30 + Math.random() * 70}%`}
            className="flex-1"
          />
        ))}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-4">
      <Skeleton width={40} height={14} className="mb-2" />
      <Skeleton width={60} height={32} className="mb-1" />
      <Skeleton width={30} height={12} />
    </div>
  );
}
