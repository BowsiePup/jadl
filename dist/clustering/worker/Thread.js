"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Thread = void 0;
const worker_threads_1 = require("worker_threads");
const ThreadComms_1 = require("../ThreadComms");
const util_1 = require("util");
const handlers_1 = require("./handlers");
/**
 * Thread interface for interacting with the master process from a worker
 */
class Thread extends ThreadComms_1.ThreadComms {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    constructor(worker = {}, register = true) {
        super();
        this.worker = worker;
        if (register) {
            this.id = worker_threads_1.workerData.id;
            super.register(worker_threads_1.parentPort);
            const keys = Object.keys(handlers_1.handlers);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                this.on(key, (data, resolve) => {
                    handlers_1.handlers[key]?.bind(this)(data, resolve);
                });
            }
            this.tell('BEGIN', null);
        }
    }
    async registerShard(id) {
        return await this.sendCommand('REGISTER_SHARD', { id });
    }
    /**
     * Destroys entire master.
     */
    destroy() {
        void this.sendCommand('KILL', null);
    }
    /**
     * Logs data to master's MasterOptions.log
     * @param message Message args
     */
    log(...messages) {
        this.tell('LOG', messages.map(m => typeof m === 'string' ? m : util_1.inspect(m)).join(' '));
    }
    /**
     * Restarts a specific cluster
     * @param clusterId ID of cluster
     */
    restartCluster(clusterId) {
        return this.tell('RESTART_CLUSTER', { id: clusterId });
    }
    /**
     * Restarts a specific shard
     * @param shardId ID of shard
     */
    restartShard(shardId) {
        return this.tell('RESTART_SHARD', { id: shardId });
    }
    /**
     * Gets a cached guild across clusters
     * @param guildId ID of guild
     * @returns The guild
     */
    async getGuild(guildId) {
        return await this.sendCommand('GET_GUILD', { id: guildId });
    }
    /**
     * Eval code on every cluster
     * @param code Code to eval
     * @returns Response
     */
    async broadcastEval(code) {
        return await this.sendCommand('BROADCAST_EVAL', code);
    }
    /**
     * Evals code on the master process
     * @param code Code to eval
     * @returns Response
     */
    async masterEval(code) {
        return await this.sendCommand('MASTER_EVAL', code);
    }
    /**
     * Gets an array of each clusters stats
     * @returns Stats
     */
    async getStats() {
        return await this.sendCommand('STATS', null);
    }
}
exports.Thread = Thread;
