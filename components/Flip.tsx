import React, { useState, useContext } from 'react'
import { AccountsContext } from '../context/AccountContext';
import { FlipType } from '../interfaces';
import symbols from '../lib/symbol';
import { isExpired, timeUntilExpiration, readableTimeUntilExpiration, readableTimeUntilRetrieval } from '../lib/time';
import { contract } from '../lib/w3';
import ProvideGuess from './ProvideGuess';
import styles from '../styles/Flip.module.scss';
import ProvideSecret from './ProvideSecret';

type PropTypes = {
    id: number,
    flip: FlipType,
    amount: number,
    retrieval?: boolean,
}

export default function Flip({
    id,
    flip,
    amount,
    retrieval,
}: PropTypes) {
    let [ guessing, setGuessing ] = useState(false);
    let [ expanded, setExpanded ] = useState(false);
    let [ providingSecret, setProvidingSecret ] = useState(false);
    let { accounts, saveAccounts } = useContext(AccountsContext);

    const toggleProvidingSecret = () => {
        setProvidingSecret(!providingSecret);
    };

    const startGuessing = () => {
        setGuessing(true);
    };

    const cancelGuess = () => {
        setGuessing(false);
    };

    const settleGuess = async () => {
        await contract.methods.settle(id).send({
            from: accounts[0].address,
        });

        window.location.reload();
    };

    const toggleExpandedFlip = () => {
        setExpanded(!expanded);
    };

    const guessActions = () => {
        let guess = <div onClick={ startGuessing } className={ styles.flipStatus }>submit guess</div>;

        if (guessing) {
            guess = <div onClick={ cancelGuess } className={ styles.flipStatus }>cancel guess</div>;
        }

        if (flip && flip.guess) {
            guess = <div onClick={ toggleProvidingSecret } className={ styles.flipStatus }>
                { providingSecret ? 'cancel retrieval' : 'retrieve with secret' }
            </div>
        }

        if (isExpired(timeUntilExpiration(flip))) {
            guess = <div onClick={ settleGuess } className={ styles.flipStatus }>settle</div>;

            if (guessing) {
                guess = <div onClick={ cancelGuess } className={ styles.flipStatus }>cancel settle</div>;
            }
        }

        if (flip && flip.settled) {
            guess = <div onClick={ toggleExpandedFlip } className={ styles.flipStatus }>settled</div>
        }

        return guess;
    };

    let guess = guessActions();

    let createGuess;
    if (guessing) {
        createGuess = <ProvideGuess id={ id } flip={ flip } />;
    }

    let provideSecret;
    if (providingSecret) {
        provideSecret = <ProvideSecret id={ id } flip={ flip } />
    }

    let expand;
    if (expanded) {
        expand = (
            <div className={ styles.flipRow }>
                <div>
                    <div className={ styles.flipRowKey }>proposer</div>
                    <div className={ styles.flipRowValue }>{ flip.proposer }</div>
                </div>
                <div>
                    <div className={ styles.flipRowKey }>guesser</div>
                    <div className={ styles.flipRowValue }>{ flip.challenger }</div>
                </div>
                <div>
                    <div className={ styles.flipRowKey }>secret</div>
                    <div className={ styles.flipRowValue }>{ flip.secret }</div>
                </div>
                <div>
                    <div className={ styles.flipRowKey }>guess</div>
                    <div className={ styles.flipRowValue }>{ flip.guess }</div>
                </div>
            </div>
        );
    }

    return <>
        <div className={ styles.flip }>
            <div className={[ styles.flipRowFlex, styles.flipHeader ].join(' ')}>
                <div>{ amount } { symbols.token }</div>
                <div>{ retrieval ? readableTimeUntilExpiration(flip) : readableTimeUntilRetrieval(flip) }</div>
                { guess }
                <div onClick={ toggleExpandedFlip } className={ styles.flipStatus }>details</div>
            </div>
            { expand }
            { createGuess }
            { provideSecret }
        </div>
    </>;
};
