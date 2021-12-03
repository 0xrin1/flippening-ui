import React, { useEffect, memo } from 'react';
import { ethers, BigNumber } from 'ethers';
import FlipsProvider, { FlipsContext } from '../context/FlipsContext';
import GuessProvider, { GuessContext } from '../context/GuessContext';
import SettleProvider, { SettleContext } from '../context/SettleContext';
import { signedContract } from '../lib/w3';

const flips = memo(() => {
    const flipsProvider = FlipsProvider();
    const guessProvider = GuessProvider();
    const settleProvider = SettleProvider();

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

    const getSettledEvents = async () => {
        const eventFilter = signedContract.filters.Settled();
        const events = await signedContract.queryFilter(eventFilter, 0);
        settleProvider.saveSettles(events);
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

            signedContract.on('Settled', () => {
                getSettledEvents();
            });
        }
    }, []);

    const collect = async (index: number, clearSecretString: string) => {
        await signedContract.settle(index, clearSecretString);
    };

    const getMatchedSecret = (flip: any): any => {
        const secrets = localStorage.getItem('secrets');

        let matchedSecret: any;
        if (secrets) {
            JSON.parse(secrets).forEach((secret: any) => {
                if (secret.hash === flip.transactionHash) {
                    matchedSecret = secret;
                }
            });
        }

        return matchedSecret;
    }

    const winDisplay = (settleContext: any, matchedSecret: any, matchedGuess: any) => {
        let win = <></>;
        if (matchedSecret && matchedGuess) {
            win = <li>win: no</li>;

            if (JSON.stringify(matchedSecret.secretValue) !== matchedGuess?.args.guess) {
                const collectClick = () => {
                    collect(BigNumber.from(matchedGuess.args.index).toNumber(), matchedSecret.secret);
                };

                win = <li>win: <button onClick={ collectClick }>collect</button></li>;
            }
        }

        if (matchedGuess && settleContext.settles) {
            settleContext.settles.forEach((settle: any) => {
                if (BigNumber.from(settle.args.index).toNumber() === BigNumber.from(matchedGuess.args.index).toNumber()) {
                    win = <li>win: yes, and settled</li>;
                }
            });
        }

        return win;
    }

    return (
        <>
            <SettleContext.Provider value={ settleProvider }>
                <SettleContext.Consumer>
                    {(settleContext: any) => (
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

                                        const matchedSecret = getMatchedSecret(flip);
                                        const win = winDisplay(settleContext, matchedSecret, matchedGuess);

                                        return <ul>
                                            <li>amount: { ethers.utils.formatEther(BigNumber.from(flip.args.amount).toString()).toString() }</li>
                                            <li>creator: { flip.args.creator }</li>
                                            <li>token: { flip.args.token }</li>
                                            <li>guesser: { matchedGuess?.args.guesser }</li>
                                            <li>guess: { matchedGuess?.args.guess }</li>
                                            <li>secretValue: { matchedSecret?.secretValue && JSON.stringify(matchedSecret.secretValue) }</li>
                                            { win }
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
                    )}
                </SettleContext.Consumer>
            </SettleContext.Provider>
        </>
    );
});

export default flips;
