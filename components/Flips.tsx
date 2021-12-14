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
import { isExpired, timeUntilExpiration, timeUntilRetrieval } from '../lib/time';

const pageSize = 6;

const flips = memo(() => {
    const flipsProvider = FlipsProvider();

    let { accounts } = useContext(AccountsContext) || {}
    const account = accounts?.length > 0 ? accounts[0] : {};

    const [ page, setPage ] = useState(1);
    const [ tab, setTab ] = React.useState(0);

    // @ts-ignore
    const changePage = (event: any, val: any) => {
        setPage(val);
    };

    const getEvents = async () => {
        const currentBlock = await provider.getBlockNumber();
        const eventFilter = signedContract.filters.Created();
        let events = await signedContract.queryFilter(eventFilter, 0, currentBlock);

        let newEvents: FlipType[] = [];

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
                    timestamp: (await event.getBlock()).timestamp,
                    args: {
                        amount: event?.args?.amount,
                        creator: event?.args?.creator,
                        index: BigNumber.from(event?.args?.index).toNumber(),
                        token: event?.args?.token,
                        symbol,
                    },
                });
            }
        }

        const guessedEvents = await getGuessedEvents();
        const settledEvents = await getSettledEvents();

        let updatedEvents = newEvents.map(flip => {
            guessedEvents.forEach(guess => {
                const guessIndex = BigNumber.from(guess?.args?.index).toNumber();
                const flipIndex = BigNumber.from(flip.args.index).toNumber();
                if (flipIndex !== guessIndex) {
                    return flip;
                }

                flip.args.guesser = guess?.args?.guesser;
                flip.args.guess = guess?.args?.guess;
            });

            settledEvents.forEach(settle => {
                const settleIndex = BigNumber.from(settle?.args?.index).toNumber();
                const flipIndex = BigNumber.from(flip.args.index).toNumber();
                if (flipIndex !== settleIndex) {
                    return flip;
                }

                flip.args.settler = settle?.args?.settler;
            });

            return flip;
        });

        if (newEvents && updatedEvents !== flipsProvider.flips) {
            await flipsProvider.saveFlips(updatedEvents);
        }

        return;
    };

    const getGuessedEvents = async () => {
        const currentBlock = await provider.getBlockNumber();
        const eventFilter = signedContract.filters.Guess();
        return signedContract.queryFilter(eventFilter, 0, currentBlock);
    };

    const getSettledEvents = async () => {
        const currentBlock = await provider.getBlockNumber();
        const eventFilter = signedContract.filters.Settled();
        return signedContract.queryFilter(eventFilter, 0, currentBlock);
    };

    useEffect(() => {
        if (signedContract) {
            signedContract.on('Guess', () => {
                getEvents();
            });

            signedContract.on('Created', () => {
                getEvents();
            });

            signedContract.on('Settled', () => {
                getEvents();
            });
        }

        getEvents();
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
        if (flip.args.guesser || isExpired(timeUntilExpiration(flip)) || isExpired(timeUntilRetrieval(flip))) {
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

    const retrievableFlips = sortedFlips((flip: FlipType) => {
        return (isExpired(timeUntilRetrieval(flip))) && ! isExpired(timeUntilExpiration(flip));
    });

    const expiredFlips = sortedFlips((flip: FlipType) => {
        return isExpired(timeUntilExpiration(flip));
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
                                <Tab label="Retrievable" { ...a11yProps(4) } />
                                <Tab label="Expired" { ...a11yProps(5) } />
                                <Tab label="Settled" { ...a11yProps(6) } />
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
                                { retrievableFlips?.flips && retrievableFlips.flips.length ? <>
                                    { expiredFlips.flips }
                                    <Pagination
                                        count={ Math.ceil(retrievableFlips.flipsLength / pageSize) }
                                        page={ page }
                                        onChange={ changePage }
                                        color="primary"
                                        defaultPage={ 1 }
                                    />
                                </> : <p>There are no flips that can be retrieved.</p> }
                            </div>
                            <div hidden={ tab !== 5 }>
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
                            <div hidden={ tab !== 6 }>
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
