"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleSharder = void 0;
const UtilityFunctions_1 = require("../../../utils/UtilityFunctions");
/**
 * Sharder in charge of handling shard spawn ratelimtis
 */
class SingleSharder {
    constructor(worker) {
        this.worker = worker;
        this.buckets = [];
    }
    register(id) {
        const bucket = id % 1;
        let running = true;
        if (!this.buckets[bucket]) {
            running = false;
            this.buckets[bucket] = [];
        }
        if (!this.buckets[bucket]?.includes(id)) {
            this.buckets[bucket]?.push(id);
        }
        this.buckets[bucket] = this.buckets[bucket]?.sort((a, b) => a - b);
        if (!running)
            void this.loop(bucket);
    }
    async loop(bucket) {
        this.worker.debug(`Looping bucket #${bucket}`);
        if (!this.buckets[bucket])
            return;
        const next = this.buckets[bucket]?.shift();
        if (next === undefined) {
            this.buckets[bucket] = null;
            this.worker.debug(`Reached end of bucket #${bucket}`);
            return;
        }
        const nextShard = this.worker.shards.get(next);
        let waiting = false;
        if (nextShard) {
            nextShard.start();
            waiting = await this.worker._waitForShard(nextShard)
                .then(res => {
                return !res.err;
            })
                .catch(() => {
                this.worker.log(`Shard ${next} failed to startup in time. Continuing.`);
                return true;
            });
        }
        if (waiting)
            await UtilityFunctions_1.wait(this.worker.options.spawnTimeout);
        else
            await UtilityFunctions_1.wait(500);
        return await this.loop(bucket);
    }
}
exports.SingleSharder = SingleSharder;
