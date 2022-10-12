import { ethers, Wallet } from 'ethers';
import { BuildExecTransaction } from './types/MetaWalletTypes';

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
    gasStations: {
        [key: string]: string
    };
    TxBuilders: {
        [key: string]: string
    };
    authorizeEndpoints: {
        [key: string]: string
    }
    webWallet: Wallet;

    constructor() {
        ///creating a new Wallet if no privateKey is found in the localStorage
        const privateKey: string | null = localStorage.getItem('webwalletPrivateKey');
        let newWebWallet: Wallet = Wallet.createRandom();
        if (!privateKey) {
            localStorage.setItem('webwalletPrivateKey', newWebWallet.privateKey);
        }
        ///creating a wallet from localStorage privateKey
        else {
            try {
                newWebWallet = new Wallet(privateKey);
            } catch {
                localStorage.setItem('webwalletPrivateKey', newWebWallet.privateKey);
            }
        }
        console.log('ww', localStorage.getItem('webwalletPrivateKey'));
        this.webWallet = newWebWallet;
        this.address = newWebWallet.address;
        this.gasStations = {};
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

    // @TODO: attach an API endpoint to call when building the execution transaction (using biconomy)

    /**
             * sign the transaction
             * 
             * @param {string} scwAddress - Address of the smart contract wallet 
             * @param {string} chainId - chain Id of the transaction
             * @param {any} safeTxBody - the transaction built by TxBuilder 
             * @returns {Promise<string>} the signed transaction
             */
    async getSignedTx(scwAddress: string, chainId: string, safeTxBody: BuildExecTransaction): Promise<string> {

        const signature = await this.webWallet._signTypedData({
            verifyingContract: scwAddress,
            chainId: ethers.BigNumber.from(chainId),
        }, EIP712_WALLET_TX_TYPE, safeTxBody);

        let newSignature = '0x'
        newSignature += signature.slice(2);

        return newSignature;
    }

};

export {
    MetaWallet
}

