import { useState, createContext, useCallback } from 'react';
import { AccountType } from '../interfaces';

export interface AccountsContextData {
    accounts: any,
    saveAccounts: any
}

export const accountsContextDefaultValue: AccountsContextData = {
    accounts: [],
    saveAccounts: undefined,
};

export const AccountsContext = createContext<AccountsContextData | undefined>(accountsContextDefaultValue);

const AccountsProvider: () => AccountsContextData = () => {
    const [accounts, setAccounts] = useState<AccountType[] | null>(null);

    const saveAccounts = useCallback((newAccounts: AccountType[]) => {
        setAccounts([...newAccounts]);
    }, [setAccounts]);

    return {
        accounts,
        saveAccounts,
    };
};

export default AccountsProvider;
