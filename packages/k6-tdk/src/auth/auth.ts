export const Adapter = {
  kopano: 'kopano',
  basicAuth: 'basicAuth'
} as const

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Adapter = (typeof Adapter)[keyof typeof Adapter];

export interface Token {
  accessToken: string;
  tokenType: string;
  idToken: string;
  expiresIn: number;
}


export interface Authenticator {
  header: string;
}
