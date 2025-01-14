import { Thread } from './Thread';
import { DiscordEventMap, CachedGuild, CachedVoiceState, CachedChannel } from '../../typings/Discord';
import Collection from '@discordjs/collection';
import { Shard } from '../../socket/Shard';
import { CacheManager } from '../../socket/CacheManager';
import { APIUser, Snowflake, APIGuildMember, GatewayPresenceUpdateData } from 'discord-api-types/v9';
import { EventEmitter } from '@jpbberry/typed-emitter';
import { CompleteBotOptions } from '../../typings/options';
import { REST } from '@discordjs/rest';
/**
 * Cluster Worker used on the worker thread
 */
export declare class Worker<ExtraEvents = {}> extends EventEmitter<DiscordEventMap & ExtraEvents> {
    /**
     * Bot options
     */
    options: CompleteBotOptions;
    /**
     * All shards on this cluster
     */
    shards: Collection<number, Shard>;
    /**
     * Thread communications
     */
    comms: Thread;
    /**
     * Cached guilds
     */
    guilds: Collection<Snowflake, CachedGuild>;
    /**
     * Cached roles
     */
    guildRoles: Collection<Snowflake, Collection<Snowflake, DiscordEventMap['GUILD_ROLE_CREATE']['role']>>;
    /**
     * Cached channels
     */
    channels: Collection<Snowflake, CachedChannel>;
    /**
     * Cached self members
     */
    selfMember: Collection<Snowflake, DiscordEventMap['GUILD_MEMBER_ADD']>;
    /**
     * Cached members
     */
    members: Collection<Snowflake, Collection<Snowflake, DiscordEventMap['GUILD_MEMBER_ADD']>>;
    /**
     * Cached users
     */
    users: Collection<Snowflake, DiscordEventMap['USER_UPDATE']>;
    /**
     * Cached voice states
     */
    voiceStates: Collection<Snowflake, CachedVoiceState>;
    /**
     * Self user
     */
    user: APIUser;
    cacheManager: CacheManager;
    api: REST;
    constructor(connectComms?: boolean);
    start(shardNumbers: number[]): Promise<void>;
    /**
     * The status that the worker will retain when a shard restarts, to change use Worker.setStatus() for no unintended side affects
     */
    status?: GatewayPresenceUpdateData;
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
    setStatus(type: 'playing' | 'streaming' | 'listening' | 'watching' | 'competing', name: string, status?: 'idle' | 'online' | 'dnd' | 'offline' | 'invisible', url?: string): void;
    /**
     * Gets shard in charge of specific guild
     * @param guildId ID of guild
     */
    guildShard(guildId: Snowflake): Shard;
    /**
     * Gets ALL members in a guild (via ws)
     * @param guildId ID of guild
     */
    getMembers(guildId: Snowflake): Promise<Collection<any, APIGuildMember>>;
    /**
     * Whether or not all shards are online and ready
     */
    get ready(): boolean;
    /**
     * Log something to master
     * @param data What to log
     */
    log(...data: any[]): void;
    /**
     * Debug
     * @internal
     * @param msg Debug message
     */
    debug(msg: string): void;
}
