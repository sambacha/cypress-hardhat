import { Eip1193Bridge } from '@ethersproject/experimental/lib/eip1193-bridge';
import { Utils } from './utils';
export declare class Eip1193 extends Eip1193Bridge {
    private utils;
    readonly isMetaMask = true;
    constructor(utils: Utils);
    sendAsync(...args: any[]): Promise<any>;
    send(...args: any[]): Promise<any>;
}
