import { useState, createContext, useCallback } from 'react';
import { GuessType } from '../interfaces';

export interface GuessContextData {
    guesses: any,
    saveGuesses: any
}

export const guessContextDefaultValue: GuessContextData = {
    guesses: [],
    saveGuesses: undefined,
};

export const GuessContext = createContext<GuessContextData | undefined>(guessContextDefaultValue);

const GuessProvider: () => GuessContextData = () => {
    const [guesses, setGuesses] = useState<GuessType[] | null>(null);

    const saveGuesses = useCallback((newGuesses: GuessType[]) => {
        setGuesses([...newGuesses]);
    }, [setGuesses]);

    return {
        guesses,
        saveGuesses,
    };
};

export default GuessProvider;
