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
                            <h2>Flippening - The Degen Primitive</h2>

                            <div className={ styles.heroContainer }>
                                <div className={ styles.heroContainerContent }>
                                    <p>In a land of undue complexity, the Flippening was brewing. The battle of true versus false...</p>
                                    <p>Are you man enough to put your sack where your mouth is? Just Flip It, and conquer your chains forever.</p>
                                </div>
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
