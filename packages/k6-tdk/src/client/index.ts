import { CookieJar } from 'k6/http'

import { Adapter, Authenticator, BasicAuth, Kopano } from '@/auth'
import { Platform } from '@/const'
import { requestFactory } from '@/utils'

import { Application } from './application'
import { Drive } from './drive'
import { Group } from './group'
import { Me } from './me'
import { Resource } from './resource'
import { Role } from './role'
import { Search } from './search'
import { Share } from './share'
import { Tag } from './tag'
import { User } from './user'

export * from './client'

export class Client {
  application: Application

  drive: Drive

  me: Me

  group: Group

  resource: Resource

  role: Role

  search: Search

  share: Share

  tag: Tag

  user: User

  constructor(p: {
    baseUrl: string,
    platform: Platform,
    authAdapter: Adapter,
    userLogin: string,
    userPassword: string
  }) {
    let authn: Authenticator
    switch (p.authAdapter) {
      case Adapter.basicAuth:
        authn = new BasicAuth(p)
        break
      case Adapter.kopano:
      default:
        authn = new Kopano(p)
        break
    }

    const request = requestFactory({
      authn,
      baseUrl: p.baseUrl,
      params: {
        jar: new CookieJar()
      }
    })

    this.application = new Application(p.platform, request)
    this.drive = new Drive(p.platform, request)
    this.group = new Group(p.platform, request)
    this.me = new Me(p.platform, request)
    this.resource = new Resource(p.platform, request)
    this.role = new Role(p.platform, request)
    this.search = new Search(p.platform, request)
    this.share = new Share(p.platform, request)
    this.tag = new Tag(p.platform, request)
    this.user = new User(p.platform, request)
  }
}
