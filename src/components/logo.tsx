import React from "react";

export const Logo = ({ className = "h-12 w-12", showText = false }: { className?: string, showText?: boolean }) => {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 200 200"
        className="h-full w-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        
        {/* Top Arrow Part of S */}
        <path
          d="M60 60 C60 40, 140 40, 140 60 L140 75 L160 55 L140 35 L140 50 C140 30, 50 30, 50 60 C50 80, 100 85, 100 100"
          fill="url(#logo-gradient)"
        />
        
        {/* Bottom Arrow Part of S */}
        <path
          d="M140 140 C140 160, 60 160, 60 140 L60 125 L40 145 L60 165 L60 150 C60 170, 150 170, 150 140 C150 120, 100 115, 100 100"
          fill="url(#logo-gradient)"
        />
        
        {/* Face Profile + Graduation Cap */}
        <g transform="translate(75, 70) scale(0.5)">
          {/* Cap */}
          <path d="M20 50 L100 20 L180 50 L100 80 Z" fill="url(#logo-gradient)" />
          {/* Head Silhouette */}
          <path 
            d="M100 85 C80 85, 65 100, 65 125 C65 150, 80 165, 100 165 L115 165 L115 145 L130 145 L130 125 C130 100, 120 85, 100 85 Z" 
            fill="url(#logo-gradient)" 
          />
        </g>
      </svg>
      
      {showText && (
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Study<span className="text-[#3B82F6]">OS</span>
          </h1>
          <p className="text-xs text-zinc-400 font-medium tracking-wide mt-1">
            Transformando conhecimento em conquistas
          </p>
          {/* Color Palette visualization */}
          <div className="flex gap-1 mt-4 h-1.5">
            <div className="w-8 bg-[#A855F7] rounded-full" />
            <div className="w-8 bg-[#6366F1] rounded-full" />
            <div className="w-8 bg-[#3B82F6] rounded-full" />
            <div className="w-8 bg-[#00E5FF] rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
};
