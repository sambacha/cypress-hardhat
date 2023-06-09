"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toExternallyOwnedAccounts = void 0;
const hdnode_1 = require("@ethersproject/hdnode");
const transactions_1 = require("@ethersproject/transactions");
/** Derives ExternallyOwnedAccounts (ie private keys and addresses) from a hardhat accounts configuration. */
function toExternallyOwnedAccounts(accounts) {
    if (Array.isArray(accounts)) {
        return accounts.map(({ privateKey }) => ({
            address: (0, transactions_1.computeAddress)(privateKey),
            privateKey: privateKey.toLowerCase(),
        }));
    }
    else {
        const { mnemonic, passphrase, path, count, initialIndex } = accounts;
        const hdnode = hdnode_1.HDNode.fromMnemonic(mnemonic, passphrase);
        const hdpath = path.endsWith('/') ? path : path + '/';
        return new Array(count)
            .fill(0)
            .map((_, i) => hdpath + (initialIndex + i).toString())
            .map((accountpath) => hdnode.derivePath(accountpath))
            .map(({ address, privateKey }) => ({
            address: address.toLowerCase(),
            privateKey: privateKey.toLowerCase(),
        }));
    }
}
exports.toExternallyOwnedAccounts = toExternallyOwnedAccounts;
