import React from "react";

export const Logo = ({ 
  className = "h-12 w-12", 
  variant = "full" 
}: { 
  className?: string, 
  variant?: "full" | "compact" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 200 160"
        className="w-full h-auto drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="brand-grad-final" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        
        {/* S Arrows Geometry */}
        <path
          d="M60 50 C60 30, 140 30, 140 50 L140 65 L170 40 L140 15 L140 30 C140 10, 40 10, 40 50 C40 75, 100 80, 100 100"
          fill="url(#brand-grad-final)"
        />
        <path
          d="M140 110 C140 130, 60 130, 60 110 L60 95 L30 120 L60 145 L60 130 C60 150, 160 150, 160 110 C160 85, 100 80, 100 60"
          fill="url(#brand-grad-final)"
        />
        
        {/* Face + Cap Profile */}
        <g transform="translate(68, 45) scale(0.65)">
          <path d="M10 40 L50 10 L90 40 L50 70 Z" fill="url(#brand-grad-final)" />
          <path 
            d="M50 75 C35 75, 25 85, 25 105 C25 125, 35 140, 50 140 L65 140 L65 125 L75 125 L75 105 C75 85, 65 75, 50 75 Z" 
            fill="url(#brand-grad-final)" 
          />
        </g>
      </svg>
      
      <div className="flex items-center gap-1 mt-2">
        <span className="text-3xl font-bold text-white tracking-tight">Study</span>
        <span className="text-3xl font-bold text-[#3B82F6] tracking-tight">OS</span>
      </div>

      {variant === "full" && (
        <>
          <p className="text-[10px] text-zinc-400 font-medium tracking-normal mt-1 text-center whitespace-nowrap">
            Transformando conhecimento em conquistas
          </p>
          <div className="flex gap-1 mt-4">
            <div className="h-1.5 w-8 bg-[#A855F7] rounded-full shadow-[0_0_10px_rgba(168,85,247,0.3)]" />
            <div className="h-1.5 w-8 bg-[#6366F1] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)]" />
            <div className="h-1.5 w-8 bg-[#3B82F6] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
            <div className="h-1.5 w-8 bg-[#00E5FF] rounded-full shadow-[0_0_10px_rgba(0,229,255,0.3)]" />
          </div>
        </>
      )}
    </div>
  );
};
