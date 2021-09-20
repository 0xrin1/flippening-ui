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
                                        <li>blockNumber: { flip.blockNumber }</li>
                                        <li>blockHash: { flip.blockHash }</li>
                                        <li>address: { flip.address }</li>
                                        <li>amount: { ethers.utils.formatEther(BigNumber.from(flip.args.amount).toString()).toString() }</li>
                                        <li>guesser: { flip.args.guesser }</li>
                                        <li>token: { flip.args.token }</li>
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
