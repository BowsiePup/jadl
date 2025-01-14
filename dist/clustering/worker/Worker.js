"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = void 0;
/* eslint-disable @typescript-eslint/consistent-type-assertions */
const Thread_1 = require("./Thread");
const collection_1 = __importDefault(require("@discordjs/collection"));
const Shard_1 = require("../../socket/Shard");
const CacheManager_1 = require("../../socket/CacheManager");
const v9_1 = require("discord-api-types/v9");
const UtilityFunctions_1 = require("../../utils/UtilityFunctions");
const typed_emitter_1 = require("@jpbberry/typed-emitter");
const rest_1 = require("@discordjs/rest");
/**
 * Cluster Worker used on the worker thread
 */
class Worker extends typed_emitter_1.EventEmitter {
    constructor(connectComms = true) {
        super();
        /**
         * Bot options
         */
        this.options = {};
        /**
         * All shards on this cluster
         */
        this.shards = new collection_1.default();
        /**
         * Cached guilds
         */
        this.guilds = new collection_1.default();
        /**
         * Cached roles
         */
        this.guildRoles = new collection_1.default();
        /**
         * Cached channels
         */
        this.channels = new collection_1.default();
        /**
         * Cached self members
         */
        this.selfMember = new collection_1.default();
        /**
         * Cached members
         */
        this.members = new collection_1.default();
        /**
         * Cached users
         */
        this.users = new collection_1.default();
        /**
         * Cached voice states
         */
        this.voiceStates = new collection_1.default();
        /**
         * Self user
         */
        this.user = {};
        this.cacheManager = {};
        this.api = new rest_1.REST();
        if (connectComms)
            this.comms = new Thread_1.Thread(this);
    }
    async start(shardNumbers) {
        this.cacheManager = new CacheManager_1.CacheManager(this);
        this.api.setToken(this.options.token);
        for (let i = 0; i < shardNumbers.length; i++) {
            const shard = new Shard_1.Shard(shardNumbers[i], this);
            this.shards.set(shardNumbers[i], shard);
            await shard.register();
        }
    }
    /**
     * Sets the status of the client
     * @param type Type of status, e.g "playing" is "Playing Game!"
     * @param name Name of status, in this case Game
     * @param status Status type
     * @param url Optional url for twitch stream
     * @example
     * worker.setStatus('playing', 'Rocket League', 'online') // Playing Rocket League
     * // Twitch streams
     * worker.setStatus('streaming', 'Rocket League', 'online', 'https://twitch.com/jpbberry')
     */
    setStatus(type, name, status = 'online', url) {
        if (!this.status) {
            this.on('SHARD_READY', (shard) => {
                if (!this.status)
                    return;
                shard.setPresence(this.status);
            });
        }
        this.status = {
            afk: false,
            since: Date.now(),
            status: status,
            activities: [
                {
                    name,
                    type: ({
                        playing: v9_1.ActivityType.Playing,
                        streaming: v9_1.ActivityType.Streaming,
                        listening: v9_1.ActivityType.Listening,
                        watching: v9_1.ActivityType.Watching,
                        competing: v9_1.ActivityType.Competing
                    })[type],
                    url
                }
            ]
        };
        this.shards.forEach(shard => {
            if (shard.ready && this.status)
                shard.setPresence(this.status);
        });
    }
    /**
     * Gets shard in charge of specific guild
     * @param guildId ID of guild
     */
    guildShard(guildId) {
        const shard = this.shards.get(UtilityFunctions_1.guildShard(guildId, this.options.shards));
        if (!shard)
            throw new Error('Guild not on this cluster.');
        return shard;
    }
    /**
     * Gets ALL members in a guild (via ws)
     * @param guildId ID of guild
     */
    async getMembers(guildId) {
        return await this.guildShard(guildId).getGuildMembers({
            guild_id: guildId,
            query: '',
            limit: 0
        });
    }
    /**
     * Whether or not all shards are online and ready
     */
    get ready() {
        return this.shards.every(x => x.ready);
    }
    /**
     * Log something to master
     * @param data What to log
     */
    log(...data) {
        this.comms.log(...data);
    }
    /**
     * Debug
     * @internal
     * @param msg Debug message
     */
    debug(msg) {
        this.comms.tell('DEBUG', msg);
    }
}
exports.Worker = Worker;
