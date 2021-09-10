import React from 'react';
import { AccountsContext } from '../context/AccountContext';

import styles from '../styles/Accounts.module.scss';

export default function Accounts() {
    return (
        <AccountsContext.Consumer>
            {(context: any) => (
                <div className={ styles.accounts }>
                    { context.accounts && context.accounts.map((account: any) => {
                        return <div key={account.address}>
                            <div className={ styles.accountsAddress }>{ account.address }</div>
                            <div className={ styles.accountsBalance }>{ account.balance }</div>
                            {/*{ account.tokens.map((token: any) => {
                                return <div className={ styles.accountsBalance }>{ account.balance }</div>;
                            }) } */}
                        </div>;
                    }) }
                </div>
            )}
        </AccountsContext.Consumer>
    );
};
