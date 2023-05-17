import { HttpClient } from '@/utils'
import { Platform } from '@/values'

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
  readonly application: Application

  readonly drive: Drive

  readonly me: Me

  readonly group: Group

  readonly resource: Resource

  readonly role: Role

  readonly search: Search

  readonly share: Share

  readonly tag: Tag

  readonly user: User

  readonly httpClient: HttpClient


  constructor(p: { platform: Platform, httpClient: HttpClient }) {
    this.httpClient = p.httpClient

    this.application = new Application(p.platform, p.httpClient)
    this.drive = new Drive(p.platform, p.httpClient)
    this.group = new Group(p.platform, p.httpClient)
    this.me = new Me(p.platform, p.httpClient)
    this.resource = new Resource(p.platform, p.httpClient)
    this.role = new Role(p.platform, p.httpClient)
    this.search = new Search(p.platform, p.httpClient)
    this.share = new Share(p.platform, p.httpClient)
    this.tag = new Tag(p.platform, p.httpClient)
    this.user = new User(p.platform, p.httpClient)
  }
}
