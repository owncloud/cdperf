import http, { CookieJar } from 'k6/http'
import { get } from 'lodash'

import { check, cleanURL, objectToQueryString, queryStringToObject, randomString } from '@/utils'

import { AuthNHTTPProvider, Token } from './auth'

export class Kopano implements AuthNHTTPProvider {
  private readonly jar: CookieJar

  private readonly clientId: string

  private readonly userLogin: string

  private readonly userPassword: string

  private readonly baseUrl: string

  private readonly redirectUrl: string

  private cache?: {
    validTo: Date
    token: Token
  }

  constructor(p: { userLogin: string, userPassword: string, baseUrl: string, redirectUrl: string, clientId: string, jar: CookieJar }) {
    this.clientId = p.clientId
    this.userLogin = p.userLogin
    this.userPassword = p.userPassword
    this.baseUrl = cleanURL(p.baseUrl)
    this.redirectUrl = cleanURL(p.redirectUrl)
    this.jar = p.jar
  }

  public get headers() {
    return { Authorization: `${this.credential.tokenType} ${this.credential.accessToken}` }
  }

  private get endpoints() {
    return {
      logon: cleanURL(`${this.baseUrl}/signin/v1/identifier/_/logon`),
      token: cleanURL(`${this.baseUrl}/konnect/v1/token`)
    }
  }

  private get credential(): Token {
    if (!this.cache || this.cache.validTo <= new Date()) {
      const continueURI = this.getContinueURI()
      const code = this.getCode(continueURI)
      const token = this.getToken(code)
      this.cache = {
        validTo: ((): Date => {
          const offset = 5
          const d = new Date()

          d.setSeconds(d.getSeconds() + token.expiresIn - offset)

          return d
        })(),
        token
      }
    }

    return this.cache.token
  }

  private getContinueURI(): string {
    const logonResponse = http.post(
      this.endpoints.logon,
      JSON.stringify({
        params: [this.userLogin, this.userPassword, '1'],
        hello: {
          scope: 'openid profile email',
          client_id: this.clientId,
          redirect_uri: this.redirectUrl,
          flow: 'oidc'
        },
        state: randomString(16)
      }),
      {
        headers: {
          'Kopano-Konnect-XSRF': '1',
          Referer: this.baseUrl,
          'Content-Type': 'application/json'
        },
        jar: this.jar
      }
    )
    check({ val: logonResponse }, {
      'authn -> logonResponse - status': ({ status }) => {
        return status === 200
      }
    })
    if (logonResponse.status !== 200) {
      throw new Error(`logonResponse.status is ${logonResponse.status}, expected 200`)
    }

    return get(logonResponse.json(), 'hello.continue_uri', '')
  }

  private getCode(continueUrl: string): string {
    const authorizeResponse = http.get(`${continueUrl}?${objectToQueryString({
      client_id: this.clientId,
      prompt: 'none',
      redirect_uri: this.redirectUrl,
      response_mode: 'query',
      response_type: 'code',
      scope: 'openid profile email'
    })}`, {
      redirects: 0,
      jar: this.jar
    })
    check({ val: authorizeResponse }, {
      'authn -> authorizeResponse - status': ({ status }) => {
        return status === 302
      }
    })
    if (authorizeResponse.status !== 302) {
      throw new Error(`authorizeResponse.status is ${authorizeResponse.status}, expected 302`)
    }

    return get(queryStringToObject(authorizeResponse.headers.Location), 'code', '')
  }

  private getToken(code: string): Token {
    const accessTokenResponse = http.post(this.endpoints.token, {
      client_id: this.clientId,
      code,
      redirect_uri: this.redirectUrl,
      grant_type: 'authorization_code'
    }, {
      jar: this.jar
    })
    check({ val: accessTokenResponse }, {
      'authn -> accessTokenResponse - status': ({ status }) => {
        return status === 200
      }
    })
    if (accessTokenResponse.status !== 200) {
      throw new Error(`accessTokenResponse.status is ${accessTokenResponse.status}, expected 200`)
    }


    return {
      refreshToken: accessTokenResponse.json('refresh_token') as string,
      accessToken: accessTokenResponse.json('access_token') as string,
      tokenType: accessTokenResponse.json('token_type') as string,
      idToken: accessTokenResponse.json('id_token') as string,
      expiresIn: accessTokenResponse.json('expires_in') as number
    }
  }
}
