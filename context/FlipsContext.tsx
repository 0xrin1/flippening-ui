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
                const newFlips = flips.map(flip => {
                    const settleIndex = BigNumber.from(settle.args.index).toNumber();
                    const flipIndex = BigNumber.from(flip.args.index).toNumber();
                    if (flipIndex !== settleIndex) {
                        return flip;
                    }

                    flip.args.settler = settle.args.settler;

                    return flip;
                });

                saveFlips([...newFlips]);
            });
        }
    }, [flips, saveFlips]);

    const saveGuesses = useCallback((newGuesses: GuessType[]) => {
        if (flips) {
            newGuesses.forEach(guess => {
                const newFlips = flips.map(flip => {
                    const guessIndex = BigNumber.from(guess.args.index).toNumber();
                    const flipIndex = BigNumber.from(flip.args.index).toNumber();
                    if (flipIndex !== guessIndex) {
                        return flip;
                    }

                    flip.args.guesser = guess.args.guesser;
                    flip.args.guess = guess.args.guess;

                    return flip;
                });

                saveFlips([...newFlips]);
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
