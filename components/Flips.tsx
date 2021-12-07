import React, { useEffect, memo } from 'react';
import { ethers, BigNumber } from 'ethers';
import FlipsProvider, { FlipsContext } from '../context/FlipsContext';
import GuessProvider, { GuessContext } from '../context/GuessContext';
import SettleProvider, { SettleContext } from '../context/SettleContext';
import { signedContract } from '../lib/w3';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { instantiateContract, signer } from '../lib/w3';
import styles from '../styles/Flip.module.scss';

const flips = memo(() => {
    const flipsProvider = FlipsProvider();
    const guessProvider = GuessProvider();
    const settleProvider = SettleProvider();

    const getEvents = async () => {
        await getCreatedEvents();
        await getGuessedEvents();
        await getSettledEvents();
    };

    const getCreatedEvents = async () => {
        const eventFilter = signedContract.filters.Created();
        let events = await signedContract.queryFilter(eventFilter, 0);

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
                        symbol,
                    },
                });
            }
        }

        flipsProvider.saveFlips(newEvents);
    };

    const getGuessedEvents = async () => {
        const eventFilter = signedContract.filters.Guess();
        const events = await signedContract.queryFilter(eventFilter, 0);
        guessProvider.saveGuesses(events);
    };

    const getSettledEvents = async () => {
        const eventFilter = signedContract.filters.Settled();
        const events = await signedContract.queryFilter(eventFilter, 0);
        settleProvider.saveSettles(events);
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

    const collect = async (index: number, clearSecretString: string) => {
        await signedContract.settle(index, clearSecretString);
    };

    const getMatchedSecret = (flip: any): any => {
        const secrets = localStorage.getItem('secrets');

        let matchedSecret: any;
        if (secrets) {
            JSON.parse(secrets).forEach((secret: any) => {
                if (secret.hash === flip.transactionHash) {
                    matchedSecret = secret;
                }
            });
        }

        return matchedSecret;
    }

    const winDisplay = (settleContext: any, matchedSecret: any, matchedGuess: any) => {
        let win = <></>;

        if (matchedSecret && matchedGuess) {
            win = <div>
                <strong>win</strong>
                <div>no</div>
            </div>;

            if (JSON.stringify(matchedSecret.secretValue) !== matchedGuess?.args.guess) {
                const collectClick = () => {
                    collect(BigNumber.from(matchedGuess.args.index).toNumber(), matchedSecret.secret);
                };

                win = <div>
                    <strong>win</strong>
                    <div><button onClick={ collectClick }>collect</button></div>
                </div>;
            }
        }

        if (matchedGuess && settleContext.settles) {
            settleContext.settles.forEach((settle: any) => {
                if (BigNumber.from(settle.args.index).toNumber() === BigNumber.from(matchedGuess.args.index).toNumber()) {
                    win = <div>
                        <strong>win</strong>
                        <div>yes, and settled</div>
                    </div>;
                }
            });
        }

        return win;
    }

    return (
        <>
            <SettleContext.Provider value={ settleProvider }>
                <SettleContext.Consumer>
                    {(settleContext: any) => (
            <GuessContext.Provider value={ guessProvider }>
                <GuessContext.Consumer>
                    {(guessContext: any) => (
            <FlipsContext.Provider value={ flipsProvider }>
                <FlipsContext.Consumer>
                    {(context: any) => (
                        <>
                            <h2>Flips</h2>
                            <>
                                {
                                    (context.flips && context.flips.length > 0) ? context.flips.sort((a: any, b: any) => a.blockNumber < b.blockNumber).map((flip: any) => {
                                        const flipIndex = BigNumber.from(flip.args.index).toNumber();

                                        let matchedGuess: any;
                                        if (guessContext.guesses) {
                                            guessContext.guesses.forEach((guess: any) => {
                                                if (BigNumber.from(guess.args.index).toNumber() === flipIndex) {
                                                    matchedGuess = guess;
                                                }
                                            });
                                        }

                                        const matchedSecret = getMatchedSecret(flip);
                                        const win = winDisplay(settleContext, matchedSecret, matchedGuess);
                                        const amount = ethers.utils.formatEther(BigNumber.from(flip.args.amount).toString()).toString();

                                        const won: boolean = (matchedSecret?.secretValue && matchedGuess) ? JSON.stringify(matchedSecret.secretValue) !== matchedGuess.args.guess: false;

                                        return <Accordion key={ flip.blockNumber }>
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                aria-controls="panel1a-content"
                                                id="panel1a-header"
                                            >
                                                <div className={ styles.accordionHeader }>
                                                    <Typography>{ amount } { flip?.args?.symbol }</Typography>
                                                    <Typography>{ matchedSecret ? (won ? 'won' : 'lost') : '' }</Typography>
                                                    <Typography>{ matchedSecret ? 'Your flip' : '' }</Typography>
                                                </div>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <div>
                                                    <strong>creator</strong>
                                                    <div>{ flip.args.creator }</div>
                                                </div>
                                                { matchedGuess?.args.guesser && <div>
                                                    <strong>guesser</strong>
                                                    <div>{ matchedGuess?.args.guesser }</div>
                                                </div> }
                                                { matchedGuess?.args.guess && <div>
                                                    <strong>guess</strong>
                                                    <div>{ matchedGuess?.args.guess }</div>
                                                </div> }
                                                { matchedSecret?.secretValue && <div>
                                                    <strong>secret</strong>
                                                    <div>{ JSON.stringify(matchedSecret.secretValue) }</div>
                                                </div> }
                                                { win }
                                            </AccordionDetails>
                                        </Accordion>;
                                    })
                                    : <p>There are no flips yet...</p>
                                }
                            </>
                        </>
                    )}
                </FlipsContext.Consumer>
            </FlipsContext.Provider>
                    )}
                </GuessContext.Consumer>
            </GuessContext.Provider>
                    )}
                </SettleContext.Consumer>
            </SettleContext.Provider>
        </>
    );
});

export default flips;
