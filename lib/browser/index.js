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
const eip1193_1 = require("./eip1193");
const utils_1 = require("./utils");
let hardhat;
Cypress.Commands.add('hardhat', (options) => {
    return (hardhat ? cy.wrap(hardhat) : cy.task('hardhat').then((env) => (hardhat = new utils_1.Utils(env)))).then((utils) => __awaiter(void 0, void 0, void 0, function* () {
        if ((options === null || options === void 0 ? void 0 : options.automine) !== undefined)
            yield utils.setAutomine(options.automine);
        return utils;
    }));
});
let provider;
Cypress.Commands.add('provider', () => {
    if (provider)
        return cy.wrap(provider);
    return cy.hardhat().then((hardhat) => {
        return (provider = new eip1193_1.Eip1193(hardhat));
    });
});
