import React, { useContext } from 'react';
import { provider, ethEnabled, signer } from '../lib/w3';
import { utils } from 'ethers';
// import tokenABI from '../lib/tokenABI';
// import addresses from '../lib/addresses';
import { AccountsContext } from '../context/AccountContext';

// const balances = async (address: string) => {
//     return await Promise.all(Object.keys(addresses.tokens).map(async (symbol: string) => {
//         const tokenInst = new Contract(addresses.tokens[symbol], tokenABI);
//         const balance = await tokenInst.balanceOf(address).call();
//
//         return {
//             token: symbol,
//             address: addresses.tokens[symbol],
//             balance: utils.parseEther(balance),
//         };
//     }));
// }

export default function OnClickConnect() {
    let { accounts, saveAccounts } = useContext(AccountsContext) || {};

    const onClickConnect = async (saveAccounts: any) => {
        if (! (await ethEnabled())) {
            // @ts-ignore
            // alert('Please install MetaMask to use this dApp!');
        }

        if (signer) {
            const ethersAccounts = [await signer.getAddress()];
            if ([] !== ethersAccounts && typeof saveAccounts !== 'undefined') {
                const newAccounts = await Promise.all(ethersAccounts.map(async (address: string) => {
                    const balance = await provider.getBalance(address);

                    return {
                        address,
                        balance: utils.formatEther(balance.toString()).toString(),
                    };
                }));

                // Memoize to prevent infinite render loop on entire application
                if (JSON.stringify(newAccounts) === JSON.stringify(accounts)) {
                    return;
                }

                saveAccounts(newAccounts);
            }
        }
    };

    onClickConnect(saveAccounts);

    return <></>;
};
