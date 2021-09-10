import { useState } from 'react';
import Accounts from '../components/Accounts';
import Flips from '../components/Flips';
import Layout from '../components/Layout';
import OnClickConnect from '../components/OnClickConnect';
import AccountsProvider, { AccountsContext } from '../context/AccountContext';
import FlipsProvider, { FlipsContext } from '../context/FlipsContext';
import CreateFlip from '../components/CreateFlip';
import styles from '../styles/IndexPage.module.scss';

const IndexPage = () => {
    const [ createFlip, setCreateFlip ] = useState(false);

    const showCreateFlip = () => {
        setCreateFlip(true);
    };

    const hideCreateFlip = () => {
        setCreateFlip(false);
    };

    const accountsProvider = AccountsProvider();
    const flipsProvider = FlipsProvider();

    let createFlipComponent = <button className={ styles.createFlipButton } onClick={ showCreateFlip }>Create flip</button>;
    if (createFlip) {
        createFlipComponent = (
            <>
                <button className={ styles.createFlipButton } onClick={ hideCreateFlip }>Cancel</button>
                <CreateFlip />
            </>
        );
    }

    return <>
        <div className={styles.index}>
            <div className={styles.container}>
                <AccountsContext.Provider value={ accountsProvider }>
                    <FlipsContext.Provider value={ flipsProvider }>
                        <Layout title="IdiotFlip">
                            <h1>Idiot Flip</h1>

                            <p>Stake your $IDIOT tokens against other people, it's double or nothing!</p>

                            <p>To guess an existing flip:</p>

                            <ul>
                                <li>Find a flip and supply the same amount of $IDIOT.</li>
                                <li>Guess whether it is TRUE or FALSE.</li>
                                <li>Submit.</li>
                            </ul>

                            <p>To create a flip:</p>
                            <ul>
                                <li>Enter an amount of $IDIOT you want to flip.</li>
                                <li>Pick TRUE or FALSE, approve, and submit.</li>
                                <li>NOTE DOWN YOUR SECRET!</li>
                                <li>Wait for a guess and redeem with your secret.</li>
                            </ul>

                            <br />
                            <hr />
                            <br />

                            <OnClickConnect />

                            <Accounts />

                            { createFlipComponent }

                            <Flips />
                        </Layout>
                    </FlipsContext.Provider>
                </AccountsContext.Provider>
            </div>
        </div>
    </>
}

export default IndexPage;
