import { AuthNHTTPProvider } from '@/auth'
import { Platform } from '@/const'
import { authNProviderForUser, defaultAuthNProvider, defaultPlatform } from '@/snippets'
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
    platformUrl?: string,
    platform?: Platform,
    userLogin?: string,
    userPassword?: string
    authNProvider?: AuthNHTTPProvider
  }) {

    if(!p.authNProvider && (!p.userLogin || !p.userPassword)){
      throw new Error('Please provide an "authNProvider" or "userLogin" and "userPassword"')
    }

    const platform = p.platform || defaultPlatform.type
    const platformUrl = p.platformUrl || defaultPlatform.url
    const authNProvider = p.authNProvider || authNProviderForUser({
      userLogin: p.userLogin!,
      userPassword: p.userPassword!,
      defaultProvider: defaultAuthNProvider.type
    })

    const request = requestFactory({
      authNProvider,
      baseUrl: platformUrl
    })

    this.application = new Application(platform, request)
    this.drive = new Drive(platform, request)
    this.group = new Group(platform, request)
    this.me = new Me(platform, request)
    this.resource = new Resource(platform, request)
    this.role = new Role(platform, request)
    this.search = new Search(platform, request)
    this.share = new Share(platform, request)
    this.tag = new Tag(platform, request)
    this.user = new User(platform, request)
  }
}
