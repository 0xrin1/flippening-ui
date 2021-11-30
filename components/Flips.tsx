import React from 'react';
import { FlipsContext } from '../context/FlipsContext';
import { ethers, BigNumber } from 'ethers';

export default function flips() {
    return (
        <FlipsContext.Consumer>
            {(context: any) => (
                <div>
                    <h2>Flips</h2>
                    <p>
                        {
                            context.flips && context.flips.map((flip: any) => {
                                return <>
                                    <ul>
                                        <li>amount: { ethers.utils.formatEther(BigNumber.from(flip.args.amount).toString()).toString() }</li>
                                        <li>creator: { flip.args.creator }</li>
                                        <li>token: { flip.args.token }</li>
                                        <li>guesser: { flip.args.guesser }</li>
                                        <li>guess: { flip.args.guess }</li>
                                    </ul>
                                </>;
                            })
                        }
                    </p>
                </div>
            )}
        </FlipsContext.Consumer>
    );
};
