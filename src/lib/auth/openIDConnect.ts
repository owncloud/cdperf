import { fail } from 'k6';
import http from 'k6/http';
import { get } from 'lodash';

import { objectToQueryString, queryStringToObject } from '../utils';
import { Account, Token } from './auth';

export class OpenIDConnect {
  #account: Account;
  #baseURL: string;
  #redirectURL: string;
  #logonURL: string;
  #tokenURL: string;
  #cache?: {
    validTo: Date;
    token: Token;
  };
  constructor(account: Account, baseURL: string) {
    this.#account = account;
    this.#baseURL = baseURL;
    this.#redirectURL = `${baseURL}/oidc-callback.html`;
    this.#logonURL = `${baseURL}/signin/v1/identifier/_/logon`;
    this.#tokenURL = `${baseURL}/konnect/v1/token`;
  }

  public get credential(): Token {
    if (!this.#cache || this.#cache.validTo <= new Date()) {
      const continueURI = this.getContinueURI();
      const code = this.getCode(continueURI);
      const token = this.getToken(code);
      this.#cache = {
        validTo: ((): Date => {
          const offset = 5;
          const d = new Date();

          d.setSeconds(d.getSeconds() + token.expiresIn - offset);

          return d;
        })(),
        token,
      };
    }

    return this.#cache.token;
  }

  private getContinueURI(): string {
    const logonResponse = http.post(
      this.#logonURL,
      JSON.stringify({
        params: [this.#account.login, this.#account.password, '1'],
        hello: {
          scope: 'openid profile email',
          client_id: 'web',
          redirect_uri: this.#redirectURL,
          flow: 'oidc',
        },
        state: '22db4af49efce268',
      }),
      {
        headers: {
          'Kopano-Konnect-XSRF': '1',
          Referer: this.#baseURL,
          'Content-Type': 'application/json',
        },
      },
    );
    const continueURI = get(logonResponse.json(), 'hello.continue_uri');
    if (logonResponse.status !== 200 || !continueURI) {
      fail(this.#logonURL);
    }

    return continueURI;
  }

  private getCode(continueURI: string): string {
    const authorizeUri = `${continueURI}?${objectToQueryString({
      client_id: 'web',
      prompt: 'none',
      redirect_uri: this.#redirectURL,
      response_mode: 'query',
      response_type: 'code',
      scope: 'openid profile email',
    })}`;
    const authorizeResponse = http.get(authorizeUri, {
      redirects: 0,
    });

    const code = get(queryStringToObject(authorizeResponse.headers.Location), 'code');
    if (authorizeResponse.status !== 302 || !code) {
      fail(continueURI);
    }

    return code;
  }

  private getToken(code: string): Token {
    const tokenResponse = http.post(this.#tokenURL, {
      client_id: 'web',
      code,
      redirect_uri: this.#redirectURL,
      grant_type: 'authorization_code',
    });

    const token = {
      accessToken: get(tokenResponse.json(), 'access_token'),
      tokenType: get(tokenResponse.json(), 'token_type'),
      idToken: get(tokenResponse.json(), 'id_token'),
      expiresIn: get(tokenResponse.json(), 'expires_in'),
    };

    if (tokenResponse.status !== 200 || !token.accessToken || !token.tokenType || !token.idToken || !token.expiresIn) {
      fail(this.#tokenURL);
    }

    return token;
  }
}
