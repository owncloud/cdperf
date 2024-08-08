import { Client } from '@ownclouders/k6-tdk/lib/client'
import { objectToQueryString } from '@ownclouders/k6-tdk/lib/utils'
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
  BreadcrumbDocName: z.string(),
  HostEditUrl: z.string(),
  HostViewUrl: z.string(),
  BreadcrumbFolderUrl: z.string(),
  IsAnonymousUser: z.boolean(),
  UserFriendlyName: z.string(),
  BreadcrumbFolderName: z.string(),
  DownloadUrl: z.string(),
  FileUrl: z.string(),
  BreadcrumbBrandName: z.string(),
  BreadcrumbBrandUrl: z.string(),
  OwnerId: z.string(),
  UserId: z.string(),
  Size: z.number(),
  Version: z.string(),
  SupportsExtendedLockLength: z.boolean(),
  SupportsGetLock: z.boolean(),
  SupportsUpdate: z.boolean(),
  UserCanWrite: z.boolean(),
  SupportsLocks: z.boolean(),
  SupportsDeleteFile: z.boolean(),
  UserCanNotWriteRelative: z.boolean(),
  SupportsRename: z.boolean(),
  UserCanRename: z.boolean(),
  SupportsContainers: z.boolean(),
  SupportsUserInfo: z.boolean()
})
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type FileInfo = z.infer<typeof FileInfo>

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

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { app_url, form_parameters: { access_token, access_token_ttl } } = JSON.parse(appOpenResponse.body)

  return {
    app_url,
    access_token,
    access_token_ttl
  }
}
