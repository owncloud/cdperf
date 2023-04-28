import { AuthNHTTPProvider } from '@/auth'
import { Client } from '@/client'
import { Platform } from '@/const'

import { defaultAdmin } from './defaults'

export const clientForAdmin = (p: {
  platformUrl?: string,
  platform?: Platform,
  authNProvider?: AuthNHTTPProvider
} = {}): Client => {
  return new Client({
    userLogin: defaultAdmin.login,
    userPassword: defaultAdmin.password,
    platformUrl: p.platformUrl,
    platform: p.platform,
    authNProvider: p.authNProvider
  })
}
