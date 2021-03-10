import Collection from '@discordjs/collection';
import { Worker } from '../../clustering/worker/Worker';
import { CacheManager } from '../CacheManager';

import { APIGuild, GatewayGuildMemberAddDispatchData } from 'discord-api-types'
import { CachedGuild } from '../../typings/Discord';

export function guilds (events: CacheManager, worker: Worker) {
  worker.guilds = new Collection()

  events.add('GUILD_CREATE', (guild) => {
    guild.members?.forEach(member => {
      // @ts-ignore For proper cache formatting
      member.guild_id = guild.id
      events.run('GUILD_MEMBER_ADD', member as GatewayGuildMemberAddDispatchData)
    })
    delete guild.members

    guild.channels?.forEach(channel => {
      channel.guild_id = guild.id
      events.run('CHANNEL_CREATE', channel)
    })
    delete guild.channels

    guild.roles.forEach(role => {
      events.run('GUILD_ROLE_CREATE', { guild_id: guild.id, role })
    })
    guild.roles = []
    delete guild.presences

    if (worker.options.cacheControl.guilds) {
      const newGuild = {} as APIGuild
      worker.options.cacheControl.guilds.forEach(key => {
        newGuild[key] = guild[key] as never
      })
      newGuild.id = guild.id
      guild = newGuild
    }

    worker.guilds.set(guild.id, guild)
  })

  events.add('GUILD_UPDATE', (guild) => {
    let currentGuild = worker.guilds.get(guild.id)
    if (!currentGuild) return

    currentGuild.name = guild.name
    currentGuild.region = guild.region
    currentGuild.verification_level = guild.verification_level
    currentGuild.default_message_notifications= guild.default_message_notifications
    currentGuild.explicit_content_filter = guild.explicit_content_filter
    currentGuild.afk_channel_id = guild.afk_channel_id
    currentGuild.afk_timeout = guild.afk_timeout
    currentGuild.icon = guild.icon
    currentGuild.owner_id = guild.owner_id
    currentGuild.splash = guild.splash
    currentGuild.banner = guild.banner
    currentGuild.system_channel_id = guild.system_channel_id
    currentGuild.rules_channel_id = guild.rules_channel_id
    currentGuild.public_updates_channel_id = guild.public_updates_channel_id
    currentGuild.preferred_locale = guild.preferred_locale

    if (worker.options.cacheControl.guilds) {
      const newGuild = {} as APIGuild
      worker.options.cacheControl.guilds.forEach(key => {
        (currentGuild as CachedGuild)[key] = guild[key] as never
      })
      newGuild.id = guild.id
      currentGuild = newGuild
    }

    worker.guilds.set(guild.id, currentGuild)
  })

  events.add('GUILD_DELETE', (guild) => {
    if (guild.unavailable) return worker.emit('GUILD_UNAVAILABLE', worker.guilds.get(guild.id) as CachedGuild)

    worker.guilds.delete(guild.id)
  })
}