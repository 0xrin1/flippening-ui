import React, {useContext, useState} from 'react';
import { FlipsContext } from '../context/FlipsContext';
import { AccountsContext } from '../context/AccountContext';
import { approve, contract } from '../lib/w3';
import styles from '../styles/ProvideGuess.module.scss';

export default function ProvideSecret(props: any) {
    let [ approved, setApproved ] = useState(false);
    let { accounts, saveAccounts } = useContext(AccountsContext);
    let [ radio, setRadio ] = useState(false);
    let [ secret, setSecret ] = useState('');

    const onRadioChange = (e: any) => {
        setRadio(e.target.value);
    };

    const onSecretChange = (e: any) => {
        setSecret(e.target.value);
    };

    const submitSecret = async (e: any) => {
        e.preventDefault();

        if (!approved) {
            await approve(accounts[0].address, props.flip.amount);

            setApproved(true);

            return;
        }

        await provideSecret(`${secret} ${radio}`);
    };

    // Challenge a flip via the IdiotSwap contract. .
    const provideSecret = async (secret: string) => {
        try {
            console.log('provideSecret', secret);
            await contract.methods.claimReward(props.id, secret).send({
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
            {(context: any) => (
                <div className={ styles.provideSecret }>
                    <form className={ styles.guessForm } onSubmit={ submitSecret }>
                        <input
                            type="text"
                            placeholder="secret"
                            className={ styles.guessInput }
                            onChange={ onSecretChange }
                        ></input>
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
