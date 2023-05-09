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
const eip1193_bridge_1 = require("@ethersproject/experimental/lib/eip1193-bridge");
const setup_1 = __importDefault(require("../plugin/setup"));
const eip1193_1 = require("./eip1193");
const utils_1 = require("./utils");
let env;
let utils;
let provider;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    env = yield (0, setup_1.default)();
    utils = new utils_1.Utils(env);
    provider = new eip1193_1.Eip1193(utils);
}));
afterAll(() => env.close());
describe('Eip1193', () => {
    beforeEach(() => {
        // Squelches console.debug
        jest.spyOn(console, 'debug').mockReturnValue();
    });
    it('sendAsync delegates to send', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(provider, 'send').mockResolvedValueOnce('baz');
        yield expect(provider.sendAsync('foo', ['bar'])).resolves.toBe('baz');
        expect(provider.send).toHaveBeenCalledWith('foo', ['bar']);
    }));
    describe('accepts callback form', () => {
        it('calls back with an error', () => __awaiter(void 0, void 0, void 0, function* () {
            const callback = jest.fn();
            const error = new Error('baz');
            const send = jest.spyOn(eip1193_bridge_1.Eip1193Bridge.prototype, 'send').mockRejectedValueOnce(error);
            yield provider.send({ method: 'foo', params: ['bar'] }, callback);
            expect(send).toHaveBeenCalledWith('foo', ['bar']);
            expect(callback).toHaveBeenCalledWith(error);
        }));
        it('calls back with a result', () => __awaiter(void 0, void 0, void 0, function* () {
            const callback = jest.fn();
            const send = jest.spyOn(eip1193_bridge_1.Eip1193Bridge.prototype, 'send').mockResolvedValueOnce('baz');
            yield provider.send({ method: 'foo', params: ['bar'] }, callback);
            expect(send).toHaveBeenCalledWith('foo', ['bar']);
            expect(callback).toHaveBeenCalledWith(null, { result: 'baz' });
        }));
    });
    it('throws an error', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(provider.send('eth_unknownMethod')).rejects.toThrow();
    }));
    describe('reads', () => {
        it('eth_requestAccounts', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(provider.send('eth_requestAccounts')).resolves.toEqual([utils.wallet.address]);
        }));
        it('eth_accounts', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(provider.send('eth_accounts')).resolves.toEqual([utils.wallet.address]);
        }));
        it('eth_chainId', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(provider.send('eth_chainId')).resolves.toEqual('0x1');
        }));
        it('eth_blockNumber', () => __awaiter(void 0, void 0, void 0, function* () {
            const send = jest.spyOn(eip1193_bridge_1.Eip1193Bridge.prototype, 'send');
            yield expect(provider.send('eth_blockNumber')).resolves.toEqual(expect.any(Number));
            expect(send).toHaveBeenCalledWith('eth_blockNumber', undefined);
        }));
    });
    describe('writes', () => {
        afterEach(() => __awaiter(void 0, void 0, void 0, function* () { return yield env.reset(); }));
        it('eth_sendTransaction', () => __awaiter(void 0, void 0, void 0, function* () {
            const tx = yield provider.send('eth_sendTransaction', [
                {
                    from: utils.wallet.address,
                    to: utils.wallets[1].address,
                    value: 1,
                    gas: 21000,
                },
            ]);
            expect(tx).toMatch(/^0x[0-9a-f]{64}$/);
        }));
    });
});
