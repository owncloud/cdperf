export const TestRootType = {
  directory: 'directory',
  space: 'space'
} as const

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type TestRootType = (typeof TestRootType)[keyof typeof TestRootType];

export const AuthNProvider = {
  kopano: 'kopano',
  keycloak: 'keycloak',
  basicAuth: 'basicAuth'
} as const

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type AuthNProvider = (typeof AuthNProvider)[keyof typeof AuthNProvider];

export const Embedded = 'embedded'
