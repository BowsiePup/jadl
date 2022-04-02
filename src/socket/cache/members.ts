import Collection from '@discordjs/collection'
import { GatewayGuildMemberAddDispatchData, Snowflake } from 'discord-api-types/v9'
import { Worker } from '../../clustering/worker/Worker'
import { CacheManager } from '../CacheManager'

export function members (events: CacheManager, worker: Worker): void {
  worker.members = new Collection()

  events.on('GUILD_MEMBER_ADD', (m) => {
    let member = Object.assign({}, m)
    let guildMembers = worker.members.get(member.guild_id)
    if (!guildMembers) {
      guildMembers = new Collection()
      worker.members.set(member.guild_id, guildMembers)
    }

    if (worker.options.cacheControl.members) {
      const newMember = {} as GatewayGuildMemberAddDispatchData
      worker.options.cacheControl.members.forEach(key => {
        newMember[key] = member[key] as never
      })
      newMember.guild_id = member.guild_id
      newMember.user = member.user
      member = newMember
    }

    guildMembers.set(member.user?.id as Snowflake, member)
  })

  events.on('GUILD_MEMBER_UPDATE', (member) => {
    const guildMembers = worker.members.get(member.guild_id)
    if (!guildMembers) return
    const currentMember = guildMembers.get(member.user?.id)
    if (!currentMember) return

    if (worker.options.cacheControl.members) {
      worker.options.cacheControl.members.forEach(key => {
        currentMember[key] = currentMember[key] as never
      })
      currentMember.guild_id = member.guild_id
      currentMember.user = member.user
    } else {
      Object.keys(member).forEach(key => {
        currentMember[key] = member[key]
      })
    }

    guildMembers.set(member.user?.id, currentMember)
  })

  events.on('GUILD_MEMBER_REMOVE', (member) => {
    const guildMembers = worker.members.get(member.guild_id)
    if (!guildMembers) return

    guildMembers.delete(member.user.id)
  })

  events.on('GUILD_DELETE', (guild) => {
    if (guild.unavailable) return

    worker.members.delete(guild.id)
  })
}
