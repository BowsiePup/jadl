import Collection from '@discordjs/collection'
import { APIChannel } from 'discord-api-types/v9'
import { Worker } from '../../clustering/worker/Worker'
import { CachedChannel } from '../../typings/Discord'
import { CacheManager } from '../CacheManager'

export function channels (events: CacheManager, worker: Worker): void {
  worker.channels = new Collection()

  events.on('CHANNEL_CREATE', (c) => {
    if (worker.options.cache.channels !== true && !worker.options.cache.channels.includes(c.type)) return
    let channel = Object.assign({}, c) as CachedChannel
    if (worker.options.cacheControl.channels) {
      const newChannel = {} as CachedChannel
      worker.options.cacheControl.channels.forEach(key => {
        newChannel[key] = channel[key] as never
      })
      newChannel.guild_id = channel.guild_id
      newChannel.id = channel.id
      channel = newChannel
    }
    worker.channels.set(channel.id, channel)
  })

  events.on('CHANNEL_UPDATE', (channel) => {
    if (worker.options.cache.channels !== true && !worker.options.cache.channels.includes(channel.type)) return

    const currentChannel = worker.channels.get(channel.id)
    if (!currentChannel) return

    if (worker.options.cacheControl.channels) {
      worker.options.cacheControl.channels.forEach(key => {
        currentChannel[key] = channel[key] as never
      })
      currentChannel.guild_id = (channel as CachedChannel).guild_id
      currentChannel.id = channel.id
    } else {
      Object.keys(channel).forEach(key => {
        currentChannel[key] = channel[key]
      })
    }

    worker.channels.set(channel.id, currentChannel)
  })

  events.on('CHANNEL_DELETE', (channel) => {
    worker.channels.delete(channel.id)
  })

  events.on('GUILD_DELETE', (guild) => {
    if (guild.unavailable) return

    worker.channels.filter(x => x.guild_id === guild.id)
      .forEach(x => worker.channels.delete(x.id))
  })
}
