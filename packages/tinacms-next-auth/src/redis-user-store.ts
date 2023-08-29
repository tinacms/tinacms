import { Redis } from '@upstash/redis'
import { UserStore } from './types'
import { hashPassword } from './utils'

export class RedisUserStore implements UserStore {
  private redis: Redis
  constructor(
    private authCollectionName: string,
    opts: {
      url: string
      token: string
    }
  ) {
    this.redis = new Redis(opts)
  }

  async addUser(username: string, password: string): Promise<boolean> {
    const user = {
      name: username,
      username,
      password: await hashPassword(password),
    }
    if (!(await this.isInitialized())) {
      await this.redis.json.set(this.authCollectionName, '$', {})
    }

    return (
      (await this.redis.json.set(
        this.authCollectionName,
        `$.["${username}"]`,
        user
      )) === 'OK'
    )
  }

  async getUser(username: string) {
    const keys = await this.redis.json.objkeys(
      this.authCollectionName,
      `$.["${username}"]`
    )
    if (keys && keys.length > 0) {
      const user = await this.redis.json.get(
        this.authCollectionName,
        `$.["${username}"]`
      )
      if (user) {
        return user[0]
      }
    }
  }

  async getUsers() {
    const users = await this.redis.json.get(this.authCollectionName)
    if (users) {
      return Object.values(users) as any[]
    }
    return []
  }

  async isInitialized() {
    const users = await this.redis.json.get(this.authCollectionName)
    return users && Object.keys(users).length > 0
  }

  async deleteUser(username: string) {
    const user = await this.getUser(username)
    if (!user) {
      throw new Error(`User ${username} not found`)
    }
    return (
      (await this.redis.json.del(
        this.authCollectionName,
        `$.["${username}"]`
      )) === 1
    )
  }

  async updatePassword(username: string, password: string) {
    const user = await this.getUser(username)
    if (!user) {
      throw new Error(`User ${username} not found`)
    }
    const hash = await hashPassword(password)
    return (
      (await this.redis.json.set(
        this.authCollectionName,
        `$.["${username}"].password`,
        `"${hash}"`
      )) === 'OK'
    )
  }
}
