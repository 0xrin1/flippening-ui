import React, {useState} from 'react';
import { FlipsContext } from '../context/FlipsContext';
import { AccountsContext } from '../context/AccountContext';
import { approve, contract, web3 } from '../lib/w3';
import { getRandomString, sha256 } from '../lib/crypto';
import styles from '../styles/CreateFlip.module.scss';

export default function CreateFlip() {
    let [ approved, setApproved ] = useState(false);
    let [ radio, setRadio ] = useState(false);
    let [ amount, setAmount ] = useState(0);

    const onRadioChange = (e: any) => {
        setRadio(e.target.value);
    };

    const onAmountChange = (e: any) => {
        setAmount(e.target.value);
    };

    const createFlip = async (
        context: any,
        secret: string,
        amount: number,
    ) => {
        try {
            const response = await contract.methods.propose(
                secret,
                web3.utils.toWei(amount.toString()),
            ).send({
                from: context.accounts[0].address,
            });

            console.log('sendQuery response', response);
        } catch(e) {
            console.log('e', e);
        }
    }

    const onSubmit = async (e: any, context: any) => {
        e.preventDefault();

        if (!approved) {
            await approve(amount.toString(), context.accounts[0].address);

            setApproved(true);

            return;
        }

        // Generate secret from provided guess and randomly created secret.
        const secret = getRandomString(Math.random() * 20);

        const hashedSecret = await sha256(`${secret} ${radio}`);

        await createFlip(context, hashedSecret, amount);

        // Return the secret to user so that they can take note.
        alert(`Make to store your secret so you can redeem the pot if you win: ${secret}`);
        console.log(`Make to store your secret so you can redeem the pot if you win: ${secret}`);

        alert(`Confirm that you stored your secret! ${secret}`);

        window.location.reload();
    };

    return <>
        <AccountsContext.Consumer>
            {(accountsContext: any) => (
                <FlipsContext.Consumer>
                    {(positionsContext: any) => (
                        <div>
                            <form className={ styles.flipForm } onSubmit={ (e) => onSubmit(e, accountsContext) }>
                                <div className={ styles.flipFormRow }>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="amount"
                                        className={ styles.flipInput }
                                        onChange={ onAmountChange }
                                    ></input>
                                </div>
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
                                <input type="submit" className={ styles.flipSubmit } value={ approved ? 'Transact' : 'Approve'}></input>
                            </form>
                        </div>
                    )}
                </FlipsContext.Consumer>
            )}
        </AccountsContext.Consumer>
    </>;
};
