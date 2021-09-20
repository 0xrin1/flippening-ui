import { useEffect } from 'react';
import Container from 'react-bootstrap/Container';

import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/HomePage.module.scss';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Layout from '../components/Layout';
import Header from '../components/Header';
import FlipForm from '../components/FlipForm';
import Flips from '../components/Flips';
import AccountsProvider, { AccountsContext } from '../context/AccountContext';
import FlipsProvider, { FlipsContext } from '../context/FlipsContext';
import { signedContract } from '../lib/w3';

const HomePage = () => {
    const accountsProvider = AccountsProvider();
    const flipsProvider = FlipsProvider();

    useEffect(() => {
        getCreatedEvents();
    });

    const getCreatedEvents = async () => {
        if (accountsProvider.accounts && !flipsProvider.flips) {
            const eventFilter = signedContract.filters.Created();
            const events = await signedContract.queryFilter(eventFilter, 0);
            flipsProvider.saveFlips(events);
        }
    };

    return <>
        <AccountsContext.Provider value={ accountsProvider }>
            <Layout title="Flippening"></Layout>
            <Header></Header>
            <div className="main">
                <Container>
                    <Row>
                        <Col md="6">
                            <h2>How it works?</h2>

                            <p>Select a pool, bet an ammount and flip the coin.<br />If you win you get double back.<br />Easy peasy :)</p>
                        </Col>
                        <Col md="6">
                            <FlipForm></FlipForm>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="12">
                            <FlipsContext.Provider value={ flipsProvider }>
                                <Flips></Flips>
                            </FlipsContext.Provider>
                        </Col>
                    </Row>
                </Container>
            </div>
        </AccountsContext.Provider>
    </>
}

export default HomePage;
