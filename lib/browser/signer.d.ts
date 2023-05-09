import { JsonRpcProvider, TransactionRequest, TransactionResponse } from '@ethersproject/providers';
import { VoidSigner } from 'ethers/lib/ethers';
export declare class ImpersonatedSigner extends VoidSigner {
    readonly provider: JsonRpcProvider;
    constructor(address: string, provider: JsonRpcProvider);
    sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
}
