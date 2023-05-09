import { Network } from '../types/Network';
import { Eip1193 } from './eip1193';
import { Utils } from './utils';
interface HardhatOptions {
    automine?: boolean;
}
declare global {
    namespace Cypress {
        interface Chainable {
            hardhat(options?: HardhatOptions): Chainable<Utils>;
            provider(): Chainable<Eip1193>;
            task(event: 'hardhat'): Chainable<Network>;
        }
    }
}
export {};
