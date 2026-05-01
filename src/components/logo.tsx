import React from "react";

export const Logo = ({ className = "h-20 w-20" }: { className?: string }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-sky-500/10 blur-3xl rounded-full scale-150 pointer-events-none" />
      
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src="/logo.png"
          alt="StudyOS Logo"
          className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all hover:scale-105 duration-500"
        />
      </div>
      
      {/* Decorative Brand Bars */}
      <div className="flex gap-1.5 mt-6 mb-2">
        <div className="h-1.5 w-10 bg-[#A855F7] rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
        <div className="h-1.5 w-10 bg-[#6366F1] rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
        <div className="h-1.5 w-10 bg-[#3B82F6] rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        <div className="h-1.5 w-10 bg-[#00E5FF] rounded-full shadow-[0_0_15px_rgba(0,229,255,0.5)]" />
      </div>
    </div>
  );
};
