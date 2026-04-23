import { Client } from '@ownclouders/k6-tdk/lib/client'
import { check, objectToQueryString } from '@ownclouders/k6-tdk/lib/utils'
import encoding from 'k6/encoding'
import { post } from 'k6/http'
import { z } from 'zod'

const UserAuth = z.object({
  wopiSrc: z.string(),
  access_token: z.string(),
  access_token_ttl: z.number(),
  userSessionId: z.string(),
  mode: z.string()
})
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type UserAuth = z.infer<typeof UserAuth>

const FileInfo = z.object({
  BaseFileName: z.string(),
  Version: z.string(),
  Size: z.number(),
  UserFriendlyName: z.string(),
  UserId: z.string(),
  UserCanWrite: z.boolean(),
  SupportsLocks: z.boolean(),
  SupportsRename: z.boolean(),
  SupportsUpdate: z.boolean()
}).passthrough()
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type FileInfo = z.infer<typeof FileInfo>

const decodeJwtPayload = (jwt: string): Record<string, unknown> => {
  const parts = jwt.split('.')
  if (parts.length !== 3) {
    throw new Error(`invalid JWT: expected 3 parts, got ${parts.length}`)
  }
  let payload = parts[1]
  // pad base64url to base64
  while (payload.length % 4 !== 0) {
    payload += '='
  }
  return JSON.parse(encoding.b64decode(payload, 'url', 's'))
}

const extractFromJwt = (body: string) => {
  const [, token] = /token = "(.*)"/.exec(body) || []
  if (!token) {
    throw new Error('failed to extract token from OnlyOffice response')
  }

  const payload = decodeJwtPayload(token)
  const documentId = payload.key as string
  const userAuth = payload.userAuth as UserAuth
  const fileInfo = payload.fileInfo as FileInfo

  if (!documentId || !userAuth || !fileInfo) {
    throw new Error(
      `failed to extract document information from JWT. ` +
      `documentId: ${documentId}, userAuth: ${!!userAuth}, fileInfo: ${!!fileInfo}`
    )
  }

  return { token, documentId, userAuth, fileInfo }
}

const extractFromHtml = (body: string) => {
  const [, token] = /token = "(.*)"/.exec(body) || []
  const [, documentId] = /key = "(.*)"/.exec(body) || []
  const [, userAuth] = /userAuth = (.*);/.exec(body) || []
  const [, fileInfo] = /fileInfo = (.*);/.exec(body) || []

  if (!token || !userAuth || !fileInfo) {
    throw new Error(
      `failed to extract document information from OnlyOffice response. ` +
      `token: ${token}, documentId: ${documentId}, userAuth: ${userAuth}, fileInfo: ${fileInfo}`
    )
  }

  return {
    token,
    documentId,
    userAuth: JSON.parse(userAuth) as UserAuth,
    fileInfo: JSON.parse(fileInfo) as FileInfo
  }
}

export const obtainDocumentInformation = async (p: {
  client: Client,
  resourceId: string,
  appName: string
}) => {
  const openRequestParams = { file_id: p.resourceId, lang: 'de', app_name: p.appName }
  const appOpenResponse = p.client.httpClient<'text'>(
    'POST',
    `/app/open?${objectToQueryString(openRequestParams)}`,
    JSON.stringify(openRequestParams)
  )
  check({ val: appOpenResponse }, {
    'onlyoffice -> appOpenResponse - status': ({ status }) => {
      return status === 200
    }
  })
  if (appOpenResponse.status !== 200) {
    throw new Error(`appOpenResponse.status is ${appOpenResponse.status}, expected 200. body: ${appOpenResponse.body}`)
  }
  const { app_url, form_parameters: { access_token, access_token_ttl } } = JSON.parse(appOpenResponse.body)
  const onlyOfficeAppResponse = post<'text'>(app_url, {
    access_token,
    access_token_ttl
  })

  check({ val: onlyOfficeAppResponse }, {
    'onlyoffice -> onlyOfficeAppResponse - status': ({ status }) => {
      return status === 200
    }
  })
  if (onlyOfficeAppResponse.status !== 200) {
    throw new Error(`onlyOfficeAppResponse.status is ${onlyOfficeAppResponse.status}, expected 200. body: ${onlyOfficeAppResponse.body}`)
  }

  // newer OnlyOffice embeds data in the JWT token payload;
  // older versions used inline JS variables in the HTML
  const hasInlineData = /key = "/.test(onlyOfficeAppResponse.body)
  if (hasInlineData) {
    return extractFromHtml(onlyOfficeAppResponse.body)
  }

  return extractFromJwt(onlyOfficeAppResponse.body)
}
