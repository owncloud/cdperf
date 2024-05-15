// @ts-ignore
import { randomString, uuidv4 } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js'
import crypto from 'k6/crypto'
import http, { CookieJar } from 'k6/http'

import { check, cleanURL, objectToQueryString, queryJson, queryStringToObject } from '@/utils'

import { AuthNHTTPProvider, Token } from './auth'

export class Eduteams implements AuthNHTTPProvider {
  private readonly jar: CookieJar

  private readonly clientId: string

  private readonly userLogin: string

  private readonly userPassword: string

  private readonly redirectUrl: string

  private readonly authorizationEndpoint: string

  private readonly tokenEndpoint: string

  private cache?: {
    validTo: Date
    token: Token
  }

  constructor(p: {
    userLogin: string,
    userPassword: string,
    redirectUrl: string,
    clientId: string,
    openidConfigurationUrl: string,
    jar: CookieJar,
  }) {
    this.clientId = p.clientId
    this.userLogin = p.userLogin
    this.userPassword = p.userPassword
    this.redirectUrl = p.redirectUrl
    this.jar = p.jar

    const openidConfigurationResponse = http.get(p.openidConfigurationUrl)
    const [authorizationEndpoint] = queryJson('authorization_endpoint', openidConfigurationResponse.body)
    const [tokenEndpoint] = queryJson('token_endpoint', openidConfigurationResponse.body)
    this.authorizationEndpoint = authorizationEndpoint
    this.tokenEndpoint = tokenEndpoint
  }


  get headers() {
    const upsertCache = (t: Token) => {
      this.cache = {
        validTo: ((): Date => {
          const d = new Date()

          d.setSeconds(d.getSeconds() + t.expiresIn - Math.min(60, t.expiresIn * .1))

          return d
        })(),
        token: t
      }
    }

    const loginRequired = !this.cache
    if (loginRequired) {
      upsertCache(this.login())
    }

    const refreshRequired = this.cache && this.cache.validTo <= new Date()
    if (refreshRequired) {
      upsertCache(this.refreshTokens())
    }

    return { Authorization: `${this.cache!.token.tokenType} ${this.cache!.token.accessToken}` }
  }

  public login(): Token {
    const nonce = randomString(50)
    const loginParams = {
      login: 'true',
      response_type: 'code',
      scope: 'openid profile email',
      client_id: this.clientId,
      state: uuidv4(),
      code_challenge: crypto.sha256(nonce.toString(), 'base64rawurl'),
      code_challenge_method: 'S256',
      response_mode: 'query',
      redirect_uri: this.redirectUrl
    }

    const loginPageResponse = http.get(`${this.authorizationEndpoint}?${objectToQueryString(loginParams)}`, {
      redirects: 100,
      jar: this.jar
    })
    { // validate and check loginPageResponse
      check({ val: loginPageResponse }, {
        'authn -> loginPageResponse - status': ({ status }) => {
          return status === 200
        }
      })
      if (loginPageResponse.status !== 200) {
        throw new Error(`loginPageResponse.status is ${loginPageResponse.status}, expected 200`)
      }
    }

    const authorizationResponse = loginPageResponse.submitForm({
      fields: { username: this.userLogin, password: this.userPassword },
      params: { redirects: 100, jar: this.jar }
    })
    { // validate and check authorizationResponse
      check({ val: authorizationResponse }, {
        'authn -> authorizationResponse - status': ({ status }) => {
          return status === 200
        }
      })
      if (authorizationResponse.status !== 200) {
        throw new Error(`authorizationResponse.status is ${authorizationResponse.status}, expected 200`)
      }
    }

    const acquireCodeResponse = authorizationResponse.submitForm({
      params: { redirects: 100, jar: this.jar }
    })
    { // validate and check acquireCodeResponse
      check({ val: acquireCodeResponse }, {
        'authn -> acquireCodeResponse - status': ({ status }) => {
          return status === 200
        }
      })
      if (acquireCodeResponse.status !== 200) {
        throw new Error(`acquireCodeResponse.status is ${acquireCodeResponse.status}, expected 200`)
      }
    }

    const accessTokenResponse = http.post(this.tokenEndpoint, {
      ...queryStringToObject(acquireCodeResponse.url), // contains the code,
      grant_type: 'authorization_code',
      redirect_uri: cleanURL(this.redirectUrl),
      client_id: this.clientId,
      code_verifier: nonce
    }, { jar: this.jar, redirects: 100 })
    { // validate and check accessTokenResponse
      check({ val: accessTokenResponse }, {
        'authn -> accessTokenResponse - status': ({ status }) => {
          return status === 200
        }
      })
      if (accessTokenResponse.status !== 200) {
        throw new Error(`accessTokenResponse.status is ${accessTokenResponse.status}, expected 200`)
      }
    }

    // fin
    return {
      refreshToken: accessTokenResponse.json('refresh_token') as string,
      accessToken: accessTokenResponse.json('access_token') as string,
      tokenType: accessTokenResponse.json('token_type') as string,
      idToken: accessTokenResponse.json('id_token') as string,
      expiresIn: accessTokenResponse.json('expires_in') as number
    }
  }

  refreshTokens(): Token {
    // fixMe: current instance errors on token refresh
    return this.login()
  }
}

