export interface WebHookAttributes {
    signedNonce: {
        v: number;
        r: string;
        s: string;
        transactionHash: string;
    };
    nonce: string;
    to: string;
    chain_id: number;
}