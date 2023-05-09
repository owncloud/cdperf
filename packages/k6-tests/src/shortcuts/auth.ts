import { AuthNHTTPProvider, BasicAuth, Keycloak, Kopano } from '@ownclouders/k6-tdk/lib/auth'
import { AuthNProvider } from '@ownclouders/k6-tdk/lib/values'

import { envValues } from '@/values'

export const authNProviderFor = (p: {
  userLogin: string,
  userPassword: string,
}): AuthNHTTPProvider => {
  const values = envValues()

  switch (values.auth_n_provider.type) {
    case AuthNProvider.basicAuth:
      return new BasicAuth(p)
    case AuthNProvider.keycloak:
      return new Keycloak({
        userLogin: p.userLogin,
        userPassword: p.userPassword,
        realm: values.auth_n_provider.keycloak.realm,
        baseUrl: values.auth_n_provider.keycloak.base_url,
        redirectUrl: values.auth_n_provider.keycloak.redirect_url
      })
    case AuthNProvider.kopano:
    default:
      return new Kopano({
        userLogin: p.userLogin,
        userPassword: p.userPassword,
        baseUrl: values.auth_n_provider.kopano.base_url,
        redirectUrl: values.auth_n_provider.kopano.redirect_url
      })
  }
}
