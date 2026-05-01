import React from "react";
import Image from "next/image";

export const Logo = ({ className = "h-12 w-12", showText = false }: { className?: string, showText?: boolean }) => {
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src="/logo.png"
          alt="StudyOS Logo"
          className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]"
        />
      </div>
      
      {showText && (
        <div className="flex flex-col items-center">
          <div className="flex gap-1.5 mt-2">
            <div className="h-2 w-10 bg-[#A855F7] rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
            <div className="h-2 w-10 bg-[#6366F1] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.4)]" />
            <div className="h-2 w-10 bg-[#3B82F6] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
            <div className="h-2 w-10 bg-[#00E5FF] rounded-full shadow-[0_0_10px_rgba(0,229,255,0.4)]" />
          </div>
        </div>
      )}
    </div>
  );
};
