import Container from 'react-bootstrap/Container';

import 'bootstrap/dist/css/bootstrap.min.css';

// import Image from 'next/image';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Layout from '../components/Layout';
import Header from '../components/Header';
import FlipForm from '../components/FlipForm';
import Flips from '../components/Flips';
import AccountsProvider, { AccountsContext } from '../context/AccountContext';

import styles from '../styles/HomePage.module.scss';

const HomePage = () => {
    const accountsProvider = AccountsProvider();

    // const HeroImage = () => {
    //     return <Image src="/flip-coin.png" width="250px" height="350px" />;
    // };

    return <>
        <AccountsContext.Provider value={ accountsProvider }>
            <Layout title="Flippening"></Layout>
            <Header></Header>
            <div className="main">
                <Container>
                    <Row className="mb-5">
                        <Col md="7">
                            <FlipForm></FlipForm>
                        </Col>
                        <Col md="5">
                            <h2>How it works?</h2>

                            <div className={ styles.heroContainer }>
                                <p className={ styles.heroContainerContent }>Select a pool, bet an amount and flip the coin.<br />If you win you get double back.<br />Easy peasy :)</p>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="12">
                            <Flips></Flips>
                        </Col>
                    </Row>
                </Container>
            </div>
        </AccountsContext.Provider>
    </>
}

export default HomePage;
