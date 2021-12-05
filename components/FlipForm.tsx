import React, { useContext, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import AccountsProvider, { AccountsContext } from '../context/AccountContext';
import styles from '../styles/FlipForm.module.scss';
import { utils, Contract } from 'ethers';
import { contract, signedContract, approve, signer } from '../lib/w3';
import { getRandomString, sha256 } from '../lib/crypto';
import tokenABI from '../lib/tokenABI';
import addresses from '../lib/addresses';

export default function FlipForm() {
    let { accounts, saveAccounts } = useContext(AccountsContext);

    let [network, setNetwork] = useState('bsc');
    let [range, setRange] = useState(10);
    // let [token, setToken] = useState('0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9');
    let [token, setToken] = useState('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');
    let [loading, setLoading] = useState(false);

    let [approved, setApproved] = useState(false);

    useEffect(() => {
        if (signedContract) {
            signedContract.on('Created', () => {
                setLoading(false);
                setApproved(false);
            });
        }
    }, []);

    const onChangeRange = (event: React.FormEvent<HTMLInputElement>): void => {
        setRange(parseInt(event.target.value));
    };

    const onChangeNetwork = (event: React.FormEvent<HTMLInputElement>): void => {
        setNetwork(event.target.value);
    };

    const onChangeToken = (event: React.FormEvent<HTMLInputElement>): void => {
        setToken(event.target.value);
    };

    const createFlip = async (
        secret: Buffer,
        clearSecret: string,
        clearValue: boolean,
        token: string,
        amount: string,
    ) => {
        try {
            console.log('creating flip', signedContract);

            console.log(secret, token, amount);

            setLoading(true);

            const response = await signedContract.create(
                secret,
                token,
                amount,
            );

            let secrets = localStorage.getItem('secrets');

            const secretObject = {
                secret: clearSecret,
                secretValue: clearValue,
                hash: response.hash,
            };

            if (!secrets) {
                secrets = JSON.stringify([secretObject]);
            } else {
                secrets = JSON.stringify([...JSON.parse(secrets), secretObject]);
            }

            localStorage.setItem('secrets', secrets);

            console.log('sendQuery response', response);
        } catch (e) {
            console.log('e', e);
        }
    }

    const onSubmit = async (event: React.FormEvent<HTMLInputElement>): Promise<void> => {
        event.preventDefault();

        setLoading(true);

        const tokenContract = new Contract(token, tokenABI);
        const signedTokenContract = tokenContract.connect(signer);

        const adjustedRange = range / 100;

        if (!approved) {
            if (signedContract) {
                signedTokenContract.on('Approval', async (owner: any, spender: any, amount: any) => {
                    // Could interfere with other contracts?
                    if (owner === accounts[0]?.address && spender === addresses.flippening.bsc.testnet) {
                        setApproved(true);

                        setLoading(false);
                    }
                });
            }

            await approve(utils.parseEther(adjustedRange.toString()).toString(), tokenContract);

            return;
        }

        const secret = getRandomString(Math.random() * 12);
        const secretValue = true;
        const clearSecret = `${secret} ${secretValue}`;
        const hashedSecret = await sha256(clearSecret);

        console.log(`Make to store your secret so you can redeem the pot if you win: ${secret}`);

        await createFlip(hashedSecret, clearSecret, secretValue, token, utils.parseEther(adjustedRange.toString()).toString());
    }

    return <>
        <AccountsContext.Consumer>
            {
                accountsContext => (
                    <Container>
                        <Form onSubmit={onSubmit}>
                            <FloatingLabel controlId="floatingSelect" label="Select network">
                                <Form.Select onChange={onChangeNetwork} value={network}>
                                    <option value="bsc">Binance Smart Chain</option>
                                    <option disabled value="eth">Ethereum</option>
                                </Form.Select>
                            </FloatingLabel>

                            <Form.Group className="mb-3" controlId="token">
                                <Form.Label>Token address</Form.Label>
                                <Form.Control value={token} onChange={onChangeToken} type="text" placeholder="Enter token" />
                                <Form.Text className="text-muted"></Form.Text>
                            </Form.Group>

                            <ButtonGroup>
                                <Button onClick={() => setRange(10)} variant="outline-primary">0.1</Button>
                                <Button onClick={() => setRange(50)} variant="outline-primary">0.5</Button>
                                <Button onClick={() => setRange(70)} variant="outline-primary">0.7</Button>
                                <Button onClick={() => setRange(100)} variant="outline-primary">1</Button>
                            </ButtonGroup>

                            <Form.Range onChange={onChangeRange} value={range} min="0" max="100" id="flip-range" />

                            <p>Flip: {range / 100}</p>

                            <>
                                {
                                    !accountsContext.accounts &&
                                    <p>Connect before flipping!</p>
                                }
                            </>

                            <Button className={styles.submitButton} variant="warning" type="submit" disabled={ loading }>{ approved ? 'FLIP IT!' : 'Allow...' }</Button>{' '}
                        </Form>
                    </Container>
                )
            }
        </AccountsContext.Consumer>
    </>;
};
