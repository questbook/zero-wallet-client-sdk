import axios from 'axios';
import { MetaContract } from './MetaContract';
import { MetaWallet } from './MetaWallet';
import { ContractJson, ArgsJSON, AbiItem } from './types/MetaContractTypes';


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

        return this.sendSignedTransaction(name, argsJSON);
    }

    /**
     * Signs the transaction with this.wallet and then relay it to the
     * provided gas station
     * 
     * @param {string} functionName - Contract function name to execute
     * @param {ArgsJSON[]} argsJSON - Arguments of the function to execute
     * @returns 
     */

    // @TODO: implement a buildExecTransaction Method to build the transaction
    // by sending a post request to the server

    // @TODO: Check what needs to be modified here to work with the biconomy
    async sendSignedTransaction(functionName: string, argsJSON: ArgsJSON[]) {

        if (!this.toGasStation)
            throw new Error("No Gas Station Specified!");

        if (!this.chain)
            throw new Error("No chain specified");

        // array with the params types (in the same order as in the function definition)
        let argsTypes: Array<string> = argsJSON.map((param) => (param["type"]));

        // array with the values of the params 
        let argsValues: Array<any> = argsJSON.map((param) => (param["value"]));

        let finalArgs: any = this.wallet.getSignedTX(argsTypes, argsValues, functionName, "Fdsa");

        let txHash = await axios.post(this.toGasStation,
            {
                function: functionName,
                contract: this.contract.getChainJson(this.chain),
                args: finalArgs
            });
        return txHash;
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
     * Sets the chain to use
     * 
     * @param {string} chain - Name of the chain
     * @returns {ContractWithWallet}
     */
    on(chain: string): ContractWithWallet {
        this.chain = chain;
        return this;
    }
}

export {
    ContractWithWallet
}