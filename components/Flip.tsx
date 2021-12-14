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
import { Container, Row, Col } from 'react-bootstrap';

type PropTypes = {
    flip: FlipType,
}

// export default function Flip({
const flip = memo(({
    flip,
}: PropTypes) => {
    let { accounts } = useContext(AccountsContext) || {};
    const account = accounts?.length > 0 ? accounts[0] : {};

    let [ guessApproved, setGuessApproved ] = useState(false);

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

    const winDisplay = (matchedSecret: any) => {
        let win = <></>;

        if (matchedSecret && flip?.args?.guess && JSON.stringify(matchedSecret.secretValue) !== flip?.args?.guess) {
            const collectClick = () => {
                collect(BigNumber.from(flip?.args?.index).toNumber(), matchedSecret.secret);
            };

            win = <div>
                <Button
                    className={ formStyles.submitButton }
                    variant="contained"
                    color="success"
                    onClick={ collectClick }
                >
                    collect
                </Button>
            </div>
        }

        if (flip?.args?.guess && Boolean(flip?.args?.settler)) {
            win = <div>
                <p className="mb-2 fw-bolder">win</p>
                <div>settled</div>
            </div>;
        }

        return win;
    };

    const hasWon = (matchedSecret: any): boolean => {
        if (! matchedSecret?.secretValue || ! flip?.args?.guess) {
            return false;
        }

        return JSON.stringify(matchedSecret.secretValue) !== flip.args.guess;
    };

    const matchedSecret = getMatchedSecret(flip);
    const amount = utils.formatEther(BigNumber.from(flip.args.amount).toString()).toString();
    const won: boolean = hasWon(matchedSecret);
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
                <Container className={ styles.accordionHeader }>
                    <Row>
                        <Col md="3">
                            <Typography>#{ flip.blockNumber }</Typography>
                        </Col>
                        <Col md="3">
                            <Typography>{ amount } { symbol }</Typography>
                        </Col>
                        <Col md="3">
                            <Typography>{ matchedSecret && flip?.args?.guess ? (won ? 'won' : 'lost') : '' }</Typography>
                        </Col>
                        <Col md="3">
                            <Typography>{ yours ? 'mine' : '' }</Typography>
                        </Col>
                    </Row>
                </Container>
            </AccordionSummary>
            <AccordionDetails>
                <div>
                    <p className="mb-2 fw-bolder">creator</p>
                    <div className="mb-3">
                        { flip.args.creator }
                    </div>
                </div>
                { flip?.args.guesser && <div>
                    <p className="mb-2 fw-bolder">guesser</p>
                    <div className="mb-3">
                        { flip?.args.guesser }
                    </div>
                </div> }
                { (matchedSecret?.secretValue === true || matchedSecret?.secretValue === false) && <div>
                    <p className="mb-2 fw-bolder">secret</p>
                    <div className="mb-3">
                        { JSON.stringify(matchedSecret.secretValue) }
                    </div>
                </div> }
                { flip?.args.guess ? <div>
                    <p className="mb-2 fw-bolder">guess</p>
                    <div className="mb-3">
                        { flip?.args.guess }
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
                { winDisplay(matchedSecret) }
            </AccordionDetails>
        </Accordion>
    </>;
});

export default flip;
