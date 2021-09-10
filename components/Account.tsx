import React from 'react'
import { AccountType } from '../interfaces';

type PropTypes = {
    account: AccountType
}

export default function Account({
    account
}: PropTypes) {
    return (
        <>
            <div className="account">
                <div className="address">
                    <label>Address: </label>{ account.address }
                </div>
                <div className="balance">
                    <div className="token-logo">
                        ETH
                    </div>
                    <div className="balance-value">
                        { account.balance }
                    </div>
                </div>
                <div className="tokens">
                    {account.tokens.map(token => {
                        return (
                            <div className="token" key={ token.token }>
                                <div className="balance">
                                    <div className="token-logo">
                                        { token.token }
                                    </div>
                                    <div className="balance-value">
                                        { token.balance }
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    )
};
