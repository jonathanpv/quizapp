'use client';

import React, { useState, useCallback } from 'react';
import CanvasQuiz from '../components/CanvasQuiz';
import QuizUI from '../components/QuizUI';
import { useQuizGame } from '../hooks/useQuizGame';

export default function Home() {
    const {
        level,
        currentLvlIndex,
        totalMistakes,
        isComplete,
        nextLevel,
        resetGame,
        handleMistake,
        totalLevels
    } = useQuizGame();

    const [checkActive, setCheckActive] = useState(false);
    const [checkPressed, setCheckPressed] = useState(0);

    const onCheck = useCallback(() => {
        if (isComplete) {
            resetGame();
            return;
        }
        if (!checkActive) return;
        setCheckPressed(p => p + 1);
    }, [checkActive, isComplete, resetGame]);

    const handleCorrect = useCallback((x: number, y: number) => {
        setTimeout(nextLevel, 500);
    }, [nextLevel]);

    const handleIncorrect = useCallback(() => {
        handleMistake();
    }, [handleMistake]);

    return (
        <main className="relative w-screen h-screen bg-white">
            <CanvasQuiz 
                level={level}
                isComplete={isComplete}
                totalMistakes={totalMistakes}
                onCheckActive={setCheckActive}
                onCorrect={handleCorrect}
                onIncorrect={handleIncorrect}
                checkPressed={checkPressed}
                onReset={resetGame}
            />
            <QuizUI 
                level={level}
                currentLvlIndex={currentLvlIndex}
                totalLevels={totalLevels}
                isComplete={isComplete}
                checkActive={checkActive}
                onCheck={onCheck}
            />
        </main>
    );
}
