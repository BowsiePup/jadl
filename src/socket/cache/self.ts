import Collection from '@discordjs/collection'
import { GatewayGuildMemberAddDispatchData } from 'discord-api-types/v9'
import { Worker } from '../../clustering/worker/Worker'
import { CacheManager } from '../CacheManager'

export function self (events: CacheManager, worker: Worker): void {
  worker.selfMember = new Collection()

  events.on('GUILD_MEMBER_ADD', (member) => {
    if (member.user?.id !== worker.user.id) return

    worker.selfMember.set(member.guild_id, member)
  })

  events.on('GUILD_MEMBER_UPDATE', (member) => {
    if (member.user?.id !== worker.user.id) return

    const currentMember = worker.selfMember.get(member.guild_id) as typeof member
    if (!currentMember) return worker.selfMember.set(member.guild_id, member as unknown as GatewayGuildMemberAddDispatchData)

    Object.keys(member).forEach(key => {
      currentMember[key] = member[key]
    })

    worker.selfMember.set(member.guild_id, currentMember as GatewayGuildMemberAddDispatchData)
  })

  events.on('GUILD_DELETE', (guild) => {
    if (guild.unavailable) return

    worker.selfMember.delete(guild.id)
  })
}
