'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Pill, Particle, drawRoundedStar, easeOutQuart } from '../lib/quiz-engine';
import { Level, VISUAL_CONSTANTS, SIZES, THEMES } from '../lib/constants';

const { FONT_SIZE, LINE_HEIGHT, PILL_HEIGHT, PILL_RADIUS } = VISUAL_CONSTANTS;

interface CanvasQuizProps {
    level: Level;
    isComplete: boolean;
    totalMistakes: number;
    onCheckActive: (active: boolean) => void;
    onCorrect: (x: number, y: number) => void;
    onIncorrect: () => void;
    checkPressed: number; // Increment this to trigger check
    onReset: () => void;
}

export default function CanvasQuiz({
    level,
    isComplete,
    totalMistakes,
    onCheckActive,
    onCorrect,
    onIncorrect,
    checkPressed,
    onReset
}: CanvasQuizProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stateRef = useRef<{
        pills: Pill[];
        particles: Particle[];
        tokens: any[];
        slotData: any;
        dragTarget: Pill | null;
        selectedOption: Pill | null;
        shake: number;
        endAnimationFrames: number;
        width: number;
        height: number;
        dpr: number;
    }>({
        pills: [],
        particles: [],
        tokens: [],
        slotData: null,
        dragTarget: null,
        selectedOption: null,
        shake: 0,
        endAnimationFrames: 0,
        width: 0,
        height: 0,
        dpr: 1
    });

    const buildLayout = useCallback(() => {
        const { width, height } = stateRef.current;
        if (!width || !height) return;

        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        stateRef.current.tokens = [];
        stateRef.current.pills = [];
        stateRef.current.slotData = null;
        stateRef.current.selectedOption = null;
        onCheckActive(false);

        ctx.font = `800 ${FONT_SIZE}px 'Nunito', sans-serif`;

        // Code Text Layout
        const maxCodeWidth = Math.min(width - 40, 380);
        const startX = (width - maxCodeWidth) / 2;
        let curX = startX;
        let curY = height * 0.35;

        level.code.forEach(item => {
            if (item.t === "\n") {
                curX = startX;
                curY += LINE_HEIGHT;
                return;
            }

            if (item.slot) {
                const slotW = SIZES[item.size || 'md'];
                stateRef.current.slotData = { 
                    x: curX + slotW / 2, 
                    y: curY, 
                    w: slotW, 
                    h: PILL_HEIGHT, 
                    occupied: null, 
                    ans: item.ans 
                };
                curX += slotW + 8;
            } else {
                const color = item.type === "keyword" ? level.theme : "#374151";
                const w = ctx.measureText(item.t || '').width;
                stateRef.current.tokens.push({ text: item.t, x: curX, y: curY, color: color });
                curX += w;
            }
        });

        // Auto-Wrapping Pill Layout
        const gap = 14;
        const availableW = width - 40;
        let rows: any[] = [];
        let currentRow: any[] = [];
        let currentW = -gap;

        level.options.forEach(opt => {
            const text = typeof opt === 'string' ? opt : opt.text;
            const sizeKey = typeof opt === 'string' 
                ? (level.code.find(c => c.slot)?.size || 'md') 
                : opt.size;
            const pillW = SIZES[sizeKey as keyof typeof SIZES];

            if (currentW + gap + pillW > availableW && currentRow.length > 0) {
                rows.push({ items: currentRow, width: currentW });
                currentRow = [];
                currentW = -gap;
            }
            currentRow.push({ text, w: pillW });
            currentW += gap + pillW;
        });
        
        if (currentRow.length > 0) {
            rows.push({ items: currentRow, width: currentW });
        }

        let py = height * 0.75 - ((rows.length - 1) * (PILL_HEIGHT + gap)) / 2;

        rows.forEach(row => {
            let px = (width - row.width) / 2;
            row.items.forEach((item: any) => {
                const p = new Pill(
                    item.text, 
                    px + item.w / 2, 
                    py, 
                    item.w, 
                    level.theme, 
                    level.type === 'drag_drop' ? 'drag' : 'mc'
                );
                stateRef.current.pills.push(p);
                px += item.w + gap;
            });
            py += PILL_HEIGHT + gap;
        });
    }, [level, onCheckActive]);

    const resize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
        
        stateRef.current.width = width;
        stateRef.current.height = height;
        stateRef.current.dpr = dpr;
        
        buildLayout();
    }, [buildLayout]);

    useEffect(() => {
        window.addEventListener('resize', resize);
        document.fonts.ready.then(resize);
        resize();
        return () => window.removeEventListener('resize', resize);
    }, [resize]);

    // Check Logic
    useEffect(() => {
        if (checkPressed === 0) return;
        
        const { slotData, selectedOption } = stateRef.current;
        let isCorrect = false;
        let burstX = 0, burstY = 0;

        if (level.type === "drag_drop") {
            if (slotData && slotData.occupied) {
                isCorrect = slotData.occupied.text === slotData.ans;
                burstX = slotData.x;
                burstY = slotData.y;
            }
        } else {
            if (selectedOption) {
                isCorrect = selectedOption.text === level.ans;
                burstX = selectedOption.x;
                burstY = selectedOption.y;
            }
        }

        if (isCorrect) {
            for (let i = 0; i < 30; i++) {
                stateRef.current.particles.push(new Particle(burstX, burstY, level.theme));
            }
            onCorrect(burstX, burstY);
        } else {
            stateRef.current.shake = 25;
            if (level.type === "drag_drop" && slotData && slotData.occupied) {
                const p = slotData.occupied;
                p.tx = p.homeX; p.ty = p.homeY;
                p.inSlot = false;
                slotData.occupied = null;
            } else if (stateRef.current.selectedOption) {
                stateRef.current.selectedOption.isSelected = false;
                stateRef.current.selectedOption = null;
            }
            onIncorrect();
            onCheckActive(false);
        }
    }, [checkPressed]);

    // Input Handling
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleDown = (e: PointerEvent) => {
            if (isComplete) return;
            const { pills, width, height } = stateRef.current;
            const x = e.clientX;
            const y = e.clientY;

            for (let i = pills.length - 1; i >= 0; i--) {
                const p = pills[i];
                if (Math.abs(x - p.x) < p.w / 2 && Math.abs(y - p.y) < p.h / 2) {
                    if (level.type === "drag_drop") {
                        stateRef.current.dragTarget = p;
                        p.isDragging = true;
                        if (p.inSlot) {
                            p.inSlot = false;
                            stateRef.current.slotData.occupied = null;
                            onCheckActive(false);
                        }
                        // Move to front
                        stateRef.current.pills.push(stateRef.current.pills.splice(i, 1)[0]);
                    } else if (level.type === "multiple_choice") {
                        stateRef.current.pills.forEach(pill => pill.isSelected = false);
                        p.isSelected = true;
                        stateRef.current.selectedOption = p;
                        onCheckActive(true);
                    }
                    break;
                }
            }
        };

        const handleMove = (e: PointerEvent) => {
            const { dragTarget } = stateRef.current;
            if (dragTarget) {
                dragTarget.x = e.clientX;
                dragTarget.y = e.clientY;
                dragTarget.tx = e.clientX;
                dragTarget.ty = e.clientY;
            }
        };

        const handleUp = () => {
            const { dragTarget, slotData } = stateRef.current;
            if (dragTarget) {
                dragTarget.isDragging = false;
                const dist = Math.sqrt((dragTarget.x - slotData.x) ** 2 + (dragTarget.y - slotData.y) ** 2);
                if (dist < 50 && !slotData.occupied) {
                    dragTarget.tx = slotData.x;
                    dragTarget.ty = slotData.y;
                    dragTarget.inSlot = true;
                    slotData.occupied = dragTarget;
                    onCheckActive(true);
                } else {
                    dragTarget.tx = dragTarget.homeX;
                    dragTarget.ty = dragTarget.homeY;
                    onCheckActive(false);
                }
                stateRef.current.dragTarget = null;
            }
        };

        canvas.addEventListener('pointerdown', handleDown);
        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
        return () => {
            canvas.removeEventListener('pointerdown', handleDown);
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
        };
    }, [isComplete, level.type, onCheckActive]);

    // Animation Loop
    useEffect(() => {
        let frameId: number;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        const loop = () => {
            const { width, height, tokens, slotData, pills, particles, shake } = stateRef.current;
            ctx.clearRect(0, 0, width, height);
            ctx.save();
            
            if (stateRef.current.shake > 0) {
                ctx.translate((Math.random() - 0.5) * stateRef.current.shake, (Math.random() - 0.5) * stateRef.current.shake);
                stateRef.current.shake *= 0.85; 
            }

            if (!isComplete) {
                // Draw Slot
                if (slotData) {
                    ctx.beginPath();
                    (ctx as any).roundRect(slotData.x - slotData.w / 2, slotData.y - slotData.h / 2, slotData.w, slotData.h, PILL_RADIUS);
                    ctx.fillStyle = "#f9fafb";
                    ctx.fill();
                    
                    ctx.globalAlpha = 0.4;
                    ctx.strokeStyle = level.theme;
                    ctx.lineWidth = 3;
                    ctx.setLineDash([8, 6]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.globalAlpha = 1.0;
                }

                // Draw Tokens
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";
                ctx.font = `800 ${FONT_SIZE}px 'Nunito', sans-serif`;
                tokens.forEach(t => {
                    ctx.fillStyle = t.color;
                    ctx.fillText(t.text, t.x, t.y + 2);
                });

                // Draw Pills
                pills.forEach(p => {
                    p.update();
                    p.draw(ctx);
                });
            } else {
                stateRef.current.endAnimationFrames++;
                const frames = stateRef.current.endAnimationFrames;

                ctx.fillStyle = "#111827";
                ctx.font = `900 36px 'Nunito', sans-serif`;
                ctx.textAlign = "center";
                ctx.fillText("lesson complete!", width / 2, height / 2 - 80);

                let earnedStars = 3;
                if (totalMistakes >= 1) earnedStars = 2;
                if (totalMistakes >= 3) earnedStars = 1;

                const starPositions = [width / 2 - 70, width / 2, width / 2 + 70];
                for (let i = 0; i < 3; i++) {
                    drawRoundedStar(ctx, starPositions[i], height / 2 + 20, 22, "#e5e7eb", 1);
                    if (i < earnedStars) {
                        const delay = i * 15;
                        const localTime = Math.max(0, frames - delay);
                        const progress = Math.min(1, localTime / 40);
                        const eased = easeOutQuart(progress);
                        if (progress > 0) {
                            const opacity = eased;
                            const xOff = (1 - eased) * -30;
                            const scale = 1.0 + ((1 - eased) * 1.5);
                            ctx.save();
                            ctx.translate(starPositions[i] + xOff, height / 2 + 20);
                            ctx.scale(scale, scale);
                            drawRoundedStar(ctx, 0, 0, 22, "#FFC107", opacity);
                            ctx.restore();
                        }
                    }
                }

                ctx.globalAlpha = Math.min(1, frames / 60);
                ctx.fillStyle = "#6b7280";
                ctx.font = `700 18px 'Nunito', sans-serif`;
                ctx.fillText(`mistakes made: ${totalMistakes}`, width / 2, height / 2 + 90);
                ctx.globalAlpha = 1;
            }

            particles.forEach((p, i) => {
                p.update();
                p.draw(ctx);
                if (p.life <= 0) particles.splice(i, 1);
            });

            ctx.restore();
            frameId = requestAnimationFrame(loop);
        };

        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }, [isComplete, level.theme, totalMistakes]);

    return <canvas ref={canvasRef} className="block touch-none" />;
}
