import { ContractKit } from "@celo/contractkit";
import { JsonRpcPayload, JsonRpcResponse } from "web3-core-helpers";
export declare const NETWORK_ID = 1101;
export declare const MNEMONIC = "concert load couple harbor equip island argue ramp clarify fence smart topic";
export declare const ACCOUNT_PRIVATE_KEYS: string[];
export declare const ACCOUNT_ADDRESSES: string[];
export interface Provider {
    send(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void;
}
export declare function sendJSONRpc(provider: Provider, method: string, params: any[]): Promise<unknown>;
export declare function mineBlock(provider: Provider): Promise<unknown>;
export declare function increaseTime(provider: Provider, secondsToAdd: number): Promise<unknown>;
export declare function mineToNextEpoch(kit: ContractKit): Promise<void>;
