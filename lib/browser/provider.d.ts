import { StaticJsonRpcProvider } from '@ethersproject/providers';
export declare class HardhatProvider extends StaticJsonRpcProvider {
    /** Resets internal state so that the block number may be "rewinded". */
    reset(): Promise<void>;
}
