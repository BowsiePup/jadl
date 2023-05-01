import { APIEmbed } from 'discord-api-types/v9';
export { ClusterStats, ShardStats, State, ThreadEvents } from './clustering/ThreadComms';
export { BaseBotOptions, BotOptions } from './typings/options';
export { Master } from './clustering/master/Master';
export * from './clustering/master/Cluster';
export * from './clustering/master/Sharder';
export * from './clustering/worker/Worker';
export * from './clustering/worker/Thread';
export * from './clustering/worker/single/SingleWorker';
export * from './socket/Shard';
export { PermissionUtils, humanReadablePermissions } from './utils/Permissions';
export { DiscordEventMap, CachedGuild, CachedVoiceState } from './typings/Discord';
export { Snowflake } from 'discord-api-types/v9';
declare global {
    namespace NodeJS {
        interface Global {
            ROSE_DEFAULT_EMBED: APIEmbed;
        }
    }
}
