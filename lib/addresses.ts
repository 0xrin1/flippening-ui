export const addresses: {[key: string]: string|any} = {
    null: '0x0000000000000000000000000000000000000000',
    tokens: [
        {
            symbol: 'ERC',
            address: {
                eth_local: process.env.TOKEN_ERC_LOCAL,
                eth_testnet: '0xb4B49427d8599d6030e41cDc2ccDb7d28A9A756B',
                arb_test: '0x0000000-arb_test',
                arb_main: '0x0000000-arb_main',
            },
        },
        {
            symbol: 'WAVAX',
            address: {
                eth_local: process.env.TOKEN_WAVAX_LOCAL,
                arb_main: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
            },
        },
        {
            symbol: 'FLIP',
            address: {
                eth_local: process.env.TOKEN_FLIP_LOCAL,
            },
        },
    ],
    flippening: {
        eth: {
            name: 'Ethereum',
            symbol: 'ETH',
            main: {
                address: '0x0000000000000000000000000000000000000000',
                id: 1,
                explorer: 'etherscan.io',
            },
            test: {
                address: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
                id: 3,
                explorer: 'ropsten.ethersan.io',
            },
            local: {
                address: process.env.NETWORK_ETH_LOCAL,
                id: 31337,
                deploymentBlock: 0,
            },
        },
        arb: {
            name: 'Arbitrum',
            symbol: 'AETH',
            main: {
                address: '0x0000000000000000000000000000000000000000',
                id: 42161,
            },
            test: {
                address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                id: 421611,
                explorer: 'testnet.arbiscan.io',
                deploymentBlock: 0,
            },
        },
        bsc: {
            name: 'Binance Smart Chain',
            symbol: 'BNB',
            main: {
                address: '0x0000000000000000000000000000000000000000',
                id: 56,
                explorer: 'bscscan.com',
            },
            test: {
                address: '0xa610A2D54cF77FFf7Eb721A49310C545992AC87c',
                id: 97,
                explorer: 'testnet.bscscan.com',
            },
        },
        ava: {
            name: 'Avalanche',
            symbol: 'AVAX',
            main: {
                id: 43114,
                address: '0x0000000000000000000000000000000000000000',
            },
            test: {
                id: 43113,
                address: '0x87142Db455cbC047cEc0a9fD9fD8400b4Ee803Ce',
                deploymentBlock: 3479818,
            },
        },
        poly: {
            symbol: 'MATIC',
            main: {
                id: 137,
                address: '0x0000000000000000000000000000000000000000',
            },
            test: {
                id: 80001,
                address: '0x0000000000000000000000000000000000000000',
            },
        },
    },
};

type chainObject = {
    [key: string]: string
}

export const getActiveChains = (): chainObject => {
    const active: chainObject = {}

    const chainKeys: string[] = Object.keys(addresses.flippening);
    chainKeys.forEach((chainKey: string) => {
        const chain = addresses.flippening[chainKey];
        if (chain.test.address !== addresses.null) {
            active[chainKey] = chain.name;
        }
    });

    return active;
}

type tokenObject = {
    [key: string]: string
}

export const getTokens = (network: string): tokenObject => {
    let active: tokenObject = {}

    const tokenKeys: string[] = Object.keys(addresses.tokens);
    tokenKeys.forEach((tokenKey: string) => {
        const token = addresses.tokens[tokenKey];
        let name = `${network}_main`;
        if (process.env.NODE_ENV != 'production') {
            name = `${network}_local`;
        }
        if (token.address.hasOwnProperty(name)) {
            active[token.symbol] = token.address[name];
        }
    });

    return active;
}

export const getExplorerDomain = (network: string) => {
    return addresses.flippening[network].test.explorer;
};
