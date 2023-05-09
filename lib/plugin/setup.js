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
const hardhat_1 = __importDefault(require("hardhat"));
const task_names_1 = require("hardhat/builtin-tasks/task-names");
const accounts_1 = require("./accounts");
/** Sets up the hardhat environment for use with cypress. */
function setup() {
    return __awaiter(this, void 0, void 0, function* () {
        const hardhatConfig = hardhat_1.default.config.networks.hardhat;
        const forkingConfig = hardhatConfig.forking;
        if (!forkingConfig) {
            throw new Error('`forking` must be specified to use `cypress-hardhat`.\nSee https://hardhat.org/hardhat-network/guides/mainnet-forking.html#mainnet-forking.');
        }
        // Overrides the GET_PROVIDER task to avoid unnecessary time-intensive evm calls.
        hardhat_1.default.tasks[task_names_1.TASK_NODE_GET_PROVIDER].setAction(() => __awaiter(this, void 0, void 0, function* () { return hardhat_1.default.network.provider; }));
        const port = 8545;
        const run = hardhat_1.default.run(task_names_1.TASK_NODE, { port });
        const serverReady = new Promise((resolve) => hardhat_1.default.tasks[task_names_1.TASK_NODE_SERVER_READY].setAction(({ address, port, server }) => __awaiter(this, void 0, void 0, function* () {
            const url = 'http://' + address + ':' + port;
            resolve({ url, server });
        })));
        // Deriving ExternallyOwnedAccounts is computationally intensive, so we do it while waiting for the server to come up.
        const accounts = (0, accounts_1.toExternallyOwnedAccounts)(hardhat_1.default.network.config.accounts);
        if (accounts.length > 4) {
            process.stderr.write(`${accounts.length} hardhat accounts specified - consider specifying fewer.\n`);
            process.stderr.write('Specifying multiple hardhat accounts will noticeably slow your test startup time.\n\n');
        }
        // Enables logging if it was enabled in the hardhat config.
        if (hardhat_1.default.config.networks.hardhat.loggingEnabled) {
            yield hardhat_1.default.network.provider.send('hardhat_setLoggingEnabled', [true]);
        }
        const { url, server } = yield serverReady;
        return {
            url,
            chainId: hardhat_1.default.config.networks.hardhat.chainId,
            accounts,
            reset: () => hardhat_1.default.network.provider.send('hardhat_reset', [
                {
                    hardhat: {
                        mining: hardhatConfig.mining,
                    },
                    forking: {
                        jsonRpcUrl: forkingConfig.url,
                        blockNumber: forkingConfig.blockNumber,
                        httpHeaders: forkingConfig.httpHeaders,
                    },
                },
            ]),
            close: () => __awaiter(this, void 0, void 0, function* () {
                yield server.close();
                yield run;
            }),
        };
    });
}
exports.default = setup;
