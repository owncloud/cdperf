import { HttpClient } from '@/utils'

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


  constructor(p: { httpClient: HttpClient }) {
    this.httpClient = p.httpClient

    this.application = new Application(p.httpClient)
    this.drive = new Drive(p.httpClient)
    this.group = new Group(p.httpClient)
    this.me = new Me(p.httpClient)
    this.resource = new Resource(p.httpClient)
    this.role = new Role(p.httpClient)
    this.search = new Search(p.httpClient)
    this.share = new Share(p.httpClient)
    this.tag = new Tag(p.httpClient)
    this.user = new User(p.httpClient)
  }
}
