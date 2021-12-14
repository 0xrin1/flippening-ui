import React, { useEffect, useContext, memo } from 'react';
import FlipsProvider from '../context/FlipsContext';
import { AccountsContext } from '../context/AccountContext';
import {
    instantiateContract,
    signer,
    signedContract,
    provider,
} from '../lib/w3';
import { BigNumber } from 'ethers';
import TabbedFlips from './TabbedFlips';
import { FlipType } from '../interfaces';

const flips = memo(() => {
    const flipsProvider = FlipsProvider();

    let { accounts } = useContext(AccountsContext) || {}
    const account = accounts?.length > 0 ? accounts[0] : {};

    const getEvents = async () => {
        const currentBlock = await provider.getBlockNumber();
        const eventFilter = signedContract.filters.Created();
        let events = await signedContract.queryFilter(eventFilter, 0, currentBlock);

        let newEvents: FlipType[] = [];

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
                    timestamp: (await event.getBlock()).timestamp,
                    args: {
                        amount: event?.args?.amount,
                        creator: event?.args?.creator,
                        index: BigNumber.from(event?.args?.index).toNumber(),
                        token: event?.args?.token,
                        symbol,
                    },
                });
            }
        }

        const guessedEvents = await getGuessedEvents();
        const settledEvents = await getSettledEvents();

        let updatedEvents = newEvents.map(flip => {
            guessedEvents.forEach(guess => {
                const guessIndex = BigNumber.from(guess?.args?.index).toNumber();
                const flipIndex = BigNumber.from(flip.args.index).toNumber();
                if (flipIndex !== guessIndex) {
                    return flip;
                }

                flip.args.guesser = guess?.args?.guesser;
                flip.args.guess = guess?.args?.guess;
            });

            settledEvents.forEach(settle => {
                const settleIndex = BigNumber.from(settle?.args?.index).toNumber();
                const flipIndex = BigNumber.from(flip.args.index).toNumber();
                if (flipIndex !== settleIndex) {
                    return flip;
                }

                flip.args.settler = settle?.args?.settler;
            });

            return flip;
        });

        if (newEvents && updatedEvents !== flipsProvider.flips) {
            await flipsProvider.saveFlips(updatedEvents);
        }

        return;
    };

    const getGuessedEvents = async () => {
        const currentBlock = await provider.getBlockNumber();
        const eventFilter = signedContract.filters.Guess();
        return signedContract.queryFilter(eventFilter, 0, currentBlock);
    };

    const getSettledEvents = async () => {
        const currentBlock = await provider.getBlockNumber();
        const eventFilter = signedContract.filters.Settled();
        return signedContract.queryFilter(eventFilter, 0, currentBlock);
    };

    useEffect(() => {
        if (signedContract) {
            signedContract.on('Guess', () => {
                getEvents();
            });

            signedContract.on('Created', () => {
                getEvents();
            });

            signedContract.on('Settled', () => {
                getEvents();
            });
        }

        getEvents();
    }, []);

    return <TabbedFlips flips={ flipsProvider.flips } account={ account } />;
});

export default flips;
