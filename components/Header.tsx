import * as React from 'react';
import Head from 'next/head';
import { AccountsContext } from '../context/AccountContext';
import OnClickConnect from '../components/OnClickConnect';
import Chip from '@mui/material/Chip';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';

type Props = {};

const Header = ({}: Props) => {
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
                                    <Chip label={
                                        context.accounts && context.accounts.map((account: any) => {
                                            return <div key={account.balance}>
                                                <div>{account.balance}</div>
                                            </div>;
                                        })
                                    } />
                                    <Chip label={
                                        context.accounts && context.accounts.map((account: any) => {
                                            return <div key={account.address}>
                                                <div>{account.address}</div>
                                            </div>;
                                        })
                                    } />
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
