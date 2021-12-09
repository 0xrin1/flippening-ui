const addresses: {[key: string]: string|any} = {
    null: '0x0000000000000000000000000000000000000000',
    tokens: [{
        symbol: 'ERC',
        address: {
            local: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
            // testnet: '0xb4B49427d8599d6030e41cDc2ccDb7d28A9A756B',
            // testnet: '0x9B1D77D7DcB94C97a729E97Ba263CA9e26354235',
            testnet: '0xb4B49427d8599d6030e41cDc2ccDb7d28A9A756B',
        },
    }],
    flippening: {
        eth: {
            symbol: 'ETH',
            testnet: '0x0000000000000000000000000000000000000000',
            mainnet: '0x0000000000000000000000000000000000000000',
            local: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        },
        arb: {
            symbol: 'AETH',
            testnet: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
            mainnet: '0x0000000000000000000000000000000000000000',
        },
        bsc: {
            symbol: 'BNB',
            testnet: '0xa610A2D54cF77FFf7Eb721A49310C545992AC87c',
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
