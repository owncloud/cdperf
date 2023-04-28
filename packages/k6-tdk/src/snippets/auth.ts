import { AuthNHTTPProvider, AuthNProvider, BasicAuth, Kopano } from '@/auth'
import { Keycloak } from '@/auth/keycloak'
import { ENV } from '@/utils'

import { defaultAuthNProvider } from './defaults'

export const authNProviderForUser = (p: {
  userLogin: string,
  userPassword: string,
  defaultProvider?: AuthNProvider
}): AuthNHTTPProvider => {
  switch (p.defaultProvider || defaultAuthNProvider.type) {
    case AuthNProvider.basicAuth:
      return new BasicAuth(p)
    case AuthNProvider.keycloak:
      return new Keycloak({
        ...p,
        baseUrl: ENV('KEYCLOAK_URL'),
        realm: ENV('KEYCLOAK_REALM'),
        redirectUrl: ENV('KEYCLOAK_REDIRECT_URL')
      })
    case AuthNProvider.kopano:
    default:
      return new Kopano({
        ...p,
        ...defaultAuthNProvider.kopano
      })
  }
}
