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
exports.HardhatProvider = void 0;
const providers_1 = require("@ethersproject/providers");
class HardhatProvider extends providers_1.StaticJsonRpcProvider {
    /** Resets internal state so that the block number may be "rewinded". */
    reset() {
        return __awaiter(this, void 0, void 0, function* () {
            // Reset all internal block number guards and caches.
            // See https://github.com/ethers-io/ethers.js/blob/v5/packages/providers/src.ts/base-provider.ts#L1168-L1175.
            this._lastBlockNumber = -2;
            this._fastBlockNumber = null;
            this._fastBlockNumberPromise = null;
            this._fastQueryDate = 0;
            this._emitted.block = -2;
            this._maxInternalBlockNumber = -1024;
            this._internalBlockNumber = null;
        });
    }
}
exports.HardhatProvider = HardhatProvider;
