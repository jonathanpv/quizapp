'use client';

import React from 'react';
import { Level } from '../lib/constants';
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
        <div id="ui-layer" className="fixed inset-0 pointer-events-none flex flex-col justify-between box-border">
            {/* Header: Progress Bar only */}
            <div className="header-container relative top-0 left-0 w-full flex flex-col items-center pt-8 pb-4 px-6">
                <div className="progress-container relative w-full max-w-[280px]">
                    {/* Progress Bar with Outline and Video Game Style */}
                    <div className="progress-bg h-6 w-full bg-gray-100 rounded-full overflow-hidden border-4 border-gray-200">
                        <div 
                            id="progress-bar" 
                            className="h-full rounded-full transition-all duration-500 ease-in-out relative"
                            style={{ 
                                width: `${isComplete ? 100 : progress}%`, 
                                backgroundColor: level.theme,
                                backgroundImage: `linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)`,
                                backgroundSize: '20px 20px'
                            }}
                        >
                            {/* Animated stripes effect */}
                            <div className="absolute inset-0 animate-stripes opacity-30" />
                        </div>
                    </div>
                </div>
            </div>
            
            {!isComplete && (
                <div id="q-text" className="absolute top-[160px] left-0 w-full text-center text-2xl px-8 font-extrabold transition-opacity duration-300 pointer-events-none" style={{ color: level.theme }}>
                    {level.prompt}
                </div>
            )}

            {/* Action Area with more bottom padding */}
            <div className="action-area pointer-events-auto flex justify-center w-full mt-auto mb-10 px-6 pb-[env(safe-area-inset-bottom,20px)]">
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
                @keyframes stripes {
                    from { background-position: 0 0; }
                    to { background-position: 40px 0; }
                }
                .animate-shimmer {
                    animation: shimmer 2.5s infinite ease-in-out;
                }
                .animate-stripes {
                    background-image: linear-gradient(45deg, rgba(255,255,255,0.4) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.4) 75%, transparent 75%, transparent);
                    background-size: 40px 40px;
                    animation: stripes 2s linear infinite;
                }
            `}</style>
        </div>
    );
}
