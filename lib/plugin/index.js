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
exports.setupHardhatEvents = void 0;
const setup_1 = __importDefault(require("./setup"));
function setupHardhatEvents(on, config) {
    return __awaiter(this, void 0, void 0, function* () {
        // Allows plugin events to run in interactive mode.
        // This is necessary to reset the hardhat environment between specs.
        config.experimentalInteractiveRunEvents = true;
        const env = yield (0, setup_1.default)();
        on('task', {
            hardhat: () => ({
                url: env.url,
                chainId: env.chainId,
                accounts: env.accounts,
            }),
            ['hardhat:reset']: () => env.reset(),
        });
        on('before:spec', () => env.reset());
        on('after:run', () => env.close());
    });
}
exports.setupHardhatEvents = setupHardhatEvents;
