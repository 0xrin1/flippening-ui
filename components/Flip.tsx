import React, { useState, useContext, memo } from 'react';
import { AccountsContext } from '../context/AccountContext';
import { FlipType } from '../interfaces';
import { approve, flippeningAddress, signedContract, signer } from '../lib/w3';
import styles from '../styles/Flip.module.scss';
import { BigNumber, Contract, utils } from 'ethers';
import tokenABI from '../lib/tokenABI';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import formStyles from '../styles/FlipForm.module.scss';
import 'react-bootstrap';

type PropTypes = {
    flip: FlipType,
    guesses: any[], // TODO: type
    settles: any[], // TODO: type
}

// export default function Flip({
const flip = memo(({
    flip,
    guesses,
    settles,
}: PropTypes) => {
    let { accounts } = useContext(AccountsContext) || {};
    let [ guessApproved, setGuessApproved ] = useState(false);

    const account = accounts.length > 0 ? accounts[0] : {};

    const collect = async (index: number, clearSecretString: string) => {
        await signedContract.settle(index, clearSecretString);
    };

    const guess = async (flip: any) => {
        if (guessApproved && signedContract) {
            await signedContract.guess(flip.args.index.toString(), `${Math.random() < 0.5}`);

            return;
        }

        const tokenContract = new Contract(flip.args.token, tokenABI);
        const signedTokenContract = tokenContract.connect(signer);

        signedTokenContract.on('Approval', async (owner: any, spender: any) => {
            if (account.address && owner === account.address && spender === flippeningAddress) {
                setGuessApproved(true);
            }
        });

        approve(flip.args.amount, signedTokenContract);
    };

    const getMatchedGuess = (guesses: any, flip: any): any => {
        let matchedGuess: any;
        const flipIndex = BigNumber.from(flip.args.index).toNumber();

        if (guesses) {
            guesses.forEach((guess: any) => {
                if (BigNumber.from(guess.args.index).toNumber() === flipIndex) {
                    matchedGuess = guess;
                }
            });
        }

        return matchedGuess;
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
    };

    const winDisplay = (settles: any, matchedSecret: any, matchedGuess: any) => {
        let win = <></>;

        if (matchedSecret && matchedGuess) {
            win = <div>
                <p className="mb-2 fw-bolder">win</p>
                <div>no</div>
            </div>;

            if (JSON.stringify(matchedSecret.secretValue) !== matchedGuess?.args.guess) {
                const collectClick = () => {
                    collect(BigNumber.from(matchedGuess.args.index).toNumber(), matchedSecret.secret);
                };

                win = <><p className="mb-2 fw-bolder">win</p>
                    <div>
                        <Button
                            className={ formStyles.submitButton }
                            variant="contained"
                            color="success"
                            onClick={ collectClick }
                        >
                            collect
                        </Button>
                    </div>
                </>;
            }
        }

        if (matchedGuess && settles) {
            settles.forEach((settle: any) => {
                if (BigNumber.from(settle.args.index).toNumber() === BigNumber.from(matchedGuess.args.index).toNumber()) {
                    win = <div>
                        <p className="mb-2 fw-bolder">win</p>
                        <div>yes, and settled</div>
                    </div>;
                }
            });
        }

        return win;
    };

    const hasWon = (matchedSecret: any, matchedGuess: any): boolean => {
        if (! matchedSecret?.secretValue || ! matchedGuess) {
            return false;
        }

        return JSON.stringify(matchedSecret.secretValue) !== matchedGuess.args.guess;
    };

    const matchedGuess = getMatchedGuess(guesses, flip);
    const matchedSecret = getMatchedSecret(flip);
    const amount = utils.formatEther(BigNumber.from(flip.args.amount).toString()).toString();
    const won: boolean = hasWon(matchedSecret, matchedGuess);
    const yours: boolean = account.address === flip?.args?.creator;
    const symbol = flip?.args?.symbol;

    const guessClick = () => {
        guess(flip);
    };

    return <>
        <Accordion key={ flip.blockNumber }>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <div className={ styles.accordionHeader }>
                    <Typography>{ amount } { symbol }</Typography>
                    <Typography>{ matchedSecret && matchedGuess ? (won ? 'won' : 'lost') : '' }</Typography>
                    <Typography>{ yours ? 'Your flip' : '' }</Typography>
                </div>
            </AccordionSummary>
            <AccordionDetails>
                <div>
                    <p className="mb-2 fw-bolder">creator</p>
                    <div className="mb-3">
                        { flip.args.creator }
                    </div>
                </div>
                { matchedGuess?.args.guesser && <div>
                    <p className="mb-2 fw-bolder">guesser</p>
                    <div className="mb-3">
                        { matchedGuess?.args.guesser }
                    </div>
                </div> }
                { matchedSecret?.secretValue && <div>
                    <p className="mb-2 fw-bolder">secret</p>
                    <div className="mb-3">
                        { JSON.stringify(matchedSecret.secretValue) }
                    </div>
                </div> }
                { matchedGuess?.args.guess ? <div>
                    <p className="mb-2 fw-bolder">guess</p>
                    <div className="mb-3">
                        { matchedGuess?.args.guess }
                    </div>
                </div> : <div>
                    <div className="mb-3">
                        <Button
                            className={ formStyles.submitButton }
                            variant="contained"
                            color="warning"
                            onClick={ guessClick }
                        >
                            { guessApproved ? 'submit guess' : 'approve to guess' }
                        </Button>
                    </div>
                </div> }
                { winDisplay(settles, matchedSecret, matchedGuess) }
            </AccordionDetails>
        </Accordion>
    </>;
});

export default flip;
