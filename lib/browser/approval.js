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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalUtils = void 0;
const permit2_sdk_1 = require("@uniswap/permit2-sdk");
const universal_router_sdk_1 = require("@uniswap/universal-router-sdk");
const types_1 = require("../types");
const signer_1 = require("./signer");
function get30DayExpiration() {
    return Math.floor(Date.now() / 1000) + 2592000;
}
function normalizeAddressLike(address) {
    return typeof address === 'string' ? address : address.address;
}
function normalizeApprovalAddresses({ owner, token, spender }) {
    return {
        owner: normalizeAddressLike(owner),
        token: normalizeAddressLike(token),
        spender: normalizeAddressLike(spender),
    };
}
class ApprovalUtils {
    constructor(provider) {
        this.provider = provider;
    }
    /** Returns the address of the Universal Router for the current chain */
    get universalRouterAddress() {
        return (0, universal_router_sdk_1.UNIVERSAL_ROUTER_ADDRESS)(this.provider.network.chainId);
    }
    /** Returns the amount the spender is allowed by the owner to spend for the token. */
    getTokenAllowance(addresses) {
        return __awaiter(this, void 0, void 0, function* () {
            const { owner, token, spender } = normalizeApprovalAddresses(addresses);
            const erc20 = types_1.Erc20__factory.connect(token, this.provider);
            return yield erc20.allowance(owner, spender);
        });
    }
    /**
     * Sets the amount the spender is allowed by the owner to spend for the token.
     *
     * @param amount - number to set the allowance to (defaults to a max token approval of MaxUint256)
     * */
    setTokenAllowance(addresses, amount = permit2_sdk_1.MaxUint256) {
        return __awaiter(this, void 0, void 0, function* () {
            const { owner, token, spender } = normalizeApprovalAddresses(addresses);
            const erc20 = types_1.Erc20__factory.connect(token, new signer_1.ImpersonatedSigner(owner, this.provider));
            yield erc20.approve(spender, amount);
        });
    }
    /** Sets the amount the spender is allowed by the owner to spend for the token to 0. */
    revokeTokenAllowance(addresses) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.setTokenAllowance(addresses, 0);
        });
    }
    /** Returns the amount Permit2 is allowed by the owner to spend for the token. */
    getTokenAllowanceForPermit2(addresses) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getTokenAllowance(Object.assign(Object.assign({}, addresses), { spender: permit2_sdk_1.PERMIT2_ADDRESS }));
        });
    }
    /**
     * Sets the amount Permit2 is allowed by the owner to spend for the token.
     *
     * @param amount - number to set the allowance to (defaults to a max token approval of MaxUint256)
     * */
    setTokenAllowanceForPermit2(addresses, amount = permit2_sdk_1.MaxUint256) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.setTokenAllowance(Object.assign(Object.assign({}, addresses), { spender: permit2_sdk_1.PERMIT2_ADDRESS }), amount);
        });
    }
    /** Sets the amount Permit2 is allowed by the owner to spend for the token to 0. */
    revokeTokenAllowanceForPermit2(addresses) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.setTokenAllowanceForPermit2(addresses, 0);
        });
    }
    /** Returns a spender's Permit2 allowance by the owner for the token. Spender is Universal Router by default. */
    getPermit2Allowance({ owner, token, spender = this.universalRouterAddress, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const addresses = normalizeApprovalAddresses({ owner, token, spender });
            const permit2 = types_1.Permit2__factory.connect(permit2_sdk_1.PERMIT2_ADDRESS, this.provider);
            return permit2.allowance(addresses.owner, addresses.token, addresses.spender);
        });
    }
    /**
     * Sets a spender's Permit2 allowance by the owner for the token.
     *
     * @param addresses - object containing the `owner`, `token`, and `spender` (`spender` defaults to the Universal Router)
     * @param allowance - object containing the `amount` (defaults to a max permit approval of MaxUint160) and `expiration` (defaults to 30 days from the current time)
     * */
    setPermit2Allowance({ owner, token, spender = this.universalRouterAddress }, { amount = permit2_sdk_1.MaxUint160, expiration = get30DayExpiration() } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const addresses = normalizeApprovalAddresses({ owner, token, spender });
            const permit2 = types_1.AllowanceTransfer__factory.connect(permit2_sdk_1.PERMIT2_ADDRESS, new signer_1.ImpersonatedSigner(addresses.owner, this.provider));
            yield permit2.approve(addresses.token, addresses.spender, amount, expiration);
            return;
        });
    }
    /** Sets a spender's Permit2 allowance by the owner for the token to 0. Spender is Universal Router by default. */
    revokePermit2Allowance(addresses) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.setPermit2Allowance(addresses, { amount: 0, expiration: 0 });
        });
    }
}
exports.ApprovalUtils = ApprovalUtils;
