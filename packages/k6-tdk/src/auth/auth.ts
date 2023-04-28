import { CookieJar } from 'k6/http'

export const AuthNProvider = {
  kopano: 'kopano',
  keycloak: 'keycloak',
  basicAuth: 'basicAuth'
} as const

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type AuthNProvider = (typeof AuthNProvider)[keyof typeof AuthNProvider];

export interface Token {
  accessToken: string;
  tokenType: string;
  idToken: string;
  expiresIn: number;
}


export interface AuthNHTTPProvider {
  header: string;
  jar: CookieJar
}
