import React, { useContext, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import BSButton from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from '@mui/material/Button';
import { Card } from '@mui/material';
import { AccountsContext } from '../context/AccountContext';
import { utils, Contract } from 'ethers';
import {
    signedContract,
    approve,
    signer,
    defaultTokenAddress,
    flippeningAddress,
    checkAllowance,
} from '../lib/w3';
import { getRandomString, sha256 } from '../lib/crypto';
import styles from '../styles/FlipForm.module.scss';
import tokenABI from '../lib/tokenABI';

export default function FlipForm() {
    let { accounts } = useContext(AccountsContext) || {};
    const account = accounts?.length > 0 ? accounts[0] : {};

    let [ network, setNetwork ] = useState('bsc-test');
    let [ range, setRange ] = useState(10);
    let [ token, setToken ] = useState(defaultTokenAddress);
    let [ loading, setLoading ] = useState(false);
    let [ allowance, setAllowance ] = useState(0);

    useEffect(() => {
        if (signedContract) {
            signedContract.on('Created', () => {
                setLoading(false);
                loadAllowance(account.address, token);
            });
        }

        if (token && account?.address) {
            loadAllowance(account.address, token);
        }
    }, []);

    const loadAllowance = async (accountAddress: string, tokenAddress: string) => {
        const response = await checkAllowance(accountAddress, tokenAddress);
        setAllowance(response);
    };

    const onChangeRange = (event: any): void => {
        setRange(parseInt(event.target.value));
    };

    const onChangeNetwork = (event: any): void => {
        setNetwork(event.target.value);
    };

    const onChangeToken = (event: any): void => {
        setToken(event.target.value);

        if (token && account?.address) {
            loadAllowance(account.address, event.target.value);
        }
    };

    const parseSecrets = (secretObject: any, secrets?: any) => {
        if (secrets) {
            return JSON.stringify([...JSON.parse(secrets), secretObject]);
        }

        return secrets = JSON.stringify([secretObject]);
    };

    const createFlip = async (
        secret: Buffer,
        clearSecret: string,
        clearValue: string,
        token: string,
        amount: string,
    ) => {
        try {
            console.log('creating flip', signedContract);

            const response = await signedContract.create(
                secret,
                token,
                amount,
            );

            setLoading(true);

            console.log('create response', response);

            let secrets = localStorage.getItem('secrets');

            const secretObject = {
                secret: clearSecret,
                secretValue: clearValue === 'true',
                hash: response.hash,
            };

            secrets = parseSecrets(secretObject, secrets);

            localStorage.setItem('secrets', secrets);
        } catch (e) {
            console.log('e', e);
        }
    }

    const adjustedRange = range / 100;
    const amount = utils.parseEther(adjustedRange.toString()).toString();

    const onSubmit = async (event: any): Promise<void> => {
        event.preventDefault();

        setLoading(true);

        const tokenContract = new Contract(token, tokenABI);
        const signedTokenContract = tokenContract.connect(signer);

        if (allowance < parseInt(amount)) {
            if (signedContract) {
                signedTokenContract.on('Approval', async (owner: any, spender: any) => {
                    // Could interfere with other contracts?
                    if (owner === accounts[0]?.address && spender === flippeningAddress) {
                        setLoading(false);
                        loadAllowance(account.address, token);
                    }
                });
            }

            await approve(utils.parseEther(adjustedRange.toString()).toString(), tokenContract);

            return;
        }

        const secret = getRandomString(Math.random() * 12);
        const secretValue = `${Math.random() < 0.5}`;
        const clearSecret = `${secret} ${secretValue}`;
        const hashedSecret = await sha256(clearSecret);

        console.log(`Make to store your secret so you can redeem the pot if you win: ${secret} ${secretValue}}`);

        await createFlip(hashedSecret, clearSecret, secretValue, token, amount);
    }

    return <div>
        <AccountsContext.Consumer>
            {
                accountsContext => (
                        <Card variant="elevation">
                            <Container className="mb-4 mt-4">
                                <Form onSubmit={ onSubmit }>
                                    <FloatingLabel controlId="floatingSelect" label="Select network">
                                        <Form.Select onChange={ onChangeNetwork } value={ network }>
                                            <option value="bsc-test">Avalanche Testnet</option>
                                            <option disabled value="eth">Ethereum</option>
                                        </Form.Select>
                                    </FloatingLabel>

                                    <Form.Group className="mb-3" controlId="token">
                                        <Form.Label>Token address</Form.Label>
                                        <Form.Control value={ token } onChange={ onChangeToken } type="text" placeholder="Enter token" />
                                        <Form.Text className="text-muted"></Form.Text>
                                    </Form.Group>

                                    <ButtonGroup>
                                        <BSButton onClick={ () => setRange(10) } variant="outline-primary">0.1</BSButton>
                                        <BSButton onClick={ () => setRange(50) } variant="outline-primary">0.5</BSButton>
                                        <BSButton onClick={ () => setRange(70) } variant="outline-primary">0.7</BSButton>
                                        <BSButton onClick={ () => setRange(100) } variant="outline-primary">1</BSButton>
                                    </ButtonGroup>

                                    <Form.Range onChange={ onChangeRange } value={ range } min="0" max="100" id="flip-range" />

                                    <p>Flip: { range / 100 }</p>

                                    <>
                                        {
                                            accountsContext && !accountsContext.accounts &&
                                            <p>Connect before flipping!</p>
                                        }
                                    </>

                                    <Button className={ styles.submitButton } variant="contained" color="warning" type="submit" disabled={ loading }>{ allowance >= parseInt(amount) ? 'FLIP IT!' : 'Allow...' }</Button>{' '}
                                </Form>
                            </Container>
                        </Card>
                )
            }
        </AccountsContext.Consumer>
    </div>;
};
