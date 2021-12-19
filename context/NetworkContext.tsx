import { useState, createContext, useCallback } from 'react';

export interface NetworkContextData {
    network: string,
    saveNetwork: any,
}

export const networkContextDefaultValue: NetworkContextData = {
    network: '',
    saveNetwork: undefined,
};

export const NetworkContext = createContext<NetworkContextData | undefined>(networkContextDefaultValue);

const NetworkProvider: () => NetworkContextData = () => {
    const [ network, setNetwork ] = useState<string>('');

    const saveNetwork = useCallback(async (network: string) => {
        console.log('saving network', network);
        setNetwork(network);
    }, [setNetwork]);

    return {
        network,
        saveNetwork,
    };
};

export default NetworkProvider;
