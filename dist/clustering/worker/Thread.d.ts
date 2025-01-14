import { APIGuild, Snowflake } from 'discord-api-types/v9';
import { ClusterStats, ThreadComms } from '../ThreadComms';
import { Worker } from '../worker/Worker';
/**
 * Thread interface for interacting with the master process from a worker
 */
export declare class Thread extends ThreadComms {
    worker: Worker;
    id: string;
    constructor(worker?: Worker, register?: boolean);
    registerShard(id: number): Promise<{}>;
    /**
     * Destroys entire master.
     */
    destroy(): void;
    /**
     * Logs data to master's MasterOptions.log
     * @param message Message args
     */
    log(...messages: any[]): void;
    /**
     * Restarts a specific cluster
     * @param clusterId ID of cluster
     */
    restartCluster(clusterId: string): void;
    /**
     * Restarts a specific shard
     * @param shardId ID of shard
     */
    restartShard(shardId: any): void;
    /**
     * Gets a cached guild across clusters
     * @param guildId ID of guild
     * @returns The guild
     */
    getGuild(guildId: Snowflake): Promise<APIGuild>;
    /**
     * Eval code on every cluster
     * @param code Code to eval
     * @returns Response
     */
    broadcastEval(code: string): Promise<any[]>;
    /**
     * Evals code on the master process
     * @param code Code to eval
     * @returns Response
     */
    masterEval(code: string): Promise<any>;
    /**
     * Gets an array of each clusters stats
     * @returns Stats
     */
    getStats(): Promise<ClusterStats[]>;
}
