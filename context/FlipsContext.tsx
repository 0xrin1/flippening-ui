import {BigNumber} from 'ethers';
import { useState, createContext, useCallback } from 'react';
import { FlipType, SettleType, GuessType } from '../interfaces';

export interface FlipsContextData {
    flips: any,
    saveFlips: any,
    saveSettles: any,
    saveGuesses: any,
}

export const flipsContextDefaultValue: FlipsContextData = {
    flips: [],
    saveFlips: undefined,
    saveSettles: undefined,
    saveGuesses: undefined,
};

export const FlipsContext = createContext<FlipsContextData | undefined>(flipsContextDefaultValue);

const FlipsProvider: () => FlipsContextData = () => {
    const [flips, setFlips] = useState<FlipType[] | null>(null);

    const saveFlips = useCallback((newFlips: FlipType[]) => {
        setFlips([...newFlips]);
    }, [setFlips]);

    const saveSettles = useCallback((newSettles: SettleType[]) => {
        if (flips) {
            newSettles.forEach(settle => {
                const index = BigNumber.from(settle.args.index).toNumber();
                const updatedFlips = flips;
                updatedFlips[index].args.settler = settle.args.settler;
                saveFlips([...updatedFlips]);
            });
        }
    }, [flips, saveFlips]);

    const saveGuesses = useCallback((newGuesses: GuessType[]) => {
        if (flips) {
            newGuesses.forEach(guess => {
                const index = BigNumber.from(guess.args.index).toNumber();
                const updatedFlips = flips;
                updatedFlips[index].args.guesser = guess.args.guesser;
                updatedFlips[index].args.guess = guess.args.guess;
                saveFlips([...updatedFlips]);
            });
        }
    }, [flips, saveFlips]);

    return {
        flips,
        saveFlips,
        saveSettles,
        saveGuesses,
    };
};

export default FlipsProvider;
