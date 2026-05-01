import React from "react";
import Image from "next/image";

export const Logo = ({ className = "h-20 w-20" }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Subtle Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-blue-500/20 to-cyan-400/20 blur-2xl rounded-full" />
      
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src="/logo.png"
          alt="StudyOS Logo"
          className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-transform hover:scale-105 duration-300"
        />
      </div>
    </div>
  );
};
