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
        viewBox="0 0 200 180"
        className="w-full h-auto drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="brand-grad-ultra" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        
        {/* Superior Arrow - Thick and Structured */}
        <path
          d="M45 75 C45 35, 155 35, 155 75 L155 95 L185 65 L155 35 L155 55 C155 20, 35 20, 35 75 C35 100, 100 105, 100 125"
          fill="url(#brand-grad-ultra)"
        />
        
        {/* Inferior Arrow - Thick and Structured */}
        <path
          d="M155 105 C155 145, 45 145, 45 105 L45 85 L15 115 L45 145 L45 125 C45 160, 165 160, 165 105 C165 80, 100 75, 100 55"
          fill="url(#brand-grad-ultra)"
        />
        
        {/* Detailed Face + Graduation Cap Profile */}
        <g transform="translate(62, 55) scale(0.75)">
          {/* Cap Diamond */}
          <path d="M10 40 L50 10 L90 40 L50 70 Z" fill="url(#brand-grad-ultra)" />
          {/* Cap Tassel */}
          <path d="M25 35 V55" stroke="url(#brand-grad-ultra)" strokeWidth="3" />
          {/* Human Profile */}
          <path 
            d="M50 75 C35 75, 25 85, 25 105 C25 125, 30 135, 45 140 L65 140 L65 125 L75 125 L75 105 C75 85, 65 75, 50 75 Z" 
            fill="url(#brand-grad-ultra)" 
          />
        </g>
      </svg>
      
      <div className="flex items-center gap-1 mt-4">
        <span className="text-4xl font-extrabold text-white tracking-tighter">Study</span>
        <span className="text-4xl font-extrabold text-[#3B82F6] tracking-tighter">OS</span>
      </div>

      {variant === "full" && (
        <>
          <p className="text-xs text-zinc-400 font-semibold tracking-tight mt-1 text-center">
            Transformando conhecimento em conquistas
          </p>
          <div className="flex gap-2 mt-6">
            <div className="h-2 w-12 bg-[#A855F7] rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
            <div className="h-2 w-12 bg-[#6366F1] rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            <div className="h-2 w-12 bg-[#3B82F6] rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            <div className="h-2 w-12 bg-[#00E5FF] rounded-full shadow-[0_0_15px_rgba(0,229,255,0.5)]" />
          </div>
        </>
      )}
    </div>
  );
};
