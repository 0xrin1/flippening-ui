import React from 'react';
import { FlipsContext } from '../context/FlipsContext';
// import { web3 } from '../lib/w3';
// import { isExpired, timeUntilExpiration, timeUntilRetrieval } from '../lib/time';
// import Flip from './Flip';
// import addresses from '../lib/addresses';

export default function flips() {
    return (
        <FlipsContext.Consumer>
            {(context: any) => (
                <div>
                    <h2>Flips</h2>
                    <p>list of flips here</p>
                </div>
            )}
        </FlipsContext.Consumer>
    );
};
