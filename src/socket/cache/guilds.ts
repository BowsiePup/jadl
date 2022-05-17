import Collection from "@discordjs/collection"
import { Worker } from "../../clustering/worker/Worker"
import { CacheManager } from "../CacheManager"

import { GatewayGuildMemberAddDispatchData } from "discord-api-types/v9"
import { EventedGuild } from "../../typings/Discord"

export function guilds(events: CacheManager, worker: Worker): void {
  worker.guilds = new Collection()

  events.on("GUILD_CREATE", (g) => {
    let guild = Object.assign({}, g) as EventedGuild & {
      members?
      channels?
      presences?
    }
    guild.members?.forEach((member) => {
      member.guild_id = guild.id
      events.emit(
        "GUILD_MEMBER_ADD",
        member as GatewayGuildMemberAddDispatchData
      )
    })
    delete guild.members

    guild.channels?.forEach((channel) => {
      (channel as any).guild_id = guild.id
      events.emit("CHANNEL_CREATE", channel as any)
    })
    delete guild.channels

    guild.roles.forEach((role) => {
      events.emit("GUILD_ROLE_CREATE", { guild_id: guild.id, role })
    })
    guild.roles = []
    delete guild.presences

    if (worker.options.cacheControl.guilds) {
      const newGuild = {} as typeof guild
      worker.options.cacheControl.guilds.forEach((key) => {
        newGuild[key] = guild[key] as never
      })
      newGuild.id = guild.id
      guild = newGuild
    }

    worker.guilds.set(guild.id, guild)
  })

  events.on("GUILD_UPDATE", (guild) => {
    const currentGuild = worker.guilds.get(guild.id)
    if (!currentGuild) return

    if (worker.options.cacheControl.guilds) {
      worker.options.cacheControl.guilds.forEach((key) => {
        currentGuild[key] = guild[key] as never
      })
      currentGuild.id = guild.id
    } else {
      Object.keys(guild).forEach((key) => {
        currentGuild[key] = guild[key]
      })
    }

    worker.guilds.set(guild.id, currentGuild)
  })

  events.on("GUILD_DELETE", (guild) => {
    if (guild.unavailable) return

    worker.guilds.delete(guild.id)
  })
}
