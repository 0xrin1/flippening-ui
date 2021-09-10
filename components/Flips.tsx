import React from 'react';
import { FlipsContext } from '../context/FlipsContext';
import { web3 } from '../lib/w3';
import { isExpired, timeUntilExpiration, timeUntilRetrieval } from '../lib/time';
import Flip from './Flip';
import addresses from '../lib/addresses';

export default function flips() {
    const flips = (flips: any, callback: any) => {
        let i = 0;

        return flips.reduce((c: any, flip: any) => {
            c = callback(i, c, flip);

            i += 1;

            return c;
        }, []);
    };

    const openFlips = (context: any) => {
        if (context && context.flips) {
            return flips(context.flips , (i: number, c: any, flip: any) => {
                const amount = web3.utils.fromWei(flip.amount);

                if (flip.proposer !== addresses.null && flip.guess === '' && !isExpired(timeUntilRetrieval(flip))) {
                    let prop = <Flip id={ i } flip={ flip } amount={ amount } />

                    c.push(prop);
                }

                return c;
            });
        }
    };

    const guessedFlips = (context: any) => {
        if (context && context.flips) {
            return flips(context.flips , (i: number, c: any, flip: any) => {
                const amount = web3.utils.fromWei(flip.amount);

                if (flip.proposer !== addresses.null && flip.guess !== '' && !isExpired(timeUntilRetrieval(flip))) {
                    let prop = <Flip id={ i } flip={ flip } amount={ amount } />

                    c.push(prop);
                }

                return c;
            });
        }
    };

    const retrievalFlips = (context: any) => {
        if (context && context.flips) {
            return flips(context.flips , (i: number, c: any, flip: any) => {
                const amount = web3.utils.fromWei(flip.amount);

                if (
                    flip.proposer !== addresses.null &&
                    isExpired(timeUntilExpiration(flip)) &&
                    !isExpired(timeUntilRetrieval(flip))
                ) {
                    let prop = <Flip id={ i } flip={ flip } amount={ amount } retrieval={ true } />

                    c.push(prop);
                }

                return c;
            });
        }
    };

    const expiredFlips = (context: any) => {
        if (context && context.flips) {
            return flips(context.flips , (i: number, c: any, flip: any) => {
                const amount = web3.utils.fromWei(flip.amount);

                if (flip.proposer !== addresses.null && isExpired(timeUntilRetrieval(flip))) {
                    let prop = <Flip id={ i } flip={ flip } amount={ amount } />

                    c.push(prop);
                }

                return c;
            });
        }
    };

    return (
        <FlipsContext.Consumer>
            {(context: any) => (
                <div>
                    <h3>Open</h3>
                    { openFlips(context) }
                    <h3>Guessed</h3>
                    { guessedFlips(context) }
                    <h3>Locked for retrieval</h3>
                    { retrievalFlips(context) }
                    <h3>Expired</h3>
                    { expiredFlips(context) }
                </div>
            )}
        </FlipsContext.Consumer>
    );
};
