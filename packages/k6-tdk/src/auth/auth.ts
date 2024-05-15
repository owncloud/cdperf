export interface Token {
  refreshToken: string;
  accessToken: string;
  tokenType: string;
  idToken: string;
  expiresIn: number;
}

export interface AuthNHTTPProvider {
  headers: { [name: string]: string };
}
