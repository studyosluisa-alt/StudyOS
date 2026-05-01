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
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        
        {/* Stylized S */}
        <path
          d="M150 50 C150 20, 50 20, 50 50 C50 70, 150 80, 150 110 C150 140, 50 140, 50 110"
          stroke="url(#logo-gradient)"
          strokeWidth="20"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Graduation Cap inside */}
        <path
          d="M80 85 L100 75 L120 85 L100 95 Z"
          fill="url(#logo-gradient)"
        />
        <path
          d="M85 88 V95 C85 95, 100 100, 115 95 V88"
          stroke="url(#logo-gradient)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M115 85 V95"
          stroke="url(#logo-gradient)"
          strokeWidth="2"
        />
      </svg>
      
      {showText && (
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Study<span className="text-sky-400">OS</span>
          </h1>
          <p className="text-sm text-zinc-400 font-medium tracking-wide">
            Sua jornada de estudos começa aqui
          </p>
        </div>
      )}
    </div>
  );
};
