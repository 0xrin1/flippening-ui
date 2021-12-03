import React, { useEffect, memo } from 'react';
import { ethers, BigNumber } from 'ethers';
import FlipsProvider, { FlipsContext } from '../context/FlipsContext';
import GuessProvider, { GuessContext } from '../context/GuessContext';
import { signedContract } from '../lib/w3';

const flips = memo(() => {
    const flipsProvider = FlipsProvider();
    const guessProvider = GuessProvider();

    const getEvents = async () => {
        await getCreatedEvents();
        await getGuessedEvents();
    };

    const getCreatedEvents = async () => {
        const eventFilter = signedContract.filters.Created();
        const events = await signedContract.queryFilter(eventFilter, 0);
        flipsProvider.saveFlips(events);
    };

    const getGuessedEvents = async () => {
        const eventFilter = signedContract.filters.Guess();
        const events = await signedContract.queryFilter(eventFilter, 0);
        guessProvider.saveGuesses(events);
    };

    useEffect(() => {
        getEvents();

        if (signedContract && signedContract.listenerCount() === 0) {
            signedContract.on('Guess', () => {
                getGuessedEvents();
            });

            signedContract.on('Created', () => {
                getCreatedEvents();
            });
        }
    }, []);

    return (
        <>
            <GuessContext.Provider value={ guessProvider }>
                <GuessContext.Consumer>
                    {(guessContext: any) => (
                        <FlipsContext.Provider value={ flipsProvider }>
                            <FlipsContext.Consumer>
                                {(context: any) => (
                                    <div>
                                        <h2>Flips</h2>
                                        <p>
                                            {
                                                context.flips && context.flips.map((flip: any) => {
                                                    const flipIndex = BigNumber.from(flip.args.index).toNumber();

                                                    let matchedGuess: any;
                                                    if (guessContext.guesses) {
                                                        guessContext.guesses.forEach((guess: any) => {
                                                            if (BigNumber.from(guess.args.index).toNumber() === flipIndex) {
                                                                matchedGuess = guess;
                                                            }
                                                        });
                                                    }

                                                    return <ul>
                                                        <li>amount: { ethers.utils.formatEther(BigNumber.from(flip.args.amount).toString()).toString() }</li>
                                                        <li>creator: { flip.args.creator }</li>
                                                        <li>token: { flip.args.token }</li>
                                                        <li>guesser: { matchedGuess?.args.guesser }</li>
                                                        <li>guess: { matchedGuess?.args.guess }</li>
                                                    </ul>;
                                                })
                                            }
                                        </p>
                                    </div>
                                )}
                            </FlipsContext.Consumer>
                        </FlipsContext.Provider>
                    )}
                </GuessContext.Consumer>
            </GuessContext.Provider>
        </>
    );
});

export default flips;
