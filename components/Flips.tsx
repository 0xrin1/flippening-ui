import React, { useEffect, useContext, useState, memo } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import FlipsProvider from '../context/FlipsContext';
import GuessProvider from '../context/GuessContext';
import SettleProvider from '../context/SettleContext';
import { AccountsContext } from '../context/AccountContext';
import {
    instantiateContract,
    signer,
    signedContract,
    provider,
} from '../lib/w3';
import Flip from './Flip';
import styles from '../styles/Flip.module.scss';
import { FlipType } from '../interfaces';

const pageSize = 6;

const flips = memo(() => {
    const flipsProvider = FlipsProvider();
    const guessProvider = GuessProvider();
    const settleProvider = SettleProvider();

    let { accounts } = useContext(AccountsContext) || {}
    const account = accounts?.length > 0 ? accounts[0] : {};

    const [ page, setPage ] = useState(1);
    const [ tab, setTab ] = React.useState(0);

    const getEvents = async () => {
        await getCreatedEvents();
        await getGuessedEvents();
        await getSettledEvents();
    };

    // @ts-ignore
    const changePage = (event: any, val: any) => {
        setPage(val);
    }

    const getCreatedEvents = async () => {
        const currentBlock = await provider.getBlockNumber();
        const eventFilter = signedContract.filters.Created();
        // TODO: Only subtract 5000 when BSC chain because it sucks
        let events = await signedContract.queryFilter(eventFilter, currentBlock - 5000, currentBlock);

        let newEvents = [];

        for (let event of events) {
            if (event.args) {
                const tokenContract = instantiateContract(event?.args?.token).connect(signer);

                // Could make efficient by only checking symbol for addresses that symbol is not known for
                const symbol = await tokenContract.symbol();

                newEvents.push({
                    blockNumber: event.blockNumber,
                    blockHash: event.blockHash,
                    transactionHash: event.transactionHash,
                    address: event.address,
                    args: {
                        amount: event?.args?.amount,
                        creator: event?.args?.creator,
                        index: event?.args?.index,
                        token: event?.args?.token,
                        settled: false,
                        symbol,
                    },
                });
            }
        }

        if (newEvents && newEvents !== flipsProvider.flips) {
            flipsProvider.saveFlips(newEvents);
        }
    };

    const getGuessedEvents = async () => {
        const currentBlock = await provider.getBlockNumber();
        const eventFilter = signedContract.filters.Guess();
        // TODO: Only subtract 5000 when BSC chain because it sucks
        const events = await signedContract.queryFilter(eventFilter, currentBlock - 5000, currentBlock);

        if (events && events !== guessProvider.guesses) {
            flipsProvider.saveGuesses(events);
        }
    };

    const getSettledEvents = async () => {
        const currentBlock = await provider.getBlockNumber();
        const eventFilter = signedContract.filters.Settled();
        // TODO: Only subtract 5000 when BSC chain because it sucks
        const events = await signedContract.queryFilter(eventFilter, currentBlock - 5000, currentBlock);

        if (events && events !== settleProvider.saveSettles) {
            flipsProvider.saveSettles(events);
        }
    };

    useEffect(() => {
        getEvents();

        if (signedContract) {
            signedContract.on('Guess', () => {
                getGuessedEvents();
            });

            signedContract.on('Created', () => {
                getCreatedEvents();
            });

            signedContract.on('Settled', () => {
                getSettledEvents();
            });
        }
    }, []);

    const sortedFlips = (condition: any) => {
        let sortedFlips = [];

        if (flipsProvider.flips && flipsProvider.flips.length > 0) {
            let mapCounter = 0;
            sortedFlips = flipsProvider.flips.sort((a: any, b: any) => a.blockNumber < b.blockNumber)
            .flatMap((flip: any) => {
                mapCounter += 1;

                if (!condition(flip) || mapCounter > pageSize * page || mapCounter <= pageSize * (page - 1)) {
                    return [];
                }

                return [<Flip flip={ flip } guesses={ guessProvider.guesses } settles={ settleProvider.settles } />];
            });
        }

        return sortedFlips;
    };

    const a11yProps = (index: number) => {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    // @ts-ignore
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    return (
        <>
            {
                flipsProvider.flips
                    ? <>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={ tab } onChange={ handleChange }>
                                <Tab label="Open" { ...a11yProps(0) } />
                                <Tab label="All" { ...a11yProps(1) } />
                                <Tab label="Mine" { ...a11yProps(2) } />
                                <Tab label="Guessed" { ...a11yProps(3) } />
                                <Tab label="Expired" { ...a11yProps(4) } />
                                <Tab label="Settled" { ...a11yProps(5) } />
                            </Tabs>
                        </Box>
                        <div className={ styles.flipTabContainer }>
                            <div hidden={ tab !== 0 }>
                                { sortedFlips((flip: FlipType) => {
                                    if (flip.args.guesser) {
                                        return false;
                                    }

                                    return true;
                                }) }
                            </div>
                            <div hidden={ tab !== 1 }>
                                {
                                    //@ts-ignore
                                    sortedFlips((flip: FlipType) => {
                                        return true;
                                    })
                                }
                            </div>
                            <div hidden={ tab !== 2 }>
                                { sortedFlips((flip: FlipType) => {
                                    if (flip.args.guesser !== account?.address && flip.args.creator !== account?.address) {
                                        return false;
                                    }

                                    return true;
                                }) }
                            </div>
                            <div hidden={ tab !== 3 }>
                                Guessed
                            </div>
                            <div hidden={ tab !== 4 }>
                                Expired
                            </div>
                            <div hidden={ tab !== 5 }>
                                Settled
                            </div>
                        </div>
                        <Pagination
                            count={ Math.ceil(flipsProvider.flips.length / pageSize) }
                            page={ page }
                            onChange={ changePage }
                            color="primary"
                            defaultPage={ 1 }
                        />
                    </>
                    : <p>There are no flips yet...</p>
            }
        </>
    );
});

export default flips;
