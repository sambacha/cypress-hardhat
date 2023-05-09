import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber, BigNumberish } from 'ethers/lib/ethers';
import { AddressLike } from './types';
type ApprovalAddresses = {
    owner: AddressLike;
    token: AddressLike;
    spender: AddressLike;
};
type Permit2ApprovalAddresses = {
    owner: AddressLike;
    token: AddressLike;
    spender?: AddressLike;
};
export declare class ApprovalUtils {
    readonly provider: JsonRpcProvider;
    constructor(provider: JsonRpcProvider);
    /** Returns the address of the Universal Router for the current chain */
    get universalRouterAddress(): string;
    /** Returns the amount the spender is allowed by the owner to spend for the token. */
    getTokenAllowance(addresses: ApprovalAddresses): Promise<BigNumber>;
    /**
     * Sets the amount the spender is allowed by the owner to spend for the token.
     *
     * @param amount - number to set the allowance to (defaults to a max token approval of MaxUint256)
     * */
    setTokenAllowance(addresses: ApprovalAddresses, amount?: BigNumberish): Promise<void>;
    /** Sets the amount the spender is allowed by the owner to spend for the token to 0. */
    revokeTokenAllowance(addresses: ApprovalAddresses): Promise<void>;
    /** Returns the amount Permit2 is allowed by the owner to spend for the token. */
    getTokenAllowanceForPermit2(addresses: Omit<ApprovalAddresses, 'spender'>): Promise<BigNumber>;
    /**
     * Sets the amount Permit2 is allowed by the owner to spend for the token.
     *
     * @param amount - number to set the allowance to (defaults to a max token approval of MaxUint256)
     * */
    setTokenAllowanceForPermit2(addresses: Omit<ApprovalAddresses, 'spender'>, amount?: BigNumberish): Promise<void>;
    /** Sets the amount Permit2 is allowed by the owner to spend for the token to 0. */
    revokeTokenAllowanceForPermit2(addresses: Omit<ApprovalAddresses, 'spender'>): Promise<void>;
    /** Returns a spender's Permit2 allowance by the owner for the token. Spender is Universal Router by default. */
    getPermit2Allowance({ owner, token, spender, }: Permit2ApprovalAddresses): Promise<{
        amount: BigNumber;
        expiration: number;
    }>;
    /**
     * Sets a spender's Permit2 allowance by the owner for the token.
     *
     * @param addresses - object containing the `owner`, `token`, and `spender` (`spender` defaults to the Universal Router)
     * @param allowance - object containing the `amount` (defaults to a max permit approval of MaxUint160) and `expiration` (defaults to 30 days from the current time)
     * */
    setPermit2Allowance({ owner, token, spender }: Permit2ApprovalAddresses, { amount, expiration }?: {
        amount?: BigNumberish | undefined;
        expiration?: number | undefined;
    }): Promise<void>;
    /** Sets a spender's Permit2 allowance by the owner for the token to 0. Spender is Universal Router by default. */
    revokePermit2Allowance(addresses: Permit2ApprovalAddresses): Promise<void>;
}
export {};
