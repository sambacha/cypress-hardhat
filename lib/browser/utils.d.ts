import { JsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { Currency, CurrencyAmount } from '@uniswap/sdk-core';
import { Network } from '../types/Network';
import { ApprovalUtils } from './approval';
import { AddressLike, OneOrMany } from './types';
export declare class Utils {
    network: Network;
    /** Signing providers configured via hardhat's {@link https://hardhat.org/hardhat-network/reference/#accounts}. */
    readonly providers: JsonRpcProvider[];
    /** Utilities for getting/setting ERC-20 and Permit2 approvals. */
    readonly approval: ApprovalUtils;
    constructor(network: Network);
    reset(): Cypress.Chainable<void[]>;
    /** The primary signing provider configured via hardhat - @see {@link providers}. */
    get provider(): JsonRpcProvider;
    /** Wallets configured via hardhat's {@link https://hardhat.org/hardhat-network/reference/#accounts}. */
    get wallets(): Wallet[];
    /** The primary wallet configured via hardhat - @see {@link wallets}. */
    get wallet(): Wallet;
    /** Gets the balance of ETH ERC-20's held by the address. */
    getBalance(address: AddressLike, currencies: Currency): Promise<CurrencyAmount<Currency>>;
    getBalance(address: AddressLike, currencies: Currency[]): Promise<CurrencyAmount<Currency>>[];
    /** Attempts to fund an account with ETH or ERC-20's. @see {@link fund}. */
    setBalance(address: AddressLike, amounts: OneOrMany<CurrencyAmount<Currency>>, whales?: string[]): Promise<void>;
    /**
     * Attempts to fund an account with ETH / ERC-20's.
     * If amount is in ETH, funds the account directly. (NB: Hardhat initially funds test accounts with 1000 ETH.)
     * If amount is an ERC-20, attempts to transfer the amount from a list of known whales.
     * @param address The address of the account to fund.
     * @param amount If in ETH, the amount to set the balance to. If an ERC-20, the amount to transfer.
     * @param whales If set, overrides the list of known whale addresses from which to transfer ERC-20's.
     */
    fund(address: AddressLike, amounts: OneOrMany<CurrencyAmount<Currency>>, whales?: string[]): Promise<void>;
    setAutomine(automine: boolean): Promise<void>;
    /**
     * Mines block(s), including any valid transactions in the mempool.
     * The duration between blocks can be controlled by passing blockInterval, which is specified in seconds.
     * blockInterval will be applied to all blocks mined, including between the current and the first mined.
     */
    mine(count?: number, blockInterval?: number): Promise<void>;
    /** Sends a JSON-RPC directly to hardhat. */
    send(method: string, params: any[]): Promise<any>;
}
