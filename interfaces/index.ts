export type TokenType = {
    token: string,
    balance: string
};

export type AccountType = {
    address: string,
    balance: string,
    tokens: TokenType[]
};

export type GuessType = {
    blockNumber: string,
    blockHash: string;
    transactionHash: string;
    address: number;
    args: {
        index: number,
        guesser: string,
        guess: string,
    },
};

export type SettleType = {
    blockNumber: string,
    blockHash: string;
    transactionHash: string;
    address: number;
    args: {
        index: number,
        creatorWon: boolean,
        settler: string,
    },
};

export type FlipType = {
    blockNumber: string,
    blockHash: string;
    transactionHash: string;
    address: number;
    args: {
        amount: number,
        creator: string,
        index: number,
        token: string,
        symbol: string,
        guesser?: string,
        guess?: string,
        settler?: string,
    },
};
