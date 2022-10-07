import { Contract } from "ethers"

export interface ArgsJSON {
    name: string,
    type: string,
    value: any
}

export interface ArgsNames {
    [key: string]: any
}

export interface AbiInputsItem {
    components?: Array<any>,
    internalType: string,
    name: string,
    type: string,
    indexed?: boolean
}

export interface AbiItem {
    name: string,
    type: string,
    inputs: Array<AbiInputsItem>,
    stateMutability?: string,
    anonymous?: boolean,
    outputs?: Array<any>
}

export interface ContractJson {
        abi: Array<AbiItem>,
        address: string,
        ethersInstance:Contract
} 

export interface ContractsJson {
    [chain: string]: ContractJson | null
}