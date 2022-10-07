import { ContractJson, AbiItem, ContractsJson } from './types/MetaContractTypes';
import { MetaWallet } from './MetaWallet';
import { ContractWithWallet } from './ContractWithWallet';
import { ethers } from 'ethers';

function enableNoSuchMethod(obj: MetaContract) {
    return new Proxy(obj, {
        get(target, p: string) {
            if (p in target) {
                return target[p];
            }
            else if (target["supportedChains"].includes(p.toLowerCase())) {
                return async function (...args: any) {
                    let newArgs = [p];
                    newArgs.push(...args);
                    return await target.addChain.call(target, ...newArgs);
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

class MetaContract {

    // Store different chains' contracts information
    private supportedChains =
        [
            "CELO_MAINNET",
            "GOERLI_TESTNET",
            "OPTIMISM_MAINNET",
            "POLYGON_MAINNET"
        ] as Array<string>;
        
    contract = {} as ContractsJson;
    [key: string]: any;
    __noSuchMethod__: () => void;

    constructor() {
        this.supportedChains.forEach((chain: string) => { this.contract[chain] = null; });
        this.__noSuchMethod__ = function (): void {
            throw new Error("No such function / Chain provided is not supported yet!");
        }
        return enableNoSuchMethod(this);
    }

    /**
     * Adds a generic chain contract
     * 
     * @param {string} chain - The chain of this contract
     * @param {Array<AbiItem>} abi - The contract's ABI
     * @param {string} contractAddress - The contract's address
     * @returns {void}
     * 
    */
    addChain(chain: string, abi: Array<AbiItem>, contractAddress: string): void {
        console.log(chain, abi, contractAddress);
        this.contract[chain] = {
            abi: abi,
            address: contractAddress,
            ethersInstance:new ethers.Contract(contractAddress,abi)
        }
    }

    /**
     * Gets the information about the contract for a given chain
     * 
     * @param {string} chain
     * @returns {ContractJson | null} - Contract details (abi, ContractAddress)
     */
    getChainJson(chain: string): ContractJson | null {
        return this.contract[chain];
    }

    /**
     * Attach a wallet with a contract to be able to call the contract
     * using the attached wallet
     * 
     * @param {MetaWallet} wallet 
     * @returns {ContractWithWallet} - Object to interact with the relayer
     * 
     */
    attach(wallet: MetaWallet): ContractWithWallet {
        return new ContractWithWallet(this, wallet);
    }

}

export {
    MetaContract
};