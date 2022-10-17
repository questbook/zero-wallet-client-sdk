import axios from 'axios';
import { ethers, Wallet } from 'ethers';
import { BuildExecTx } from './types/MetaWalletTypes';

const EIP712_WALLET_TX_TYPE = {
    WalletTx: [
        { type: 'address', name: 'to' },
        { type: 'uint256', name: 'value' },
        { type: 'bytes', name: 'data' },
        { type: 'uint8', name: 'operation' },
        { type: 'uint256', name: 'targetTxGas' },
        { type: 'uint256', name: 'baseGas' },
        { type: 'uint256', name: 'gasPrice' },
        { type: 'address', name: 'gasToken' },
        { type: 'address', name: 'refundReceiver' },
        { type: 'uint256', name: 'nonce' },
    ],
}
// const abiCoder = new ethers.utils.AbiCoder();

class MetaWallet {
    address: string;
    gasStations = {} as {
        [key: string]: string
    };
    TxBuilders = {} as {
        [key: string]: string
    };
    authorizeEndpoints = {} as {
        [key: string]: string
    }
    nonceProviders = {} as {
        [key: string]: string
    }

    webWallet: Wallet;

    constructor() {
        ///creating a new Wallet if no privateKey is found in the localStorage
        let privateKey: string | null = null;
        try {
            privateKey = localStorage.getItem('webwalletPrivateKey');
        } catch {

        }

        let newWebWallet: Wallet = Wallet.createRandom();
        if (!privateKey) {
            try {
                localStorage.setItem('webwalletPrivateKey', newWebWallet.privateKey);
            } catch {

            }
        }
        ///creating a wallet from localStorage privateKey
        else {
            try {
                newWebWallet = new Wallet(privateKey);
            } catch {
                localStorage.setItem('webwalletPrivateKey', newWebWallet.privateKey);
            }
        }

        this.webWallet = newWebWallet;
        this.address = newWebWallet.address;
    }

    /**
     * Attach a gas station with this wallet to so it can be used 
     * as a relayer later
     * 
     * @param {string} gas_station - name of the gas station
     * @param {string} api_key - The API key (endpoint) of the gas station
     * @returns {void}
     */
    attachGasStation = (gas_station: string, api_key: string): void => {
        this.gasStations[gas_station] = api_key;
    }
    /**
         * Attach a gas station with this wallet to so it can be used 
         * as a relayer later
         * 
         * @param {string} txBuilder - name of the Tx Builder
         * @param {string} api_key - The API key (endpoint) of the Tx Builder
         * @returns {void}
         */
    attachTxBuilder = (TxBuilder: string, api_key: string): void => {
        this.TxBuilders[TxBuilder] = api_key;
    }
    /**
         * Attach an authorize Endpoint for the wallet 
         * as a relayer later
         * 
         * @param {string} authorizeEndpoint - name of the authorizeEndpoint
         * @param {string} api_key - The API key (endpoint) of the authorizeEndpoint
         * @returns {void}
         */
    attachAuthorizeEndpoint = (authorizeEndpoint: string, api_key: string): void => {
        this.authorizeEndpoints[authorizeEndpoint] = api_key;
    }
    async hi() {
        const res = await fetch('http://example.com');
        return res;
    }
    authorize = async (authorizeEndpoint: string): Promise<boolean> => {

        if (!this.authorizeEndpoints[authorizeEndpoint]) {
            throw new Error("authorizeEndpoint is not attached");
        }

        const response = await axios.post(this.authorizeEndpoints[authorizeEndpoint],
            {
                'webwallet_address': this.address,
            })

        return !!response.data?.authorize;
    }

    // @TODO: attach an API endpoint to call when building the execution transaction (using biconomy)

    /**
             * sign the transaction
             * 
             * @param {string} scwAddress - Address of the smart contract wallet 
             * @param {string} chainId - chain Id of the transaction
             * @param {any} safeTxBody - the transaction built by TxBuilder 
             * @returns {Promise<string>} the signed transaction
             */
    async getSignedTx(scwAddress: string, chainId: string, safeTxBody: BuildExecTx): Promise<string> {

        const signature = await this.webWallet._signTypedData({
            verifyingContract: scwAddress,
            chainId: ethers.BigNumber.from(chainId),
        }, EIP712_WALLET_TX_TYPE, safeTxBody);

        let newSignature = '0x'
        newSignature += signature.slice(2);

        return newSignature;
    }

    attachNonceProvider = (nonceProvider: string, api_key: string): void => {
        this.nonceProviders[nonceProvider] = api_key;
    }

    getNonce = async (nonceProvider: string): Promise<string> => {
        if (!this.nonceProviders[nonceProvider]) {
            throw new Error("nonce Provider is not attached");
        }

        const nonce: string | null = localStorage.getItem('nonce');

        if (nonce) return nonce;

        const response = await axios.post(this.nonceProviders[nonceProvider],
            {
                webwallet_address: this.webWallet.address,
            });


        if (response.data && response.data.nonce !== 'Token expired') {

            localStorage.setItem('nonce', response.data.nonce);
            return response.data.nonce;
        }

        throw new Error("wallet is not authorized");
    }

    signNonce = async (nonce: string):
        Promise<{ v: number, r: string, s: string, transactionHash: string }> => {
        const nonceHash = ethers.utils.hashMessage(nonce)
        const nonceSigString: string = await this.webWallet.signMessage(nonce)
        const nonceSig: ethers.Signature = ethers.utils.splitSignature(nonceSigString)

        return { v: nonceSig.v, r: nonceSig.r, s: nonceSig.s, transactionHash: nonceHash }
    }
};

export {
    MetaWallet
}

