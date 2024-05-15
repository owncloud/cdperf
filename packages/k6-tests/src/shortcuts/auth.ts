import { AuthNHTTPProvider, BasicAuth, Eduteams, Keycloak, Kopano } from '@ownclouders/k6-tdk/lib/auth'
import { CookieJar } from 'k6/http'

import { AuthNProvider, envValues } from '@/values'

export const authNProviderFor = (p: {
  userLogin: string,
  userPassword: string,
  jar: CookieJar
}): AuthNHTTPProvider => {
  const values = envValues()

  switch (values.auth_n_provider.type) {
    case AuthNProvider.basicAuth:
      return new BasicAuth(p)
    case AuthNProvider.keycloak:
      return new Keycloak({
        ...p,
        realm: values.auth_n_provider.keycloak.realm,
        baseUrl: values.auth_n_provider.keycloak.base_url,
        redirectUrl: values.auth_n_provider.keycloak.redirect_url,
        clientId: values.auth_n_provider.keycloak.client_id,
        socialProviderRealm: values.auth_n_provider.keycloak.social_provider_realm
      })
    case AuthNProvider.eduteams:
      return new Eduteams({
        ...p,
        redirectUrl: values.auth_n_provider.eduteams.redirect_url,
        clientId: values.auth_n_provider.eduteams.client_id,
        openidConfigurationUrl: values.auth_n_provider.eduteams.openid_configuration_url
      })
    case AuthNProvider.kopano:
    default:
      return new Kopano({
        ...p,
        baseUrl: values.auth_n_provider.kopano.base_url,
        redirectUrl: values.auth_n_provider.kopano.redirect_url,
        clientId: values.auth_n_provider.kopano.client_id
      })
  }
}
