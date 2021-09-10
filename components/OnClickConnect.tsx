import React from 'react'
import { provider, ethEnabled, signer } from '../lib/w3';
import { utils, Contract } from 'ethers';
import tokenABI from '../lib/tokenABI';
import addresses from '../lib/addresses';
import { AccountsContext } from '../context/AccountContext';
import { FlipsContext } from '../context/FlipsContext';

import Button from 'react-bootstrap/Button';

const balances = async (address: string) => {
    return await Promise.all(Object.keys(addresses.tokens).map(async (symbol: string) => {
        const tokenInst = new Contract(addresses.tokens[symbol], tokenABI);
        const balance = await tokenInst.balanceOf(address).call();

        return {
            token: symbol,
            address: addresses.tokens[symbol],
            balance: utils.parseEther(balance),
        };
    }));
}

export default function OnClickConnect() {
    const onClickConnect = async (accountsContext: any, flipsContext: any) => {
        if (await !ethEnabled()) {
            alert('Please install MetaMask to use this dApp!');
        }

        const accounts = [await signer.getAddress()];
        if ([] !== accounts && typeof accountsContext !== 'undefined') {
            const newAccounts = await Promise.all(accounts.map(async (address: string) => {
                const balance = await provider.getBalance(address);
                // const tokenBalances = await balances(address);

                return {
                    address,
                    balance: utils.formatEther(balance.toString()).toString(),
                    // tokens: tokenBalances,
                };
            }));

            accountsContext.saveAccounts(newAccounts);
        }

        // const idiotSwap = new web3.eth.Contract(idiotABI, addresses.swap);
        // const contractFlips = await idiotSwap.methods.getAllFlips().call();
        // flipsContext.saveFlips(contractFlips);
    };

    return (
        <AccountsContext.Consumer>
            { accountsContext => (
                <FlipsContext.Consumer>
                    { flipsContext => (
                        <>
                            {
                                !accountsContext.accounts
                                && <Button onClick={() => onClickConnect(accountsContext, flipsContext)} variant="outline-primary">Connect</Button>
                            }
                        </>
                        )
                    }
                </FlipsContext.Consumer>
            )}
        </AccountsContext.Consumer>
    );
};
