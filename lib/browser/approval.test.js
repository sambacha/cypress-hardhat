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
const permit2_sdk_1 = require("@uniswap/permit2-sdk");
const sdk_core_1 = require("@uniswap/sdk-core");
const ethers_1 = require("ethers/lib/ethers");
const setup_1 = __importDefault(require("../plugin/setup"));
const utils_1 = require("./utils");
const token = new sdk_core_1.Token(1, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT');
let env;
let approval;
let spender;
let owner;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    env = yield (0, setup_1.default)();
    const utils = new utils_1.Utils(env);
    approval = utils.approval;
    spender = utils.network.accounts[1];
    owner = utils.wallet.address;
}));
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () { return yield env.reset(); }));
afterAll(() => env.close());
const globalWithCy = global;
beforeAll(() => {
    globalWithCy.cy = { task: jest.fn() };
});
describe('Approval', () => {
    describe('setTokenAllowance', () => {
        it('approves USDT', () => __awaiter(void 0, void 0, void 0, function* () {
            const originalAllowance = yield approval.getTokenAllowance({ owner, token, spender });
            expect(originalAllowance.eq(0)).toBeTruthy();
            yield approval.setTokenAllowance({ owner, token, spender }, 5);
            const updatedAllowance = yield approval.getTokenAllowance({ owner, token, spender });
            expect(updatedAllowance.eq(5)).toBeTruthy();
        }));
        it('approves max token allowance by default', () => __awaiter(void 0, void 0, void 0, function* () {
            yield approval.setTokenAllowance({ owner, token, spender });
            const updatedAllowance = yield approval.getTokenAllowance({ owner, token, spender });
            expect(updatedAllowance).toMatchObject(ethers_1.constants.MaxUint256);
        }));
        it('revokes USDT', () => __awaiter(void 0, void 0, void 0, function* () {
            yield approval.setTokenAllowance({ owner, token, spender }, 5);
            yield approval.revokeTokenAllowance({ owner, token, spender });
            const allowance = yield approval.getTokenAllowance({ owner, token, spender });
            expect(allowance.eq(0)).toBeTruthy();
        }));
    });
    describe('setTokenAllowanceForPermit2', () => {
        it('approves USDT for Permit2', () => __awaiter(void 0, void 0, void 0, function* () {
            const originalAllowance = yield approval.getTokenAllowanceForPermit2({ owner, token });
            expect(originalAllowance.eq(0)).toBeTruthy();
            yield approval.setTokenAllowanceForPermit2({ owner, token }, 5);
            const updatedAllowance = yield approval.getTokenAllowanceForPermit2({ owner, token });
            expect(updatedAllowance.eq(5)).toBeTruthy();
        }));
        it('approves max token allowance by default', () => __awaiter(void 0, void 0, void 0, function* () {
            yield approval.setTokenAllowanceForPermit2({ owner, token });
            const allowance = yield approval.getTokenAllowanceForPermit2({ owner, token });
            expect(allowance).toMatchObject(permit2_sdk_1.MaxUint256);
        }));
        it('revokes USDT for Permit2', () => __awaiter(void 0, void 0, void 0, function* () {
            yield approval.setTokenAllowanceForPermit2({ owner, token }, 5);
            yield approval.revokeTokenAllowanceForPermit2({ owner, token });
            const allowance = yield approval.getTokenAllowanceForPermit2({ owner, token });
            expect(allowance.eq(0)).toBeTruthy();
        }));
    });
    describe('setPermit2Allowance', () => {
        it('permits Universal Router for USDT', () => __awaiter(void 0, void 0, void 0, function* () {
            const originalAllowance = yield approval.getPermit2Allowance({ owner, token });
            expect(originalAllowance.amount.eq(0)).toBeTruthy();
            yield approval.setPermit2Allowance({ owner, token }, { amount: 5, expiration: 1000 });
            const updatedAllowance = yield approval.getPermit2Allowance({ owner, token });
            expect(updatedAllowance.amount.eq(5)).toBeTruthy();
            expect(updatedAllowance.expiration).toBe(1000);
        }));
        it('permits max permit allowance by default', () => __awaiter(void 0, void 0, void 0, function* () {
            yield approval.setPermit2Allowance({ owner, token }, { expiration: 1000 });
            const updatedAllowance = yield approval.getPermit2Allowance({ owner, token });
            expect(updatedAllowance.amount).toMatchObject(permit2_sdk_1.MaxUint160);
        }));
        it('permits with a 30 day expiration by default', () => __awaiter(void 0, void 0, void 0, function* () {
            yield approval.setPermit2Allowance({ owner, token }, { amount: 5 });
            const updatedAllowance = yield approval.getPermit2Allowance({ owner, token });
            expect(updatedAllowance.expiration).toBeLessThanOrEqual(Math.floor(Date.now() / 1000) + 2592000);
        }));
        it('permits default amount/expiration when no approval is passed', () => __awaiter(void 0, void 0, void 0, function* () {
            yield approval.setPermit2Allowance({ owner, token });
            const updatedAllowance = yield approval.getPermit2Allowance({ owner, token });
            expect(updatedAllowance.expiration).toBeLessThanOrEqual(Math.floor(Date.now() / 1000) + 2592000);
            expect(updatedAllowance.amount).toMatchObject(permit2_sdk_1.MaxUint160);
        }));
        it('permits default amount/expiration when empty object is passed', () => __awaiter(void 0, void 0, void 0, function* () {
            yield approval.setPermit2Allowance({ owner, token }, {});
            const updatedAllowance = yield approval.getPermit2Allowance({ owner, token });
            expect(updatedAllowance.expiration).toBeLessThanOrEqual(Math.floor(Date.now() / 1000) + 2592000);
            expect(updatedAllowance.amount).toMatchObject(permit2_sdk_1.MaxUint160);
        }));
        it("revokes Universal Router's permit for USDT", () => __awaiter(void 0, void 0, void 0, function* () {
            yield approval.setPermit2Allowance({ owner, token }, { amount: 5, expiration: 1000 });
            yield approval.revokePermit2Allowance({ owner, token });
            const allowance = yield approval.getPermit2Allowance({ owner, token });
            expect(allowance.amount.eq(0)).toBeTruthy();
            expect(allowance.expiration).toBeLessThan(Date.now() / 1000);
        }));
    });
});
