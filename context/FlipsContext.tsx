import { useState, createContext, useCallback } from 'react';
import { FlipType } from '../interfaces';

export interface FlipsContextData {
    flips: any,
    saveFlips: any
}

export const flipsContextDefaultValue: FlipsContextData = {
    flips: [],
    saveFlips: undefined,
};

export const FlipsContext = createContext<FlipsContextData | undefined>(flipsContextDefaultValue);

const FlipsProvider: () => FlipsContextData = () => {
    const [flips, setFlips] = useState<FlipType[] | null>(null);

    const saveFlips = useCallback((newFlips: FlipType[]) => {
        setFlips([...newFlips]);
    }, [setFlips]);

    return {
        flips,
        saveFlips,
    };
};

export default FlipsProvider;
