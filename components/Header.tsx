import React, { useContext } from 'react';
import Head from 'next/head';
import { AccountsContext } from '../context/AccountContext';
import { NetworkContext } from '../context/NetworkContext';
import OnClickConnect from '../components/OnClickConnect';
import Chip from '@mui/material/Chip';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import addresses from '../lib/addresses';

type Props = {};

const Header = ({}: Props) => {
    let { network } = useContext(NetworkContext) || {};
    let { accounts } = useContext(AccountsContext) || {};

    let networkPill: ReactJSXElement;

    if (network) {
        networkPill = <Chip label={ network } />;
    }

    let accountPills: ReactJSXElement = <>
        <p>Ser, Metamask is not connected</p>
    </>;

    if (accounts) {
        accountPills = <>
            <Chip label={
                accounts && accounts.map((account: any) => {
                    return <div key={ account.balance }>
                        <div>{ account.balance }</div>
                    </div>;
                })
            } />
            <Chip label={
                accounts && accounts.map((account: any) => {
                    return <div key={ account.address }>
                        <div>{ account.address }</div>
                    </div>;
                })
            } />
        </>;
    }

    return (
        <>
            <Head>
                <title>Flippening</title>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            </Head>
            <AccountsContext.Consumer>
                {(context: any) => (
                    <AppBar className="mb-4" position="static">
                        <Container>
                            <div className="d-flex justify-content-between">
                                <h1>Flippening</h1>
                                <OnClickConnect />
                                <div className="pt-3">
                                    <div className="d-flex">
                                        { accountPills }
                                        { networkPill }
                                    </div>
                                </div>
                            </div>
                        </Container>
                    </AppBar>
                )}
            </AccountsContext.Consumer>
        </>
    );
}

export default Header;
