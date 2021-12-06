import React, {useContext, useState} from 'react';
import { FlipsContext } from '../context/FlipsContext';
import { AccountsContext } from '../context/AccountContext';
import { approve, contract } from '../lib/w3';
import styles from '../styles/ProvideGuess.module.scss';

export default function ProvideGuess(props: any) {
    let [ approved, setApproved ] = useState(false);
    let { accounts } = useContext(AccountsContext) || {};
    let [ radio, setRadio ] = useState(false);

    const onRadioChange = (e: any) => {
        setRadio(e.target.value);
    };

    const submitGuess = async (e: any) => {
        e.preventDefault();

        if (!approved) {
            await approve(accounts[0].address, props.flip.amount);

            setApproved(true);

            return;
        }

        await provideGuess(`${radio}`);
    };

    // Challenge a flip via the IdiotSwap contract. .
    const provideGuess = async (guess: string) => {
        try {
            await contract.methods.challenge(props.id, guess).send({
                from: accounts[0].address,
            });

            window.location.reload();
        } catch(e) {
            console.log('e', e);
        }
    }

    let submitText = 'approve';
    if (approved) {
        submitText = 'submit';
    }

    return <>
        <FlipsContext.Consumer>
            {(_context: any) => (
                <div>
                    <form className={ styles.guessForm } onSubmit={ submitGuess }>
                        <div className={ styles.flipForm } onChange={ onRadioChange }>
                            <input
                                type="radio"
                                placeholder="secret"
                                className={ styles.flipRadio }
                                name="flipRadio"
                                value="true"
                            / >
                            <span>true</span>
                            <input
                                type="radio"
                                placeholder="secret"
                                className={ styles.flipRadio }
                                name="flipRadio"
                                value="false"
                            / >
                            <span>false</span>
                        </div>
                        <input type="submit" className={ styles.guessSubmit } value={ submitText }></input>
                    </form>
                </div>
            )}
        </FlipsContext.Consumer>
    </>;
};
