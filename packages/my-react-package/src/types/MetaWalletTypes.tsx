export type BuildExecTransaction = {
    to: string
    value: number
    data: string
    operation: number
    targetTxGas: number
    baseGas: number
    gasPrice: number
    gasToken: string
    refundReceiver: string
    nonce: number
}