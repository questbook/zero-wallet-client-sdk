import axios from 'axios';
import { MetaContract } from './MetaContract';
import { MetaWallet } from './MetaWallet';
import { WebHookAttributes } from './types/ContractWithWalletTypes';
import { ContractJson, ArgsJSON, AbiItem } from './types/MetaContractTypes';
import { BuildExecTx } from './types/MetaWalletTypes';

// const abiCoder = new ethers.utils.AbiCoder();

function enableNoSuchMethod(obj: ContractWithWallet) {
    return new Proxy(obj, {
        get(target, p: string) {
            if (p in target) {
                return target[p];
            }
            else if (target["chain"] && target["toGasStation"]) {
                return async function (...args: any) {
                    return await target.handleContractFunctionCall.call(target, p, args);
                }
            }
            else {
                return function (...args: any) {
                    return target.__noSuchMethod__.call(target, p, args);
                }
            }
        }
    });
}

class ContractWithWallet {
    contract: MetaContract;
    wallet: MetaWallet;
    chain: string | null;
    toGasStation: string | null;
    toTxBuilder: string | null;
    toNonceProvider: string | null;
    [key: string]: any;
    __noSuchMethod__: () => void;

    constructor(contract: MetaContract, wallet: MetaWallet) {
        this.contract = contract;
        this.wallet = wallet;
        this.chain = null;
        this.toGasStation = null;
        this.__noSuchMethod__ = function (): void {
            throw new Error("Chain or Relayer are not defined! Use both 'on' and 'to' methods.");
        }
        return enableNoSuchMethod(this);
    }

    /**
     * Checks & Validates the called function 
     * 
     * @param {string} name - Contract function name to execute
     * @param {any} args - Arguments of the function to execute
     * @returns 
     */
    async handleContractFunctionCall(name: string, args: any) {

        if (!this.toNonceProvider)
            throw new Error("No nonce provider specified");

        if (!this.chain)
            throw new Error("No chain specified");

        let contractJSON: ContractJson | null = this.contract.getChainJson(this.chain);

        if (!contractJSON)
            throw new Error("No Contract provided on the specified chain");

        let contractABI: Array<AbiItem> = contractJSON.abi;
        let contractAddress: string = contractJSON.address;

        // get the function definition
        let functionABIs = contractABI.filter(function (item: AbiItem) {
            return item.name === name && item.type === "function";
        });

        if (functionABIs.length === 0)
            throw new Error(`No such function in the contract provided at address ${contractAddress}!`);

        let functionABI: AbiItem = functionABIs[0];

        let actualNumParams = functionABI.inputs.length;

        if (actualNumParams !== args.length)
            throw new Error(`Invalid number of arguments! \nExpected ${functionABI.inputs.length} but instead got ${args.length}`)

        // TODO check for types validity

        let argsJSON: ArgsJSON[] = args.map((value: any, index: number) => {
            return {
                name: functionABI.inputs[index].name,
                value: value,
                type: functionABI.inputs[index].type
            }
        });

        const { safeTxBody, scwAddress } = await this.buildExecTx(this.contract.chain[this.chain].address, name, args);

        const signedTx = await this.wallet.getSignedTx(scwAddress, this.chain, safeTxBody);

        const nonce: string = await this.wallet.getNonce(this.toNonceProvider);

        const signedNonce: { v: number, r: string, s: string, transactionHash: string }
            = await this.wallet.signNonce(nonce);

        const webHookAttributes: WebHookAttributes = {
            'signedNonce': signedNonce,
            'nonce': nonce,
            'to': this.contract.address,
            'chain_id': this.contract.supportedChainsIDs[this.chain],
        };
        this.sendSignedTx(safeTxBody, scwAddress, signedTx, webHookAttributes);
    }



    // @TODO: implement a buildExecTransaction Method to build the transaction
    // by sending a post request to the server
    async buildExecTx(targetContractAddress: string, targetContractMethod: string, targetContractArgs: any)
        : Promise<{ safeTxBody: BuildExecTx, scwAddress: string }> {
        if (!this.toTxBuilder)
            throw new Error("No Tx builder Specified!");

        if (!this.chain || !this.contract.chain)
            throw new Error("No chain specified");

        if (!this.contract.chain[this.chain])
            throw new Error("Chain is no supported");

        const { data } = await this.contract.chain[this.chain].ethersInstance.populateTransaction[targetContractMethod](...targetContractArgs)
        const response = await axios.post
            <{ safeTxBody: BuildExecTx, scwAddress: string }>(this.toTxBuilder, {
                zeroWalletAddress: this.wallet.address,
                data,

                to: targetContractAddress
            });
        const { safeTxBody, scwAddress } = response.data;
        return { safeTxBody, scwAddress };
    }

    // @TODO: Check what needs to be modified here to work with the biconomy

    /**
     * Signs the transaction with this.wallet and then relay it to the
     * provided gas station
     * 
     * @param {string} functionName - Contract function name to execute
     * @param {ArgsJSON[]} argsJSON - Arguments of the function to execute
     * @returns 
     */
    async sendSignedTx(
        safeTxBody: BuildExecTx, scwAddress: string, signedTx: string, webHookAttributes: WebHookAttributes) {

        if (!this.toGasStation)
            throw new Error("No Gas Station Specified!");

        if (!this.chain)
            throw new Error("No chain specified");

        return await axios.post(this.toGasStation, {
            execTransactionBody: safeTxBody,
            walletAddress: scwAddress,
            signature: signedTx,
            webHookAttributes,
        })


    }

    /**
     * Sets the Gas Station to use
     * 
     * @param {string} gas_station - Name of gas station
     * @returns {ContractWithWallet}
     */
    to(gas_station: string): ContractWithWallet {
        this.toGasStation = this.wallet.gasStations[gas_station];
        return this;
    }
    /**
     * Sets the Tx builder to use
     * 
     * @param {string} TxBuilder - Name of Tx builder
     * @returns {ContractWithWallet}
     */
    setTxBuilder(TxBuilder: string): ContractWithWallet {
        this.toTxBuilder = this.wallet.TxBuilders[TxBuilder];
        return this;
    }

    setNonceProvider(nonceProvider: string): ContractWithWallet {
        this.toNonceProvider = this.wallet.nonceProviders[nonceProvider];
        return this;
    }
    /**
     * Sets the chain to use
     * 
     * @param {string} chain - Name of the chain
     * @returns {ContractWithWallet}
     */
    on(chain: string): ContractWithWallet {
        if (!this.contract.supportedChains[chain]) {
            throw new Error("Chain is no supported");
        }
        if (!this.contract.chain[chain]) {
            throw new Error("Chain is not attached");
        }
        this.chain = chain;
        return this;
    }
}

export {
    ContractWithWallet
}