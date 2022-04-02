import { APIGuild, Snowflake } from 'discord-api-types/v9'
import { workerData, parentPort, MessagePort } from 'worker_threads'

import { ClusterStats, ThreadComms, ThreadEvents } from '../ThreadComms'

import { inspect } from 'util'

import { handlers } from './handlers'
import { Worker } from '../worker/Worker'

/**
 * Thread interface for interacting with the master process from a worker
 */
export class Thread extends ThreadComms {
  public id: string

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  constructor (public worker: Worker = {} as Worker, register = true) {
    super()
    if (register) {
      this.id = workerData.id
      super.register(parentPort as MessagePort)

      const keys = Object.keys(handlers)
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i] as keyof ThreadEvents

        this.on(key, (data, resolve) => {
          handlers[key]?.bind(this)(data, resolve)
        })
      }

      this.tell('BEGIN', null)
    }
  }

  async registerShard (id: number): Promise<{}> {
    return await this.sendCommand('REGISTER_SHARD', { id })
  }

  /**
   * Destroys entire master.
   */
  destroy (): void {
    void this.sendCommand('KILL', null)
  }

  /**
   * Logs data to master's MasterOptions.log
   * @param message Message args
   */
  log (...messages: any[]): void {
    this.tell('LOG', messages.map(m => typeof m === 'string' ? m : inspect(m)).join(' '))
  }

  /**
   * Restarts a specific cluster
   * @param clusterId ID of cluster
   */
  restartCluster (clusterId: string): void {
    return this.tell('RESTART_CLUSTER', { id: clusterId })
  }

  /**
   * Restarts a specific shard
   * @param shardId ID of shard
   */
  restartShard (shardId: any): void {
    return this.tell('RESTART_SHARD', { id: shardId })
  }

  /**
   * Gets a cached guild across clusters
   * @param guildId ID of guild
   * @returns The guild
   */
  async getGuild (guildId: Snowflake): Promise<APIGuild> {
    return await this.sendCommand('GET_GUILD', { id: guildId })
  }

  /**
   * Eval code on every cluster
   * @param code Code to eval
   * @returns Response
   */
  async broadcastEval (code: string): Promise<any[]> {
    return await this.sendCommand('BROADCAST_EVAL', code)
  }

  /**
   * Evals code on the master process
   * @param code Code to eval
   * @returns Response
   */
  async masterEval (code: string): Promise<any> {
    return await this.sendCommand('MASTER_EVAL', code)
  }

  /**
   * Gets an array of each clusters stats
   * @returns Stats
   */
  async getStats (): Promise<ClusterStats[]> {
    return await this.sendCommand('STATS', null)
  }
}
