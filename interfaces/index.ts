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
    proposer: string,
    challenger: string;
    secret: string; // Ecrypted with public key of owner.
    amount: number; // Amount put up by proposer.
    guess: string; // Guess, not encrypted.
    expiry: number; // When the default winner in selected. Duration in minutes.
    createdAt: number; // When the proposition was created.
    settled: boolean; // Whether the proposition has been settled.
}
