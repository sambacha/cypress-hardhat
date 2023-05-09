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
exports.ImpersonatedSigner = void 0;
const providers_1 = require("@ethersproject/providers");
const ethers_1 = require("ethers/lib/ethers");
const utils_1 = require("ethers/lib/utils");
class ImpersonatedSigner extends ethers_1.VoidSigner {
    constructor(address, provider) {
        super(address, provider);
    }
    sendTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = yield (0, utils_1.resolveProperties)(transaction);
            tx.from = this.address;
            const hexTx = providers_1.JsonRpcProvider.hexlifyTransaction(tx, { from: true });
            const hash = yield this.provider.send('eth_sendTransaction', [hexTx]);
            return this.provider.getTransaction(hash);
        });
    }
}
exports.ImpersonatedSigner = ImpersonatedSigner;
