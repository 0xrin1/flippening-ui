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
            // testnet: '0x4c8CB29589095169436E9CEAc1035ABc1d80087e',
            testnet: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
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
