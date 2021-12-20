import React, { useContext, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Input from '@mui/material/Input';
import InputBase from '@mui/material/InputBase';
import MenuItem from '@mui/material/MenuItem';
import Slider from '@mui/material/Slider';
import ButtonGroup from '@mui/material/ButtonGroup';
import { TravelExplore } from '@mui/icons-material';
import { AccountsContext } from '../context/AccountContext';
import { utils, Contract } from 'ethers';
import { getExplorerDomain, getActiveChains } from '../lib/addresses';
import {
    signedContract,
    approve,
    signer,
    defaultTokenAddress,
    flippeningAddress,
    checkAllowance,
    determineCurrentNetwork,
} from '../lib/w3';
import { getRandomString, sha256 } from '../lib/crypto';
import styles from '../styles/FlipForm.module.scss';
import tokenABI from '../lib/tokenABI';

export default function FlipForm() {
    let { accounts } = useContext(AccountsContext) || {};
    const account = accounts?.length > 0 ? accounts[0] : {};

    let [ network, setNetwork ] = useState('eth');
    let [ chains, setChains ] = useState({});
    let [ range, setRange ] = useState(10);
    let [ token, setToken ] = useState(defaultTokenAddress);
    let [ loading, setLoading ] = useState(false);
    let [ allowance, setAllowance ] = useState(0);

    let [ approved, setApproved ] = useState(false);

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

        // let currentNetwork = await determineCurrentNetwork();
        // setNetwork(currentNetwork.chain.network);

        let activeChains = getActiveChains();
        setChains(activeChains);
    }, []);

    const loadAllowance = async (accountAddress: string, tokenAddress: string) => {
        setAllowance(await checkAllowance(accountAddress, tokenAddress));
    };

    const onChangeRange = (event: any): void => {
        console.log('onChangeRange', onChangeRange);
        setRange(parseInt(event.target.value));
    };

    const onChangeNetwork = (event: any): void => {
        setNetwork(event.target.value);
    };

    const onChangeToken = (event: any): void => {
        console.log('On change token', event.target.value);

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

    const onClickTokenInfo = async (event: any): Promise<void> => {
        event.preventDefault();
        const url = `https://${getExplorerDomain(network)}/address/${token}`;

        const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
        if (newWindow) {
            newWindow.opener = null;
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
                        <form onSubmit={ onSubmit }>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="network-select-label">Select Network</InputLabel>
                                <Select
                                    labelId="networkSelect"
                                    value={ network }
                                    label="Select network"
                                    onChange={ onChangeNetwork }
                                >
                                    <MenuItem value="ava-test">Avalanche Testnet</MenuItem>
                                    <MenuItem value="eth" disabled>Ethereum</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth margin="normal">
                                <InputLabel id="address-input-label">Token address</InputLabel>
                                <Paper
                                    component="form"
                                    sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
                                >
                                    <InputBase
                                        sx={{ ml: 1, flex: 1 }}
                                        onChange={onChangeToken}
                                        placeholder="Enter token address"
                                        value={token}
                                    />
                                    <IconButton color="secondary" type="submit" sx={{ p: '10px' }} aria-label="search" title="View token info" onClick={onClickTokenInfo}>
                                        <TravelExplore />
                                    </IconButton>
                                </Paper>
                            </FormControl>
                            <FormControl fullWidth margin="normal">
                                <ButtonGroup variant="outlined" aria-label="outlined button group">
                                    <Button onClick={ () => setRange(10) }>0.1</Button>
                                    <Button onClick={ () => setRange(50) }>0.5</Button>
                                    <Button onClick={ () => setRange(70) }>0.7</Button>
                                    <Button onClick={ () => setRange(100) }>1</Button>
                                </ButtonGroup>
                                <Slider
                                    onChange={ onChangeRange }
                                    value={ range }
                                    id="flip-range"
                                />
                            </FormControl>

                            <p>Flip: { range / 100 }</p>

                            <>
                                {
                                    accountsContext && !accountsContext.accounts &&
                                        <p>Connect before flipping!</p>
                                }
                            </>

                            <Button className={ styles.submitButton } variant="contained" color="warning" type="submit" disabled={ loading }>{ allowance >= parseInt(amount) ? 'FLIP IT!' : 'Allow...' }</Button>{' '}
                        </form>
                    </Container>
                </Card>
            )}
        </AccountsContext.Consumer>
    </div>;
};
