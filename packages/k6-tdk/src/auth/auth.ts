import { CookieJar } from 'k6/http'

export interface Token {
  refreshToken: string;
  accessToken: string;
  tokenType: string;
  idToken: string;
  expiresIn: number;
}


export interface AuthNHTTPProvider {
  info: { userLogin: string; userPassword: string };
  header: string;
  jar: CookieJar
}
