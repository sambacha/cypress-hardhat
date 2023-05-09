"use strict";
/**
 * This test intentionally runs in the jest environment, so it will fail to link hardhat's asm dependency.
 * This is expected, and necessary in order collect coverage.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugins_testing_1 = require("hardhat/plugins-testing");
let hre;
let setup;
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    (0, plugins_testing_1.resetHardhatContext)();
    hre = (yield Promise.resolve().then(() => __importStar(require('hardhat')))).default;
    setup = (yield Promise.resolve().then(() => __importStar(require('./setup')))).default;
}));
beforeEach(jest.resetModules);
describe('setup', () => {
    it('throws if forking is not configured', () => __awaiter(void 0, void 0, void 0, function* () {
        delete hre.config.networks.hardhat.forking;
        yield expect(setup()).rejects.toThrow('`forking` must be specified to use `cypress-hardhat`.');
    }));
    describe('with valid configuration', () => {
        let send;
        let env;
        beforeEach(() => {
            send = jest.spyOn(hre.network.provider, 'send');
        });
        afterEach(() => __awaiter(void 0, void 0, void 0, function* () { return yield env.close(); }));
        it('sets up the environment', () => __awaiter(void 0, void 0, void 0, function* () {
            env = yield setup();
            expect(env).toMatchObject({
                url: 'http://127.0.0.1:8545',
                chainId: 1,
                accounts: [
                    {
                        address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
                        privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
                    },
                    {
                        address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
                        privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
                    },
                ],
            });
        }));
        it('resets the environment', () => __awaiter(void 0, void 0, void 0, function* () {
            env = yield setup();
            const blockNumber = yield hre.network.provider.send('eth_blockNumber', []);
            hre.network.provider.send('evm_setAutomine', [false]);
            hre.network.provider.send('evm_mine', []);
            yield env.reset();
            expect(send).toHaveBeenCalledWith('hardhat_reset', [
                {
                    hardhat: { mining: expect.objectContaining({ auto: true }) },
                    forking: expect.objectContaining({
                        jsonRpcUrl: expect.any(String),
                        blockNumber: expect.any(Number),
                        httpHeaders: expect.any(Object),
                    }),
                },
            ]);
            yield expect(hre.network.provider.send('eth_blockNumber', [])).resolves.toBe(blockNumber);
            yield expect(hre.network.provider.send('hardhat_getAutomine', [])).resolves.toBe(true);
        }));
        describe('accounts', () => {
            function getAccountsConfig() {
                return hre.network.config.accounts;
            }
            it('does not warn if 4 accounts are specified', () => __awaiter(void 0, void 0, void 0, function* () {
                getAccountsConfig().count = 4;
                const warn = jest.spyOn(process.stderr, 'write');
                env = yield setup();
                expect(warn).not.toHaveBeenCalledWith('Specifying multiple hardhat accounts will noticeably slow your test startup time.\n\n');
            }));
            it('warns if more than 4 accounts are specified', () => __awaiter(void 0, void 0, void 0, function* () {
                getAccountsConfig().count = 5;
                const warn = jest.spyOn(process.stderr, 'write');
                env = yield setup();
                expect(warn).toHaveBeenCalledWith('Specifying multiple hardhat accounts will noticeably slow your test startup time.\n\n');
            }));
        });
        describe('logging', () => {
            it('does not enable logging', () => __awaiter(void 0, void 0, void 0, function* () {
                env = yield setup();
                expect(send).not.toHaveBeenCalled();
            }));
            it('enables logging with `loggingEnabled`', () => __awaiter(void 0, void 0, void 0, function* () {
                hre.config.networks.hardhat.loggingEnabled = true;
                env = yield setup();
                expect(send).toHaveBeenCalledWith('hardhat_setLoggingEnabled', [true]);
            }));
        });
    });
});
