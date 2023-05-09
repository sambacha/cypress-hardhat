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
exports.Eip1193 = void 0;
const eip1193_bridge_1 = require("@ethersproject/experimental/lib/eip1193-bridge");
const providers_1 = require("@ethersproject/providers");
class Eip1193 extends eip1193_bridge_1.Eip1193Bridge {
    constructor(utils) {
        super(utils.wallet, utils.provider);
        this.utils = utils;
        this.isMetaMask = true;
    }
    sendAsync(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.send(...args);
        });
    }
    send(...args) {
        const _super = Object.create(null, {
            send: { get: () => super.send }
        });
        return __awaiter(this, void 0, void 0, function* () {
            console.debug('hardhat:send', ...args);
            // Parse callback form.
            const isCallbackForm = typeof args[0] === 'object' && typeof args[1] === 'function';
            let callback = (error, result) => {
                if (error)
                    throw error;
                return result === null || result === void 0 ? void 0 : result.result;
            };
            let method;
            let params;
            if (isCallbackForm) {
                callback = args[1];
                method = args[0].method;
                params = args[0].params;
            }
            else {
                method = args[0];
                params = args[1];
            }
            let result;
            try {
                switch (method) {
                    case 'eth_requestAccounts':
                    case 'eth_accounts':
                        result = [this.utils.wallet.address];
                        break;
                    case 'eth_chainId':
                        result = `0x${this.utils.network.chainId.toString(16)}`;
                        break;
                    case 'eth_sendTransaction': {
                        // Eip1193Bridge doesn't support .gas and .from directly, so we massage it to satisfy ethers' expectations.
                        // See https://github.com/ethers-io/ethers.js/issues/1683.
                        params[0].gasLimit = params[0].gas;
                        delete params[0].gas;
                        delete params[0].from;
                        const req = providers_1.JsonRpcProvider.hexlifyTransaction(params[0]);
                        req.gasLimit = req.gas;
                        delete req.gas;
                        result = (yield this.signer.sendTransaction(req)).hash;
                        break;
                    }
                    default:
                        result = yield _super.send.call(this, method, params);
                }
                console.debug('hardhat:receive', method, result);
                return callback(null, { result });
            }
            catch (error) {
                console.debug('hardhat:error', method, error);
                return callback(error);
            }
        });
    }
}
exports.Eip1193 = Eip1193;
