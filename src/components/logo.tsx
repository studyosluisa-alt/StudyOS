import React from "react";

export const Logo = ({ 
  className = "h-24 w-auto", 
  variant = "full" 
}: { 
  className?: string, 
  variant?: "full" | "compact" 
}) => {
  return (
    <img
      src="/logo.png"
      alt="StudyOS"
      className={`object-contain ${className}`}
    />
  );
};
