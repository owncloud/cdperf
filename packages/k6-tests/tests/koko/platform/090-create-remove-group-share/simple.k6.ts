import { queryJson, queryXml, randomString, store } from '@ownclouders/k6-tdk/lib/utils'
import { Roles, ShareType } from '@ownclouders/k6-tdk/lib/values'
import { sleep } from 'k6'
import exec from 'k6/execution'
import { Options } from 'k6/options'
import { sample } from 'lodash'

import { groupPool, userPool } from '@/pools'
import { clientFor } from '@/shortcuts'
import { getPoolItem } from '@/utils'
import { envValues } from '@/values'

export const options: Options = {
  vus: 1,
  iterations: 1,
  insecureSkipTLSVerify: true
}

const settings = {
  ...envValues()
}

export const create_remove_group_share_090 = async (): Promise<void> => {
  const user = getPoolItem({ pool: userPool, n: exec.vu.idInTest })
  const userStore = store(user.userLogin)

  const client = await userStore.setOrGet('client', async () => {
    return clientFor(user)
  })

  const root = await userStore.setOrGet('root', async () => {
    const getMyDrivesResponse = await client.me.getMyDrives({ params: { $filter: "driveType eq 'personal'" } })
    const [actorRoot = user.userLogin] = queryJson("$.value[?(@.driveType === 'personal')].id", getMyDrivesResponse?.body)
    sleep(settings.sleep.after_request)

    return actorRoot
  })
  const shareFolderName = randomString()
  await client.resource.createResource({ root, resourcePath: shareFolderName })
  sleep(settings.sleep.after_request)

  const getResourcePropertiesResponse = await client.resource.getResourceProperties({ root, resourcePath: shareFolderName })
  const [sharedFolderFileId] = queryXml("$..['oc:fileid']", getResourcePropertiesResponse.body)
  sleep(settings.sleep.after_request)

  const findGroupResponse = await client.group.findGroup({ group: sample(groupPool)!.groupName })
  const [groupId] = queryJson('$.value[*].id', findGroupResponse?.body)

  const createShareResponse = await client.share.createShareInvitation({
    driveId: root,
    itemId: sharedFolderFileId,
    recipientId: groupId,
    roleId: Roles.editor,
    shareType: ShareType.group
  })
  
  const [shareId] = queryJson('$.value[*].id', createShareResponse?.body)
  sleep(settings.sleep.after_request)

  await client.share.deleteShareInvitation({ driveId:root, itemId: sharedFolderFileId, shareId })
  sleep(settings.sleep.after_request)

  await client.resource.deleteResource({ root, resourcePath: shareFolderName })
  sleep(settings.sleep.after_iteration)
}

export default create_remove_group_share_090
