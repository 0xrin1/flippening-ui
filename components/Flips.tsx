import React, { useEffect, useContext, useState, memo } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import FlipsProvider from '../context/FlipsContext';
import { AccountsContext } from '../context/AccountContext';
import {
    instantiateContract,
    signer,
    signedContract,
    provider,
} from '../lib/w3';
import { BigNumber } from 'ethers';
import Flip from './Flip';
import styles from '../styles/Flip.module.scss';
import { FlipType } from '../interfaces';

const pageSize = 6;

const flips = memo(() => {
    const flipsProvider = FlipsProvider();

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
                        index: BigNumber.from(event?.args?.index).toNumber(),
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

        if (events && flipsProvider.flips) {
            flipsProvider.saveGuesses(events);
        }
    };

    const getSettledEvents = async () => {
        const currentBlock = await provider.getBlockNumber();
        const eventFilter = signedContract.filters.Settled();
        // TODO: Only subtract 5000 when BSC chain because it sucks
        const events = await signedContract.queryFilter(eventFilter, currentBlock - 5000, currentBlock);

        if (events && flipsProvider.flips) {
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

    const sortedFlips = (condition: (flip: FlipType) => boolean) => {
        const flipsInfo = {
            flips: [],
            flipsLength: 0,
        };

        if (flipsProvider.flips && flipsProvider.flips.length > 0) {
            const filteredFlips = flipsProvider.flips
                .filter((flip: FlipType) => {
                    return condition(flip);
                });

            flipsInfo.flipsLength = filteredFlips.length;

            let mapCounter = 0;
            flipsInfo.flips = filteredFlips.sort((a: FlipType, b: FlipType) => a.blockNumber < b.blockNumber)
                .flatMap((flip: FlipType) => {
                    mapCounter += 1;

                    if (mapCounter > pageSize * page || mapCounter <= pageSize * (page - 1)) {
                        return [];
                    }

                    return [<Flip flip={ flip } key={ flip.args.index }/>];
                });
        }

        return flipsInfo;
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

    const openFlips = sortedFlips((flip: FlipType) => {
        if (flip.args.guesser) {
            return false;
        }

        return true;
    });

    // @ts-ignore
    const allFlips = sortedFlips((flip: FlipType) => {
        return true;
    });

    const myFlips = sortedFlips((flip: FlipType) => {
        if (flip.args.guesser !== account?.address && flip.args.creator !== account?.address) {
            return false;
        }

        return true;
    });

    const guessedFlips = sortedFlips((flip: FlipType) => {
        return Boolean(flip.args.guesser);
    });

    // @ts-ignore
    const expiredFlips = sortedFlips((flip: FlipType) => {
        // TODO
        return false;
    });

    const settledFlips = sortedFlips((flip: FlipType) => {
        return Boolean(flip.args.settler);
    });

    return (
        <>
            {
                flipsProvider.flips && flipsProvider.flips.length > 0
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
                                { openFlips?.flips && openFlips.flips.length > 0 ? <>
                                    { openFlips.flips }
                                    <Pagination
                                        count={ Math.ceil(openFlips.flipsLength / pageSize) }
                                        page={ page }
                                        onChange={ changePage }
                                        color="primary"
                                        defaultPage={ 1 }
                                    />
                                </> : <p>There are no open flips.</p> }
                            </div>
                            <div hidden={ tab !== 1 }>
                                { allFlips?.flips &&  <>
                                    { allFlips.flips }
                                    <Pagination
                                        count={ Math.ceil(allFlips.flipsLength / pageSize) }
                                        page={ page }
                                        onChange={ changePage }
                                        color="primary"
                                        defaultPage={ 1 }
                                    />
                                </> }
                            </div>
                            <div hidden={ tab !== 2 }>
                                { myFlips?.flips && myFlips.flips.length > 0 ? <>
                                    { myFlips.flips }
                                    <Pagination
                                        count={ Math.ceil(myFlips.flipsLength / pageSize) }
                                        page={ page }
                                        onChange={ changePage }
                                        color="primary"
                                        defaultPage={ 1 }
                                    />
                                </> : <p>Have have made no flips.</p> }
                            </div>
                            <div hidden={ tab !== 3 }>
                                { guessedFlips?.flips && guessedFlips.flips.length > 0 ? <>
                                    { guessedFlips.flips }
                                    <Pagination
                                        count={ Math.ceil(guessedFlips.flipsLength / pageSize) }
                                        page={ page }
                                        onChange={ changePage }
                                        color="primary"
                                        defaultPage={ 1 }
                                    />
                                </> : <p>There are no flips with guesses.</p> }
                            </div>
                            <div hidden={ tab !== 4 }>
                                { expiredFlips?.flips && expiredFlips.flips.length ? <>
                                    { expiredFlips.flips }
                                    <Pagination
                                        count={ Math.ceil(expiredFlips.flipsLength / pageSize) }
                                        page={ page }
                                        onChange={ changePage }
                                        color="primary"
                                        defaultPage={ 1 }
                                    />
                                </> : <p>There are no expired flips.</p> }
                            </div>
                            <div hidden={ tab !== 5 }>
                                { settledFlips?.flips && settledFlips.flips.length ? <>
                                    { settledFlips.flips }
                                    <Pagination
                                        count={ Math.ceil(settledFlips.flipsLength / pageSize) }
                                        page={ page }
                                        onChange={ changePage }
                                        color="primary"
                                        defaultPage={ 1 }
                                    />
                                </> : <p>There are no settled flips.</p> }
                            </div>
                        </div>
                    </>
                    : <p>There are no flips yet...</p>
            }
        </>
    );
});

export default flips;
