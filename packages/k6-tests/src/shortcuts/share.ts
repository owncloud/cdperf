import { Client } from '@ownclouders/k6-tdk/lib/client'
import { queryXml } from '@ownclouders/k6-tdk/lib/utils'
import { Permission, ShareType } from '@ownclouders/k6-tdk/lib/values'

import { TestRootType } from '@/values'

export const shareResource = async (p: {
  client: Client,
  root: string,
  path: string,
  shareReceiver: string,
  type: TestRootType
}): Promise<string | undefined> => {
  const params = {
    shareResourcePath: p.path,
    shareReceiver: p.shareReceiver
  } as any

  if (p.type === TestRootType.space) {
    params.shareType = ShareType.spaceMembershipUser
    params.shareReceiverPermission = Permission.coOwner
    params.spaceRef = p.root
  }

  if (p.type === TestRootType.directory) {
    params.shareType = ShareType.user
    params.shareReceiverPermission = Permission.all
  }

  const createShareResponse = await p.client.share.createShare(params)
  const [createdShareId] = queryXml('ocs.data.id', createShareResponse.body)

  return createdShareId
}
