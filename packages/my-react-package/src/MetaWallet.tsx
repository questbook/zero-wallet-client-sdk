import { Wallet } from 'ethers';

// let EIP712_SAFE_TX_TYPE = {
//     // "SafeTx(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,uint256 nonce)"
//     SafeTx: [
//       { type: "address", name: "to" },
//       { type: "uint256", name: "value" },
//       { type: "bytes", name: "data" },
//       { type: "uint8", name: "operation" },
//       { type: "uint256", name: "safeTxGas" },
//       { type: "uint256", name: "baseGas" },
//       { type: "uint256", name: "gasPrice" },
//       { type: "address", name: "gasToken" },
//       { type: "address", name: "refundReceiver" },
//       { type: "uint256", name: "nonce" },
//     ],
//   };
// const abiCoder = new ethers.utils.AbiCoder();

class MetaWallet {
    address: string;
    gasStations: {
        [key: string]: string
    };
    TXBuilders: {
        [key: string]: string
    };
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
         * @param {string} txBuilder - name of the TX Builder
         * @param {string} api_key - The API key (endpoint) of the TX Builder
         * @returns {void}
         */
    attachTXBuilder = (TXBuilder: string, api_key: string): void => {
        this.TXBuilders[TXBuilder] = api_key;
    }

    // @TODO: attach an API endpoint to call when building the execution transaction (using biconomy)

    // @TODO: get the right way to sign the transaction based on biconomy
    async getSignedTX(argsTypes: Array<string>, argsValues: Array<any>, functionName: string, functionParamsInterface: string) {

        let x = { argsTypes, argsValues, functionName, functionParamsInterface };
        return x;

    }

};

export {
    MetaWallet
}

