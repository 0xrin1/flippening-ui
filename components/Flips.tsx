import React, { useEffect, memo } from 'react';
import FlipsProvider, { FlipsContext } from '../context/FlipsContext';
import GuessProvider from '../context/GuessContext';
import SettleProvider from '../context/SettleContext';
import {
    instantiateContract,
    signer,
    signedContract,
    provider,
} from '../lib/w3';
import Flip from './Flip';

const flips = memo(() => {
    const flipsProvider = FlipsProvider();
    const guessProvider = GuessProvider();
    const settleProvider = SettleProvider();
    console.log('guessprovider flips.tsx', guessProvider);

    const getEvents = async () => {
        await getCreatedEvents();
        await getGuessedEvents();
        await getSettledEvents();
    };

    const getCreatedEvents = async () => {
        const currentBlock = await provider.getBlockNumber();
        const eventFilter = signedContract.filters.Created();
        // TODO: Only subtract 5000 when BSC chain because it sucks
        let events = await signedContract.queryFilter(eventFilter, currentBlock - 5000, currentBlock);

        let newEvents = [];

        for (let event of events) {
            if (event.args) {
                const tokenContract = instantiateContract(event?.args?.token).connect(signer);

                // Could make efficient by only checking symbol for addresses that symbol is not known for
                const symbol = await tokenContract.symbol();

                newEvents.push({
                    blockNumber: event.blockNumber,
                    blockHash: event.blockHash,
                    transactionHash: event.transactionHash,
                    address: event.address,
                    args: {
                        amount: event?.args?.amount,
                        creator: event?.args?.creator,
                        index: event?.args?.index,
                        token: event?.args?.token,
                        symbol,
                    },
                });
            }
        }

        flipsProvider.saveFlips(newEvents);
    };

    const getGuessedEvents = async () => {
        const currentBlock = await provider.getBlockNumber();
        const eventFilter = signedContract.filters.Guess();
        // TODO: Only subtract 5000 when BSC chain because it sucks
        const events = await signedContract.queryFilter(eventFilter, currentBlock - 5000, currentBlock);
        guessProvider.saveGuesses(events);
    };

    const getSettledEvents = async () => {
        const currentBlock = await provider.getBlockNumber();
        const eventFilter = signedContract.filters.Settled();
        // TODO: Only subtract 5000 when BSC chain because it sucks
        const events = await signedContract.queryFilter(eventFilter, currentBlock - 5000, currentBlock);
        settleProvider.saveSettles(events);
    };

    useEffect(() => {
        getEvents();

        if (signedContract) {
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

    return (
        <>
            <FlipsContext.Provider value={ flipsProvider }>
                <FlipsContext.Consumer>
                    {(context: any) => (
                        <>
                            <h2>Flips</h2>
                            <>
                                {
                                    (context.flips && context.flips.length > 0)
                                        ? context.flips.sort((a: any, b: any) => a.blockNumber < b.blockNumber)
                                            .map((flip: any) => {
                                                return <Flip flip={ flip } guesses={ guessProvider.guesses } settles={ settleProvider.settles } />;
                                            })
                                        : <p>There are no flips yet...</p>
                                }
                            </>
                        </>
                    )}
                </FlipsContext.Consumer>
            </FlipsContext.Provider>
        </>
    );
});

export default flips;
