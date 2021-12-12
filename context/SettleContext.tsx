import { useState, createContext, useCallback } from 'react';
import { SettleType } from '../interfaces';

export interface SettleContextData {
    settles: any,
    saveSettles: any
}

export const settleContextDefaultValue: SettleContextData = {
    settles: [],
    saveSettles: undefined,
};

export const SettleContext = createContext<SettleContextData | undefined>(settleContextDefaultValue);

const SettleProvider: () => SettleContextData = () => {
    const [settles, setSettles] = useState<SettleType[] | null>(null);

    const saveSettles = useCallback((newSettles: SettleType[]) => {
        setSettles([...newSettles]);
    }, [setSettles]);

    return {
        settles,
        saveSettles,
    };
};

export default SettleProvider;
