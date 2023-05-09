import { ENV, platformGuard } from '@ownclouders/k6-tdk/lib/utils'
import { AuthNProvider, Platform } from '@ownclouders/k6-tdk/lib/values'

import { Embedded, TestRootType } from './const'

export const envValues = () => {
  const values = {
    admin: {
      login: ENV('ADMIN_LOGIN', 'admin'),
      password: ENV('ADMIN_PASSWORD', 'admin')
    },
    sleep: {
      after_request: parseFloat(ENV('SLEEP_AFTER_REQUEST', '0.2')),
      after_iteration: parseFloat(ENV('SLEEP_AFTER_ITERATION', '0'))
    },
    seed: {
      container: {
        name: ENV('SEED_CONTAINER_NAME', 'cdperf'),
        get type(){
          return TestRootType[ENV(
            'ROOT_RESOURCE_TYPE',
            platformGuard(values.platform.type).isOwnCloudInfiniteScale ? TestRootType.space : TestRootType.directory
          )]
        }
      },
      users: {
        create: ENV('SEED_USERS_CREATE', 'true') === 'true',
        delete: ENV('SEED_USERS_DELETE', 'true') === 'true',
        total: parseInt(ENV('SEED_USERS_TOTAL', '25'), 10)
      },
      groups: {
        create: ENV('SEED_GROUPS_CREATE', 'true') === 'true',
        delete: ENV('SEED_GROUPS_DELETE', 'true') === 'true',
        total: parseInt(ENV('SEED_GROUPS_TOTAL', '1'), 10)
      },
      calendar: {
        root: ENV('DATA_CALENDAR_ROOT', 'calendar'),
        from_year: parseInt(ENV('DATA_CALENDAR_FROM_YEAR', '2023'), 10),
        to_year: parseInt(ENV('DATA_CALENDAR_TO_YEAR', '2023'), 10)
      },
      resource: {
        root: ENV('SEED_RESOURCE_ROOT', 'resource'),
        small: {
          name: ENV('SEED_RESOURCE_SMALL_NAME', 'small.zip'),
          size: parseInt(ENV('SEED_RESOURCE_SMALL_SIZE', '1'), 10) * 1000 * 1000
        },
        medium: {
          name: ENV('SEED_RESOURCE_MEDIUM_NAME', 'medium.zip'),
          size: parseInt(ENV('SEED_RESOURCE_MEDIUM_SIZE', '20'), 10) * 1000 * 1000
        },
        large: {
          name: ENV('SEED_RESOURCE_LARGE_NAME', 'large.zip'),
          size: parseInt(ENV('SEED_RESOURCE_LARGE_SIZE', '100'), 10) * 1000 * 1000
        }
      }
    },
    pool: {
      users: ENV('POOL_USERS', Embedded),
      groups: ENV('POOL_GROUPS', Embedded)
    },
    platform: {
      type: Platform[ENV('PLATFORM_TYPE', Platform.ownCloudInfiniteScale)],
      base_url: ENV('PLATFORM_BASE_URL', 'https://localhost:9200')
    },
    auth_n_provider: {
      type: AuthNProvider[ENV('AUTH_N_PROVIDER_TYPE', AuthNProvider.kopano)],
      kopano: {
        base_url: ENV('AUTH_N_PROVIDER_KOPANO_BASE_URL', 'https://localhost:9200'),
        redirect_url: ENV('AUTH_N_PROVIDER_KOPANO_REDIRECT_URL', 'https://localhost:9200/oidc-callback.html')
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
        }
      }
    }
  }

  return values
}
