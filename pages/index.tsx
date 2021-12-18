import 'bootstrap/dist/css/bootstrap.min.css';

import Grid from '@mui/material/Grid';

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
                <Grid container spacing={ 2 }>
                    <Grid item xs={7}>
                        <FlipForm></FlipForm>
                    </Grid>
                    <Grid item xs={5}>
                        <h2>The Degen Primitive</h2>

                        <div className={ styles.heroContainer }>
                            <div className={ styles.heroContainerContent }>
                                <p>In a land of undue complexity, the Flippening was brewing. The battle of <strong>true</strong> versus <strong>false</strong>...</p>
                                <p>Are you man enough to put your sack where your mouth is? Just <strong>Flip It</strong> and conquer your chains forever.</p>
                            </div>
                        </div>
                    </Grid>
                    <Grid item xs={12}>
                        <Flips></Flips>
                    </Grid>
                </Grid>
            </div>
        </AccountsContext.Provider>
    </>
}

export default HomePage;
