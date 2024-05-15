import { ENV, platformGuard } from '@ownclouders/k6-tdk/lib/utils'
import { Platform } from '@ownclouders/k6-tdk/lib/values'

import { AuthNProvider, Embedded, TestRootType } from './const'

export const envValues = () => {
  const values = {
    admin: {
      get login() {
        return ENV('ADMIN_LOGIN', 'admin')
      },
      get password() {
        return ENV('ADMIN_PASSWORD', 'admin')
      }
    },
    sleep: {
      get after_request() {
        return parseFloat(ENV('SLEEP_AFTER_REQUEST', '1'))
      },
      get after_iteration() {
        return parseFloat(ENV('SLEEP_AFTER_ITERATION', '0'))
      }
    },
    seed: {
      container: {
        get name() {
          return ENV('SEED_CONTAINER_NAME', 'cdperf')
        },
        get type() {
          return TestRootType[ENV(
            'SEED_CONTAINER_TYPE',
            platformGuard(values.platform.type).isOwnCloudInfiniteScale ? TestRootType.space : TestRootType.directory
          )]
        }
      },
      users: {
        get create() {
          return ENV('SEED_USERS_CREATE', 'true') === 'true'
        },
        get delete() {
          return ENV('SEED_USERS_DELETE', 'true') === 'true'
        },
        get total() {
          return parseInt(ENV('SEED_USERS_TOTAL', '25'), 10)
        }
      },
      groups: {
        get create(){
          return ENV('SEED_GROUPS_CREATE', 'true') === 'true'
        },
        get delete() {
          return ENV('SEED_GROUPS_DELETE', 'true') === 'true'
        },
        get total(){
          return parseInt(ENV('SEED_GROUPS_TOTAL', '1'), 10)
        }
      },
      calendar: {
        get root(){
          return ENV('DATA_CALENDAR_ROOT', 'calendar')
        },
        get from_year(){
          return parseInt(ENV('DATA_CALENDAR_FROM_YEAR', '2023'), 10)
        },
        get to_year(){
          return parseInt(ENV('DATA_CALENDAR_TO_YEAR', '2023'), 10)
        }
      },
      resource: {
        get root(){
          return ENV('SEED_RESOURCE_ROOT', 'resource')
        },
        small: {
          get name(){
            return ENV('SEED_RESOURCE_SMALL_NAME', 'small.zip')
          },
          get size(){
            return parseInt(ENV('SEED_RESOURCE_SMALL_SIZE', '1'), 10) * 1000 * 1000
          }
        },
        medium: {
          get name(){
            return ENV('SEED_RESOURCE_MEDIUM_NAME', 'medium.zip')
          },
          get size(){
            return parseInt(ENV('SEED_RESOURCE_MEDIUM_SIZE', '20'), 10) * 1000 * 1000
          }
        },
        large: {
          get name(){
            return ENV('SEED_RESOURCE_LARGE_NAME', 'large.zip')
          },
          get size(){
            return parseInt(ENV('SEED_RESOURCE_LARGE_SIZE', '100'), 10) * 1000 * 1000
          }
        }
      }
    },
    pool: {
      get users(){
        return ENV('POOL_USERS', Embedded)
      },
      get groups(){
        return ENV('POOL_GROUPS', Embedded)
      }
    },
    platform: {
      get type(){
        return Platform[ENV('PLATFORM_TYPE', Platform.ownCloudInfiniteScale)]
      },
      get base_url(){
        return ENV('PLATFORM_BASE_URL', 'https://localhost:9200')
      }
    },
    auth_n_provider: {
      get type(){
        return AuthNProvider[ENV('AUTH_N_PROVIDER_TYPE', AuthNProvider.kopano)]
      },
      kopano: {
        get base_url(){
          return ENV('AUTH_N_PROVIDER_KOPANO_BASE_URL', 'https://localhost:9200')
        },
        get redirect_url(){
          return ENV('AUTH_N_PROVIDER_KOPANO_REDIRECT_URL', 'https://localhost:9200/oidc-callback.html')
        },
        get client_id(){
          return ENV('AUTH_N_PROVIDER_KOPANO_CLIENT_ID', 'web')
        }
      },
      eduteams: {
        get redirect_url() {
          return ENV('AUTH_N_PROVIDER_EDUTEAMS_REDIRECT_URL')
        },
        get client_id(){
          return ENV('AUTH_N_PROVIDER_EDUTEAMS_CLIENT_ID', 'web')
        },
        get openid_configuration_url(){
          return ENV('AUTH_N_PROVIDER_EDUTEAMS_OPENID_CONFIGURATION_URL')
        }
      },
      keycloak: {
        get realm() {
          return ENV('AUTH_N_PROVIDER_KEYCLOAK_REALM')
        },
        get base_url() {
          return ENV('AUTH_N_PROVIDER_KEYCLOAK_BASE_URL')
        },
        get redirect_url() {
          return ENV('AUTH_N_PROVIDER_KEYCLOAK_REDIRECT_URL')
        },
        get social_provider_realm() {
          const v = ENV('AUTH_N_PROVIDER_KEYCLOAK_SOCIAL_PROVIDER_REALM', 'none')
          return v === 'none' ? undefined : v
        },
        get client_id(){
          return ENV('AUTH_N_PROVIDER_KEYCLOAK_CLIENT_ID', 'web')
        }
      }
    },
    only_office: {
      get wss_url() {
        return ENV('ONLY_OFFICE_WSS_URL', 'wss://localhost:9981/7.3.3-49')
      },
      get app_name() {
        return ENV('ONLY_OFFICE_APP_NAME', 'OnlyOffice')
      }
    }
  }

  return values
}
