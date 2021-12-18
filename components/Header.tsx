import * as React from 'react';
import Head from 'next/head';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import { AccountsContext } from '../context/AccountContext';
import OnClickConnect from '../components/OnClickConnect';
import Chip from '@mui/material/Chip';

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
                    <Navbar expand="lg" className="mb-4">
                        <Container>
                            <Navbar.Brand>Flippening</Navbar.Brand>
                            <Nav className="justify-content-end" style={{ width: "100%" }}>
                                <OnClickConnect />
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
                            </Nav>
                        </Container>
                    </Navbar>
                )}
            </AccountsContext.Consumer>
        </>
    );
}

export default Header;
