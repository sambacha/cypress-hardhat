"use strict";
/**
 * This test intentionally runs in the jest environment, so it will fail to link hardhat's asm dependency.
 * This is expected, and necessary in order collect coverage.
 */
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
const wallet_1 = require("@ethersproject/wallet");
const sdk_core_1 = require("@uniswap/sdk-core");
const setup_1 = __importDefault(require("../plugin/setup"));
const utils_1 = require("./utils");
const CHAIN_ID = 1;
const ETH = sdk_core_1.Ether.onChain(CHAIN_ID);
const UNI = new sdk_core_1.Token(CHAIN_ID, '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', 18, 'UNI');
const USDT = new sdk_core_1.Token(CHAIN_ID, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT');
const USDT_TREASURY = '0x5754284f345afc66a98fbb0a0afe71e0f007b949';
let env;
let utils;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    env = yield (0, setup_1.default)();
    utils = new utils_1.Utils(env);
}));
afterAll(() => env.close());
const globalWithCy = global;
beforeAll(() => {
    globalWithCy.cy = { task: jest.fn() };
});
describe('Utils', () => {
    describe('reset', () => {
        beforeEach(() => {
            jest.mocked(cy.task).mockImplementation(() => env.reset());
        });
        it('invokes hardhat:reset', () => {
            utils.reset();
            expect(cy.task).toHaveBeenCalledWith('hardhat:reset');
        });
        it('resets the providers', () => __awaiter(void 0, void 0, void 0, function* () {
            const initialBlockNumbers = yield Promise.all(utils.providers.map((provider) => provider.getBlockNumber()));
            yield utils.mine(100);
            yield new Promise((resolve) => {
                utils.reset().then(() => __awaiter(void 0, void 0, void 0, function* () {
                    const blockNumbers = yield Promise.all(utils.providers.map((provider) => provider.getBlockNumber()));
                    expect(blockNumbers).toEqual(initialBlockNumbers);
                    resolve();
                }));
            });
        }));
    });
    describe('network', () => {
        it('returns the network', () => {
            expect(utils.network).toMatchObject({
                accounts: expect.arrayContaining([
                    expect.objectContaining({ address: expect.any(String), privateKey: expect.any(String) }),
                ]),
                chainId: 1,
                url: 'http://127.0.0.1:8545',
            });
        });
    });
    describe('providers', () => {
        it('lists accounts', () => __awaiter(void 0, void 0, void 0, function* () {
            const accounts = yield Promise.all(utils.providers.map((provider) => provider.listAccounts()));
            const addresses = accounts.map(([address]) => address);
            expect(addresses).toEqual(utils.network.accounts.map(({ address }) => address));
        }));
        it('provides signers', () => {
            const signers = utils.providers.map((provider) => provider.getSigner());
            expect(signers).toEqual(utils.wallets);
        });
        it('returns the network', () => __awaiter(void 0, void 0, void 0, function* () {
            const network = yield utils.provider.getNetwork();
            expect(network.chainId).toBe(CHAIN_ID);
        }));
        it('provider returns the first provider', () => {
            expect(utils.provider).toBe(utils.providers[0]);
        });
    });
    describe('wallets', () => {
        it('are wallets', () => {
            expect(utils.wallets.every((wallet) => wallet instanceof wallet_1.Wallet)).toBeTruthy();
        });
        it('reflects accounts', () => {
            expect(utils.wallets.map((wallet) => ({
                address: wallet.address.toLowerCase(),
                privateKey: wallet.privateKey,
            }))).toEqual(utils.network.accounts);
        });
        it('wallet returns the first wallet', () => {
            expect(utils.wallet).toBe(utils.wallets[0]);
        });
    });
    describe('getBalance', () => {
        describe('with an impersonated account', () => {
            it('returns ETH balance', () => __awaiter(void 0, void 0, void 0, function* () {
                const balance = yield utils.getBalance(utils.wallet, ETH);
                expect(balance.toExact()).toBe('10000');
            }));
            it('returns UNI balance', () => __awaiter(void 0, void 0, void 0, function* () {
                const balance = yield utils.getBalance(utils.wallet, UNI);
                expect(balance.toExact()).toBe('0');
            }));
        });
        describe('with an external address', () => {
            const address = '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8';
            it('returns ETH balance', () => __awaiter(void 0, void 0, void 0, function* () {
                const balance = yield utils.getBalance(address, ETH);
                expect(balance.toExact()).toBe('1996008.361994350150225987');
            }));
            it('returns UNI balance', () => __awaiter(void 0, void 0, void 0, function* () {
                const balance = yield utils.getBalance(address, UNI);
                expect(balance.toExact()).toBe('6000000');
            }));
        });
    });
    describe('send', () => {
        it('delegates to the provider', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(utils.provider, 'send').mockResolvedValue('baz');
            yield expect(utils.send('eth_foo', ['bar'])).resolves.toBe('baz');
            expect(utils.provider.send).toHaveBeenCalledWith('eth_foo', ['bar']);
        }));
    });
    describe('setBalance', () => {
        afterEach(() => __awaiter(void 0, void 0, void 0, function* () { return yield env.reset(); }));
        it('calls into `fund`', () => __awaiter(void 0, void 0, void 0, function* () {
            const amount = sdk_core_1.CurrencyAmount.fromRawAmount(USDT, 10000).multiply(10 ** USDT.decimals);
            const whales = [USDT_TREASURY];
            const fund = jest.spyOn(utils_1.Utils.prototype, 'fund').mockResolvedValue();
            yield utils.setBalance(utils.wallet, amount, whales);
            expect(fund).toHaveBeenCalledWith(utils.wallet, amount, whales);
        }));
    });
    describe('fund', () => {
        afterEach(() => __awaiter(void 0, void 0, void 0, function* () { return yield env.reset(); }));
        describe('with an impersonated account', () => {
            it('funds ETH balance', () => __awaiter(void 0, void 0, void 0, function* () {
                const amount = sdk_core_1.CurrencyAmount.fromRawAmount(ETH, 6000000).multiply(10 ** ETH.decimals);
                yield utils.fund(utils.wallet, amount);
                const balance = yield utils.getBalance(utils.wallet, ETH);
                expect(balance.toExact()).toBe('6000000');
            }));
            it('funds UNI balance', () => __awaiter(void 0, void 0, void 0, function* () {
                const amount = sdk_core_1.CurrencyAmount.fromRawAmount(UNI, 6000000).multiply(10 ** UNI.decimals);
                yield utils.fund(utils.wallet, amount);
                const balance = yield utils.getBalance(utils.wallet, UNI);
                expect(balance.toExact()).toBe('6000000');
            }));
        });
        describe('with an external address', () => {
            afterEach(() => __awaiter(void 0, void 0, void 0, function* () { return yield env.reset(); }));
            const address = '0x6555e1cc97d3cba6eaddebbcd7ca51d75771e0b8';
            it('funds ETH balance', () => __awaiter(void 0, void 0, void 0, function* () {
                const amount = sdk_core_1.CurrencyAmount.fromRawAmount(ETH, 6000000).multiply(10 ** ETH.decimals);
                yield utils.fund(address, amount);
                const balance = yield utils.getBalance(address, ETH);
                expect(balance.toExact()).toBe('6000000');
            }));
            it('funds UNI balance', () => __awaiter(void 0, void 0, void 0, function* () {
                const amount = sdk_core_1.CurrencyAmount.fromRawAmount(UNI, 6000000).multiply(10 ** UNI.decimals);
                yield utils.fund(address, amount);
                const balance = yield utils.getBalance(address, UNI);
                expect(balance.toExact()).toBe('6000000.474792305572453152'); // includes existing funds
            }));
        });
        it('uses custom whales', () => __awaiter(void 0, void 0, void 0, function* () {
            const MINNOW = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
            const amount = sdk_core_1.CurrencyAmount.fromRawAmount(USDT, 10000).multiply(10 ** USDT.decimals);
            // Try fund from address with no USDT.
            yield expect(utils.fund(utils.wallet, amount, [MINNOW])).rejects.toThrow('Could not fund 10000 USDT from any whales');
            // Successfully fund from address with USDT.
            yield utils.fund(utils.wallet, amount, [USDT_TREASURY]);
            const balance = yield utils.getBalance(utils.wallet, USDT);
            expect(balance.toExact()).toBe('10000');
            // Successfully funds when 2nd whale has USDT but 1st does not.
            yield utils.fund(utils.wallet, amount, [MINNOW, USDT_TREASURY]);
            const balance2 = yield utils.getBalance(utils.wallet, USDT);
            expect(balance2.toExact()).toBe('20000');
        }));
    });
    describe('setAutomine', () => {
        afterEach(() => __awaiter(void 0, void 0, void 0, function* () { return yield env.reset(); }));
        it('sets automine to true', () => __awaiter(void 0, void 0, void 0, function* () {
            yield utils.setAutomine(false);
            yield expect(utils.send('hardhat_getAutomine', [])).resolves.toBe(false);
            yield utils.setAutomine(true);
            yield expect(utils.send('hardhat_getAutomine', [])).resolves.toBe(true);
        }));
    });
    describe('mine', () => {
        afterEach(() => __awaiter(void 0, void 0, void 0, function* () { return yield env.reset(); }));
        it('mines 1 block with 12s interval by default', () => __awaiter(void 0, void 0, void 0, function* () {
            const block = yield utils.send('eth_getBlockByNumber', ['latest', false]);
            yield utils.mine();
            const latest = yield utils.send('eth_getBlockByNumber', ['latest', false]);
            expect(Number(latest.number)).toBe(Number(block.number) + 1);
            expect(Number(latest.timestamp)).toBe(Number(block.timestamp) + 12);
        }));
        it('mines n blocks with blockInterval', () => __awaiter(void 0, void 0, void 0, function* () {
            const block = yield utils.send('eth_getBlockByNumber', ['latest', false]);
            yield utils.mine(100, 42);
            const latest = yield utils.send('eth_getBlockByNumber', ['latest', false]);
            expect(Number(latest.number)).toBe(Number(block.number) + 100);
            expect(Number(latest.timestamp)).toBe(Number(block.timestamp) + 42 * 100);
        }));
    });
});
