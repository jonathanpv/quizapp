'use client';

import React from 'react';
import { Level, THEMES } from '../lib/constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface QuizUIProps {
    level: Level;
    currentLvlIndex: number;
    totalLevels: number;
    isComplete: boolean;
    checkActive: boolean;
    onCheck: () => void;
}

export default function QuizUI({
    level,
    currentLvlIndex,
    totalLevels,
    isComplete,
    checkActive,
    onCheck
}: QuizUIProps) {
    const progress = (currentLvlIndex / totalLevels) * 100;

    return (
        <div id="ui-layer" className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 box-border">
            <div className="header-container absolute top-5 left-0 w-full flex flex-col items-center gap-1.5">
                <div className="progress-bg h-3.5 w-full max-w-[220px] bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div 
                        id="progress-bar" 
                        className="h-full rounded-full transition-all duration-500 ease-in-out"
                        style={{ width: `${isComplete ? 100 : progress}%`, backgroundColor: level.theme }}
                    />
                </div>
                <div className="level-text text-gray-400 font-black text-lg tracking-tighter lowercase">
                    lvl <span id="lvl-num">{currentLvlIndex + 1}</span>
                </div>
            </div>
            
            {!isComplete && (
                <div id="q-text" className="absolute top-[90px] left-0 w-full text-center text-2xl font-extrabold transition-opacity duration-300 pointer-events-none" style={{ color: level.theme }}>
                    {level.prompt}
                </div>
            )}

            <div className="action-area pointer-events-auto flex justify-center mb-2.5 w-full mt-auto">
                <button 
                    id="check-btn" 
                    onClick={onCheck}
                    className={cn(
                        "relative overflow-hidden w-full max-w-[340px] h-16 rounded-3xl font-black text-2xl tracking-tight border-none cursor-pointer transition-all duration-150 ease-out",
                        checkActive || isComplete 
                            ? "active translate-y-[-2px] text-white" 
                            : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-[0_6px_0_#e5e7eb]",
                        (isComplete) && "bg-cyan-400 shadow-[0_6px_0_#06b6d499,0_10px_20px_#06b6d444]"
                    )}
                    style={checkActive && !isComplete ? { 
                        backgroundColor: level.theme,
                        boxShadow: `0 6px 0 ${level.theme}99, 0 10px 20px ${level.theme}44`
                    } : {}}
                >
                    {isComplete ? "try again" : "check"}
                    
                    {/* Shimmer Effect */}
                    {(checkActive || isComplete) && (
                        <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] animate-shimmer" />
                    )}
                </button>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% { left: -100%; }
                    15% { left: 200%; }
                    100% { left: 200%; }
                }
                .animate-shimmer {
                    animation: shimmer 2.5s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
}
