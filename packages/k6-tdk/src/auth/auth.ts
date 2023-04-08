export const Adapter = {
  openIDConnect: 'openIDConnect',
  basicAuth: 'basicAuth'
} as const;

export type Adapter = (typeof Adapter)[keyof typeof Adapter];

export interface Account {
  login: string;
  password: string;
}

export interface Token {
  accessToken: string;
  tokenType: string;
  idToken: string;
  expiresIn: number;
}

export type Credential = Token | Account;

export interface Authenticator {
  header: string;
}
