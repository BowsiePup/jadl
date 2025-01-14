"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlers = void 0;
exports.handlers = {
    REGISTER_SHARD: function ({ id }, respond) {
        this.sharder?.register(id);
        this.debug(`Registered shard ${id}`);
        respond({});
    },
    SHARD_READY: async function ({ id }, _) {
        this.log(`Shard ${id} connected to Discord`);
    },
    LOG: function (data, _) {
        this.log(data);
    },
    DEBUG: function (msg) {
        this.debug(msg);
    },
    RESTART_CLUSTER: function ({ id }, _) {
        console.warn("RESTART_CLUSTER is being used in Singleton mode, process.exit()ing");
        process.exit();
    },
    RESTART_SHARD: function ({ id }, _) {
        this.shards.get(id)?.restart(true);
    },
    GET_GUILD: async function ({ id }, respond) {
        const guild = this.guilds.get(id);
        if (!guild)
            return respond({ error: "Not in guild" });
        if (this.guildRoles) {
            guild.roles = this.guildRoles.get(guild.id)?.array() ?? [];
        }
        if (this.channels) {
            guild.channels = this.channels
                .filter((x) => x.guild_id === guild.id)
                .array();
        }
        respond(guild);
    },
    BROADCAST_EVAL: async function (code, respond) {
        respond({ error: "BROADCAST_EVAL cannot be used in Singleton mode" });
    },
    MASTER_EVAL: async function (code, respond) {
        respond?.({ error: "MASTER_EVAL cannot be used in Singleton mode" });
    },
    STATS: async function (_, respond) {
        respond([
            {
                cluster: {
                    id: this.comms.id,
                    memory: process.memoryUsage().heapTotal,
                    uptime: process.uptime(),
                },
                shards: this.shards.map((x) => ({
                    id: x.id,
                    ping: x.ping,
                    guilds: this.guilds.filter?.((guild) => this.guildShard(guild.id).id === x.id).size,
                    state: x.state,
                })),
            },
        ]);
    },
};
