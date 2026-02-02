import React from 'react';
import { cn } from '@/lib/utils';

interface RingProgressProps {
    size?: number;
    thickness?: number;
    value: number;
    label?: React.ReactNode;
    color?: string; // Hex or Tailwind class (but Tailwind class hard with inline stroke) -> Assume Hex for now or use Map
    className?: string;
}

export function RingProgress({
    size = 120,
    thickness = 12,
    value,
    label,
    color = '#228be6', // Mantine blue default
    className
}: RingProgressProps) {
    const radius = (size - thickness) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={thickness}
                    fill="transparent"
                    className="text-gray-200 dark:text-gray-800"
                    stroke="currentColor"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={thickness}
                    fill="transparent"
                    stroke={color}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-300 ease-in-out"
                />
            </svg>
            {label && <div className="absolute inset-0 flex items-center justify-center">{label}</div>}
        </div>
    );
}
