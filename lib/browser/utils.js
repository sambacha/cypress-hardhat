"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const bytes_1 = require("@ethersproject/bytes");
const units_1 = require("@ethersproject/units");
const wallet_1 = require("@ethersproject/wallet");
const sdk_core_1 = require("@uniswap/sdk-core");
const assert_1 = __importDefault(require("assert"));
const types_1 = require("../types");
const approval_1 = require("./approval");
const provider_1 = require("./provider");
const signer_1 = require("./signer");
const whales_1 = require("./whales");
const CHAIN_ID = 1;
const ETH = sdk_core_1.Ether.onChain(CHAIN_ID);
class Utils {
    constructor(network) {
        this.network = network;
        this.providers = this.network.accounts.map((account) => {
            const provider = new provider_1.HardhatProvider(this.network.url, { chainId: 1, name: 'mainnet' });
            const wallet = new wallet_1.Wallet(account, provider);
            return new Proxy(provider, {
                get(target, prop) {
                    switch (prop) {
                        case 'listAccounts':
                            return () => Promise.resolve([account.address]);
                        case 'getSigner':
                            return () => wallet;
                        default:
                            return Reflect.get(target, prop);
                    }
                },
            });
        });
        this.approval = new approval_1.ApprovalUtils(this.provider);
    }
    reset() {
        return (cy
            .task('hardhat:reset')
            // Providers will not "rewind" to an older block number, so they must be reset.
            .then(() => Promise.all(this.providers.map((provider) => provider.reset()))));
    }
    /** The primary signing provider configured via hardhat - @see {@link providers}. */
    get provider() {
        return this.providers[0];
    }
    /** Wallets configured via hardhat's {@link https://hardhat.org/hardhat-network/reference/#accounts}. */
    get wallets() {
        return this.providers.map((provider) => provider.getSigner());
    }
    /** The primary wallet configured via hardhat - @see {@link wallets}. */
    get wallet() {
        return this.wallets[0];
    }
    getBalance(address, currencies) {
        if (!Array.isArray(currencies))
            return this.getBalance(address, [currencies])[0];
        if (typeof address !== 'string')
            return this.getBalance(address.address, currencies);
        return currencies.map((currency) => __awaiter(this, void 0, void 0, function* () {
            const balance = yield (() => {
                if (currency.isNative)
                    return this.provider.getBalance(address);
                (0, assert_1.default)(currency.isToken);
                const token = types_1.Erc20__factory.connect(currency.address, this.provider);
                return token.balanceOf(address);
            })();
            return sdk_core_1.CurrencyAmount.fromRawAmount(currency, balance.toString());
        }));
    }
    /** Attempts to fund an account with ETH or ERC-20's. @see {@link fund}. */
    setBalance(address, amounts, whales) {
        return this.fund(address, amounts, whales);
    }
    /**
     * Attempts to fund an account with ETH / ERC-20's.
     * If amount is in ETH, funds the account directly. (NB: Hardhat initially funds test accounts with 1000 ETH.)
     * If amount is an ERC-20, attempts to transfer the amount from a list of known whales.
     * @param address The address of the account to fund.
     * @param amount If in ETH, the amount to set the balance to. If an ERC-20, the amount to transfer.
     * @param whales If set, overrides the list of known whale addresses from which to transfer ERC-20's.
     */
    fund(address, amounts, whales = whales_1.WHALES) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Array.isArray(amounts))
                return this.fund(address, [amounts], whales);
            if (typeof address !== 'string')
                return this.fund(address.address, amounts, whales);
            yield Promise.all(amounts.map((amount) => __awaiter(this, void 0, void 0, function* () {
                const { currency } = amount;
                const balance = (0, units_1.parseUnits)(amount.toExact(), currency.decimals);
                if (currency.isNative) {
                    return this.send('hardhat_setBalance', [address, (0, bytes_1.hexValue)(balance)]);
                }
                (0, assert_1.default)(currency.isToken);
                for (let i = 0; i < whales.length; ++i) {
                    const whale = whales[i];
                    yield this.send('hardhat_impersonateAccount', [whale]);
                    const token = types_1.Erc20__factory.connect(currency.address, new signer_1.ImpersonatedSigner(whale, this.provider));
                    try {
                        yield token.transfer(address, balance);
                        return;
                    }
                    catch (e) {
                        // If failure is due to lack of funds, fund and retry this whale.
                        const match = e.message.match(/sender doesn't have enough funds to send tx. The max upfront cost is: (\d*)/);
                        if (match) {
                            const funds = sdk_core_1.CurrencyAmount.fromRawAmount(ETH, match[1]);
                            this.fund(whale, funds);
                            try {
                                yield token.transfer(address, balance);
                                return;
                            }
                            catch (e) {
                                // Silently ignore.
                            }
                        }
                    }
                    finally {
                        yield this.send('hardhat_stopImpersonatingAccount', [whale]);
                    }
                }
                // Tried all the whales and couldn't fund. Error out.
                const blockNumber = yield this.provider.getBlockNumber();
                throw new Error(`Could not fund ${amount.toExact()} ${currency.symbol} from any whales on block ${blockNumber}. Update your call to fund() to specify additional 'whale' addresses that hold sufficient balance of the token you are trying to fund.`);
            })));
        });
    }
    setAutomine(automine) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send('evm_setAutomine', [automine]);
        });
    }
    /**
     * Mines block(s), including any valid transactions in the mempool.
     * The duration between blocks can be controlled by passing blockInterval, which is specified in seconds.
     * blockInterval will be applied to all blocks mined, including between the current and the first mined.
     */
    mine(count = 1, blockInterval = 12) {
        return __awaiter(this, void 0, void 0, function* () {
            // blockInterval will only apply to blocks after the first, so the next block will need its timestamp explicitly set.
            const { timestamp } = yield this.send('eth_getBlockByNumber', ['latest', false]);
            yield this.send('evm_setNextBlockTimestamp', [(0, bytes_1.hexValue)(Number(timestamp) + blockInterval)]);
            yield this.send('hardhat_mine', [(0, bytes_1.hexValue)(count), (0, bytes_1.hexValue)(blockInterval)]);
        });
    }
    /** Sends a JSON-RPC directly to hardhat. */
    send(method, params) {
        return this.provider.send(method, params);
    }
}
exports.Utils = Utils;
