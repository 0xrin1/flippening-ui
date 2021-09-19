import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { AccountsContext } from '../context/AccountContext';
import styles from '../styles/FlipForm.module.scss';
import { utils, Contract } from 'ethers';
import { contract, signedContract, approve, signer } from '../lib/w3';
import { getRandomString, sha256 } from '../lib/crypto';
import tokenABI from '../lib/tokenABI';

export default function FlipForm() {
    let [network, setNetwork] = useState('bsc');
    let [range, setRange] = useState(10);
    // let [token, setToken] = useState('0xae13d989dac2f0debff460ac112a837c89baa7cd');
    let [token, setToken] = useState('0x1429859428c0abc9c2c47c8ee9fbaf82cfa0f20f');
    let [approved, setApproved] = useState(false);

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
        token: string,
        amount: string,
    ) => {
        try {
            console.log('creating flip', signedContract);

            console.log(secret, token, amount);

            const response = await signedContract.create(
                secret,
                token,
                amount,
            );

            console.log('sendQuery response', response);
        } catch (e) {
            console.log('e', e);
        }
    }

    const onSubmit = async (event: React.FormEvent<HTMLInputElement>): Promise<void> => {
        event.preventDefault();

        const tokenContract = new Contract(token, tokenABI);

        if (!approved) {

            await approve(utils.parseEther(range.toString()).toString(), tokenContract);

            setApproved(true);

            return;
        }

        const secret = getRandomString(Math.random() * 12);
        const hashedSecret = await sha256(`${secret} true`);

        console.log(`Make to store your secret so you can redeem the pot if you win: ${secret}`);

        await createFlip(hashedSecret, token, utils.parseEther(range.toString()).toString());
    }

    return <>
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

                <AccountsContext.Consumer>
                    {accountsContext => (
                        <>
                            {
                                !accountsContext.accounts &&
                                <p>Connect before flipping!</p>
                            }
                        </>
                    )
                    }
                </AccountsContext.Consumer>

                <Button className={styles.submitButton} variant="warning" type="submit">FLIP IT!</Button>{' '}
            </Form>
        </Container>
    </>;
};
