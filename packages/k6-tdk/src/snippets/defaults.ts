import { AuthNProvider } from '@/auth'
import { Platform } from '@/const'
import { ENV } from '@/utils'

export const defaultAdmin = {
  login: ENV('ADMIN_LOGIN', 'admin'),
  password: ENV('ADMIN_PASSWORD', 'admin')
} as const

export const defaultPlatform = {
  type: Platform[ENV('PLATFORM', Platform.ownCloudInfiniteScale)],
  url: ENV('PLATFORM_URL', 'https://localhost:9200')
} as const

export const defaultAuthNProvider = {
  type: AuthNProvider[ENV('AUTH_N_PROVIDER', AuthNProvider.kopano)],
  kopano: {
    baseUrl: ENV('KOPANO_URL', 'https://localhost:9200'),
    redirectUrl: ENV('KOPANO_REDIRECT_URL', 'https://localhost:9200/oidc-callback.html')
  }
} as const
