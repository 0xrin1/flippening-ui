import React from 'react';
import { FlipsContext } from '../context/FlipsContext';

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
