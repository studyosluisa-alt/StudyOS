import React from "react";

export const Logo = ({ className = "h-12 w-12", showText = false }: { className?: string, showText?: boolean }) => {
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <svg
        viewBox="0 0 200 200"
        className="h-full w-auto drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="60%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        
        {/* Superior Arrow (S part) */}
        <path
          d="M50 70 C50 35, 150 35, 150 70 L150 85 L180 60 L150 35 L150 50 C150 20, 40 20, 40 70 C40 95, 100 100, 100 120"
          fill="url(#brand-gradient)"
        />
        
        {/* Inferior Arrow (S part) */}
        <path
          d="M150 130 C150 165, 50 165, 50 130 L50 115 L20 140 L50 165 L50 150 C50 180, 160 180, 160 130 C160 105, 100 100, 100 80"
          fill="url(#brand-gradient)"
        />
        
        {/* Face Silhouette + Cap */}
        <g transform="translate(65, 65) scale(0.7)">
          <path d="M10 40 L50 10 L90 40 L50 70 Z" fill="url(#brand-gradient)" />
          <path 
            d="M50 75 C35 75, 25 85, 25 105 C25 125, 35 140, 50 140 L65 140 L65 125 L75 125 L75 105 C75 85, 65 75, 50 75 Z" 
            fill="url(#brand-gradient)" 
          />
        </g>
      </svg>
      
      {showText && (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1">
            <span className="text-5xl font-bold text-white tracking-tighter">Study</span>
            <span className="text-5xl font-bold text-[#3B82F6] tracking-tighter">OS</span>
          </div>
          <p className="text-base text-zinc-400 font-medium tracking-tight mt-2 text-center max-w-[280px]">
            Transformando conhecimento em conquistas
          </p>
          <div className="flex gap-1.5 mt-6">
            <div className="h-2 w-10 bg-[#A855F7] rounded-full" />
            <div className="h-2 w-10 bg-[#6366F1] rounded-full" />
            <div className="h-2 w-10 bg-[#3B82F6] rounded-full" />
            <div className="h-2 w-10 bg-[#00E5FF] rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
};
