const addresses: {[key: string]: string|any} = {
    null: '0x0000000000000000000000000000000000000000',
    flippening: {
        eth: {
            symbol: 'ETH',
            testnet: '0x0000000000000000000000000000000000000000',
            mainnet: '0x0000000000000000000000000000000000000000',
        },
        bsc: {
            symbol: 'BNB',
            testnet: '0x4c8CB29589095169436E9CEAc1035ABc1d80087e',
            mainnet: '0x0000000000000000000000000000000000000000',
        },
        poly: {
            symbol: 'MATIC',
            testnet: '0x0000000000000000000000000000000000000000',
            mainnet: '0x0000000000000000000000000000000000000000',
        },
    },
};

export default addresses;
