import { useState, useCallback, useRef, useEffect } from 'react';
import { levels, VISUAL_CONSTANTS, THEMES, SIZES } from '../lib/constants';
import { Pill, Particle } from '../lib/quiz-engine';

export function useQuizGame() {
    const [currentLvlIndex, setCurrentLvlIndex] = useState(0);
    const [totalMistakes, setTotalMistakes] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [shake, setShake] = useState(0);
    const [selectedOption, setSelectedOption] = useState<Pill | null>(null);
    const [slotOccupied, setSlotOccupied] = useState<Pill | null>(null);

    const level = levels[currentLvlIndex];

    const nextLevel = useCallback(() => {
        if (currentLvlIndex < levels.length - 1) {
            setCurrentLvlIndex(prev => prev + 1);
            setSlotOccupied(null);
            setSelectedOption(null);
        } else {
            setIsComplete(true);
        }
    }, [currentLvlIndex]);

    const resetGame = useCallback(() => {
        setCurrentLvlIndex(0);
        setTotalMistakes(0);
        setIsComplete(false);
        setSlotOccupied(null);
        setSelectedOption(null);
    }, []);

    const handleMistake = useCallback(() => {
        setShake(25);
        setTotalMistakes(prev => prev + 1);
        setSlotOccupied(null);
        setSelectedOption(null);
    }, []);

    return {
        level,
        currentLvlIndex,
        totalMistakes,
        isComplete,
        shake,
        setShake,
        nextLevel,
        resetGame,
        handleMistake,
        selectedOption,
        setSelectedOption,
        slotOccupied,
        setSlotOccupied,
        totalLevels: levels.length,
    };
}
