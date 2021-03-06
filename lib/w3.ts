import { addresses } from './addresses';
import tokenABI from './tokenABI';
import flippeningABI from './flippeningABI';
import {
    ethers,
    Contract,
    providers,
    Signer,
} from 'ethers';

const determineFlippeningAddress = () => {
    if (process.env.NODE_ENV === 'production') {
        return addresses.flippening.ava.test.address;
    }

    return addresses.flippening.eth.local.address;
};

const determineDefaultTokenAddress = () => {
    if (process.env.NODE_ENV === 'production') {
        return addresses.tokens[0].address.testnet;
    }

    return addresses.tokens[0].address.local;
};

const determineRequiredChainId = () => {
    if (process.env.NODE_ENV === 'production') {
        return addresses.flippening.ava.test.id;
    }

    return addresses.flippening.eth.local.id;
};

const determineStartBlock = () => {
    if (process.env.NODE_ENV === 'production') {
        return addresses.flippening.ava.test.deploymentBlock;
    }

    return 0;
};

export let requiredChainId = determineRequiredChainId();
export let defaultTokenAddress = determineDefaultTokenAddress();
export let startBlock = determineStartBlock();

// Flippening contract
export let flippeningAddress = determineFlippeningAddress();
export let contract = new Contract(flippeningAddress, flippeningABI);
export let signedContract: Contract;

export const instantiateContract = (address: string) => {
    return new ethers.Contract(address, tokenABI);
};

// ERC20 token contract

// A Web3Provider wraps a standard Web3 provider, which is
// what Metamask injects as window.ethereum into each page
export let provider: providers.Web3Provider;
// The Metamask plugin also allows signing transactions to
// send ether and pay to change state within the blockchain.
// For this, you need the account signer...
export let signer: Signer;

export const ethEnabled = async () => {
    // @ts-ignore
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        try {
            // @ts-ignore
            window.ethereum.enable();
            // @ts-ignore
            provider = new providers.Web3Provider(window.ethereum);

            signer = provider.getSigner();
            signedContract = contract.connect(signer);

            return true;
        } catch (e) {
            console.log('User denied access', e);
        }
    }

    return false;
};

export const isAddress = (token: string) => {
    return ethers.utils.isAddress(token);
};

// Allow the flippening contract to execute provided erch20Contract token contract functions on behalf of this wallet.
export const approve = async (
    wei: string,
    erc20Contract: any,
) => {
    try {
        const erc20 = erc20Contract.connect(signer);

        const response = await erc20.approve(flippeningAddress, wei);

        console.log('approveQuery response', response);
    } catch(e) {
        console.log('e', e);
    }
};

export const checkAllowance = async (userAddress: string, token: string): Promise<number> => {

    // Something is causing this to be undefined when flipping
    // so prevent making the call and ethers erroring
    if (typeof token === 'undefined') {
        return 0;
    }
    try {
        const tokenContract = new Contract(token, tokenABI);
        const signedTokenContract = tokenContract.connect(signer);
        const allowance = await signedTokenContract.allowance(userAddress, flippeningAddress);
        return parseInt(allowance.toString());
    } catch (error) {
        console.log(error);
    }

    return 0;
};

export const getNetwork = async () => {
    const network = await provider.getNetwork();
    return network.chainId;
};
