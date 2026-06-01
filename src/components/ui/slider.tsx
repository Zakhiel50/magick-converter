import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value: number[];
  min: number;
  max: number;
  step?: number;
  onValueChange: (value: number[]) => void;
  className?: string;
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onValueChange,
  className,
}: SliderProps) {
  const val = value[0];
  const percentage = ((val - min) / (max - min)) * 100;

  return (
    <div className={cn("relative w-full h-10 flex items-center group", className)}>
      {/* Track Background */}
      <div className="absolute w-full h-2 bg-slate-200 rounded-full" />
      
      {/* Active Track (Indicator) */}
      <div 
        className="absolute h-2 bg-indigo-600 rounded-full"
        style={{ width: `${percentage}%` }}
      />
      
      {/* Hidden Range Input for functionality */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={val}
        onChange={(e) => onValueChange([parseInt(e.target.value)])}
        className="absolute w-full h-10 opacity-0 cursor-pointer z-30"
      />
      
      {/* Visual Thumb */}
      <div 
        className="absolute size-6 bg-white border-2 border-indigo-600 rounded-full shadow-lg transition-transform pointer-events-none z-20"
        style={{ 
          left: `calc(${percentage}% - 12px)`
        }}
      />
    </div>
  )
}
