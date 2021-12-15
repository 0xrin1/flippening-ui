export const addresses: {[key: string]: string|any} = {
    null: '0x0000000000000000000000000000000000000000',
    tokens: [{
        symbol: 'ERC',
        address: {
            local: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
            testnet: '0xb4B49427d8599d6030e41cDc2ccDb7d28A9A756B',
        },
    }],
    flippening: {
        eth: {
            symbol: 'ETH',
            testnet: '0x0000000000000000000000000000000000000000',
            mainnet: '0x0000000000000000000000000000000000000000',
            local: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
            explorer: {
                testnet: 'ropsten.etherscan.io',
                mainnet: 'etherscan.io'
            }
        },
        arb: {
            symbol: 'AETH',
            main: {
                address: '0x0000000000000000000000000000000000000000',
                id: 42161,
            },
            test: {
                address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                id: 421611,
            },
        },
        bsc: {
            id: 56,
            symbol: 'BNB',
            testnet: '0xa610A2D54cF77FFf7Eb721A49310C545992AC87c',
            mainnet: '0x0000000000000000000000000000000000000000',
            explorer: {
                testnet: 'testnet.bscscan.com',
                mainnet: 'bscscan.com'
            }
        },
        ava: {
            symbol: 'AVAX',
            main: {
                id: 43114,
                address: '0x0000000000000000000000000000000000000000',
            },
            test: {
                id: 43113,
                address: '0x87142Db455cbC047cEc0a9fD9fD8400b4Ee803Ce',
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

const chains: { [key: number]: string | any } = {
    97: {
        network: 'bsc',
        name: 'Binance Smart Chain Testnet',
        testnet: true
    }
}

export const getChainFromId = (chainId: number) => {
    let chain = chains[chainId];
    let address = addresses.flippening[chain.network];

    return {
        chain: chain,
        address: address
    };
};

export const getActiveChains = () => {
    const active = [];

    for (let chain of Array.from(chains)) {
        if (chain.testnet === true) {
            active.push(chain);
        }
    }

    console.log(active);

    return active;
}

export const getExplorerDomain = (chain: string) => {
    return addresses.flippening[chain].explorer.testnet;
};