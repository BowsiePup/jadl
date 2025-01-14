import { CacheManager } from '../../../socket/CacheManager';
import { Worker } from '../Worker';
import { Shard } from '../../../socket/Shard';
import { SingleSharder } from './SingleSharder';
import { SingleThread } from './SingleThread';
import { BotOptions } from '../../../typings/options';
export declare class SingleWorker extends Worker<{
    DEBUG: string;
}> {
    cacheManager: CacheManager;
    sharder: SingleSharder;
    comms: SingleThread;
    constructor(options: BotOptions);
    _beginSingleton(): Promise<void>;
    _waitForShard(shard: Shard): Promise<{
        err: boolean;
    }>;
    start(): Promise<void>;
    debug(msg: any): void;
}
