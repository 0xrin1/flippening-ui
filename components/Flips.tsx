import React from 'react';
import { ethers, BigNumber, utils } from 'ethers';
import FlipsProvider, { FlipsContext } from '../context/FlipsContext';
import GuessProvider, { GuessContext } from '../context/GuessContext';
import AccountsProvider, { AccountsContext } from '../context/AccountContext';
import { signedContract } from '../lib/w3';

export default function flips() {
    const accountsProvider = AccountsProvider();
    const flipsProvider = FlipsProvider();
    const guessProvider = GuessProvider();

    const getEvents = async () => {
        await getCreatedEvents();
        await getGuessedEvents();
    };

    const getCreatedEvents = async () => {
        console.log('getCreatedEvents', accountsProvider.accounts);
        const eventFilter = signedContract.filters.Created();
        const events = await signedContract.queryFilter(eventFilter, 0);
        flipsProvider.saveFlips(events);
    };

    const getGuessedEvents = async () => {
        console.log('getGuessedEvents', accountsProvider.accounts);
        const eventFilter = signedContract.filters.Guessed();
        const events = await signedContract.queryFilter(eventFilter, 0);
        guessProvider.saveGuesses(events);
    };

    return (
        <>
            <FlipsContext.Provider value={ flipsProvider }>
                <FlipsContext.Consumer>
                    {(context: any) => (
                        <div>
                            <h2>Flips</h2>
                            <button onClick={ getCreatedEvents }>Get Flips</button>
                            <p>
                                {
                                    context.flips && context.flips.map((flip: any) => {
                                        return <ul>
                                            <li>amount: { ethers.utils.formatEther(BigNumber.from(flip.args.amount).toString()).toString() }</li>
                                            <li>creator: { flip.args.creator }</li>
                                            <li>token: { flip.args.token }</li>
                                            <li>guesser: { flip.args.guesser }</li>
                                            <li>guess: { flip.args.guess }</li>
                                        </ul>;
                                    })
                                }
                            </p>
                        </div>
                    )}
                </FlipsContext.Consumer>
            </FlipsContext.Provider>
            <GuessContext.Provider value={ guessProvider }>
                <GuessContext.Consumer>
                    {(context: any) => (
                        <div>
                            <h2>Guesses</h2>
                            <button onClick={ getGuessedEvents }>Get Guesses</button>
                            <p>
                                {
                                    context.guesses && context.guesses.map((guess: any) => {
                                        return <ul>
                                            <li>index: { BigNumber.from(guess.args.index).toString() }</li>
                                            <li>guess: { guess.args.guess }</li>
                                            <li>guesser: { guess.args.guesser }</li>
                                        </ul>
                                    })
                                }
                            </p>
                        </div>
                    )}
                </GuessContext.Consumer>
            </GuessContext.Provider>
        </>
    );
};
