export type TokenType = {
    token: string,
    balance: string
}

export type AccountType = {
    address: string,
    balance: string,
    tokens: TokenType[]
}

export type GuessType = {
    index: number,
    guessor: string,
    guess: string,
}

export type SettleType = {
    index: number,
    settler: string,
    creatorWon: boolean,
}

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
    },
}
