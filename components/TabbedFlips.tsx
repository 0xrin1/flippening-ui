import React, { useState, memo } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Flip from './Flip';
import PaginatedFlips from './PaginatedFlips';
import styles from '../styles/Flip.module.scss';
import { FlipType } from '../interfaces';
import { isExpired, timeUntilExpiration, timeUntilRetrieval } from '../lib/time';

type Props = {
    flips: any,
    account: any,
};

const pageSize = 6;

const tabbedFlips = memo(({
    flips,
    account,
}: Props) => {
    const [ page, setPage ] = useState(1);
    const [ tab, setTab ] = React.useState(0);

    // @ts-ignore
    const changePage = (event: any, val: any) => {
        setPage(val);
    };

    const sortedFlips = (condition: (flip: FlipType) => boolean) => {
        const flipsInfo = {
            flips: [],
            flipsLength: 0,
        };

        if (flips && flips.length > 0) {
            const filteredFlips = flips
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
                flips && flips.length > 0
                    ? <>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }} className="mb-2">
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
                        <div>
                            <div hidden={ tab !== 0 } className={ styles.flipTabElement }>
                                { PaginatedFlips({
                                    pageSize,
                                    page,
                                    changePage,
                                    flips: openFlips,
                                    noFlips: 'There are no open flips.',
                                }) }
                            </div>
                            <div hidden={ tab !== 1 }>
                                { PaginatedFlips({
                                    pageSize,
                                    page,
                                    changePage,
                                    flips: allFlips,
                                    noFlips: 'There are no flips',
                                }) }
                            </div>
                            <div hidden={ tab !== 2 }>
                                { PaginatedFlips({
                                    pageSize,
                                    page,
                                    changePage,
                                    flips: myFlips,
                                    noFlips: 'You have made no flips.',
                                }) }
                            </div>
                            <div hidden={ tab !== 3 }>
                                { PaginatedFlips({
                                    pageSize,
                                    page,
                                    changePage,
                                    flips: guessedFlips,
                                    noFlips: 'There are no filps with guesses.',
                                }) }
                            </div>
                            <div hidden={ tab !== 4 }>
                                { PaginatedFlips({
                                    pageSize,
                                    page,
                                    changePage,
                                    flips: retrievableFlips,
                                    noFlips: 'There are no flips that can be retrieved.',
                                }) }
                            </div>
                            <div hidden={ tab !== 5 }>
                                { PaginatedFlips({
                                    pageSize,
                                    page,
                                    changePage,
                                    flips: expiredFlips,
                                    noFlips: 'There are no expired flips.',
                                }) }
                            </div>
                            <div hidden={ tab !== 6 }>
                                { PaginatedFlips({
                                    pageSize,
                                    page,
                                    changePage,
                                    flips: settledFlips,
                                    noFlips: 'There are no settled flips.',
                                }) }
                            </div>
                        </div>
                    </>
                    : <p>There are no flips yet...</p>
            }
        </>
    );
});

export default tabbedFlips;
