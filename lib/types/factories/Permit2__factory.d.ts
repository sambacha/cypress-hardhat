import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { Permit2, Permit2Interface } from "../Permit2";
export declare class Permit2__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly name: "allowance";
        readonly outputs: readonly [{
            readonly internalType: "uint160";
            readonly name: "amount";
            readonly type: "uint160";
        }, {
            readonly internalType: "uint48";
            readonly name: "expiration";
            readonly type: "uint48";
        }, {
            readonly internalType: "uint48";
            readonly name: "nonce";
            readonly type: "uint48";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): Permit2Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): Permit2;
}
