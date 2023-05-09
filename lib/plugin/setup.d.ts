import { Network } from '../types/Network';
/** Sets up the hardhat environment for use with cypress. */
export default function setup(): Promise<Network & {
    /** Resets the hardhat environment. Call before a spec to reset the environment. */
    reset: () => Promise<void>;
    /** Tears down the hardhat environment. Call after a run to clean up the environment. */
    close: () => Promise<void>;
}>;
