"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatBotOptions = void 0;
const Master_1 = require("../clustering/master/Master");
function formatBotOptions(options) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const opts = {
        token: options.token,
        shards: options.shards ?? 'auto',
        shardsPerCluster: options.shardsPerCluster ?? 5,
        shardOffset: options.shardOffset ?? 0,
        cache: options.cache === false
            ? {
                guilds: false,
                roles: false,
                channels: false,
                self: false,
                members: false,
                messages: false,
                users: false,
                voiceStates: false
            }
            : {
                guilds: options.cache?.guilds ?? true,
                roles: options.cache?.roles ?? true,
                channels: options.cache?.channels ?? true,
                self: options.cache?.self ?? true,
                members: options.cache?.members ?? false,
                messages: options.cache?.messages ?? false,
                users: options.cache?.users ?? false,
                voiceStates: options.cache?.voiceStates ?? false
            },
        cacheControl: options.cacheControl ?? {
            channels: false,
            guilds: false,
            members: false,
            roles: false
        },
        ws: options.ws ?? '',
        intents: options.intents ? options.intents : Object.values(Master_1.Intents).reduce((a, b) => a | b) & ~Master_1.Intents.GUILD_MEMBERS & ~Master_1.Intents.GUILD_PRESENCES,
        warnings: {
            cachedIntents: options.warnings?.cachedIntents ?? true
        },
        log: options.log,
        spawnTimeout: options.spawnTimeout ?? 5100,
        clusterStartRetention: options.clusterStartRetention ?? 3
    };
    if (opts.warnings?.cachedIntents) {
        const warn = (key, intent) => console.warn(`WARNING: CacheOptions.${key} was turned on, but is missing the ${intent} intent. Meaning your cache with be empty. Either turn this on, or if it's intentional set Options.warnings.cachedIntents to false.`);
        if (opts.cache?.guilds && ((opts.intents & Master_1.Intents.GUILDS) === 0))
            warn('guilds', 'GUILDS');
        if (opts.cache?.roles && ((opts.intents & Master_1.Intents.GUILDS) === 0))
            warn('roles', 'GUILDS');
        if (opts.cache?.channels && ((opts.intents & Master_1.Intents.GUILDS) === 0))
            warn('channels', 'GUILDS');
        if (opts.cache?.members && ((opts.intents & Master_1.Intents.GUILD_MEMBERS) === 0))
            warn('members', 'GUILD_MEMBERS');
        if (opts.cache?.messages && ((opts.intents & Master_1.Intents.GUILD_MESSAGES) === 0))
            warn('messages', 'GUILD_MESSAGES');
    }
    return opts;
}
exports.formatBotOptions = formatBotOptions;
