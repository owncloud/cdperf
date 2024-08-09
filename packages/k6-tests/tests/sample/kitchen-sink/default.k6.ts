import { Client } from '@ownclouders/k6-tdk/lib/client'
import {
  check,
  deferer,
  group,
  platformGuard,
  queryJson,
  queryXml,
  randomString,
  store
} from '@ownclouders/k6-tdk/lib/utils'
import { Roles, ShareType } from '@ownclouders/k6-tdk/lib/values'
import { sleep } from 'k6'
import { randomBytes } from 'k6/crypto'
import { b64encode } from 'k6/encoding'
import exec from 'k6/execution'
import { Options } from 'k6/options'
import { times } from 'lodash'

import { clientFor } from '@/shortcuts'
import { envValues } from '@/values'

interface Environment {
  actorData: {
    actorLogin: string;
    actorPassword: string;
    actorId: string;
    actorRoot: string;
  }[];
}

const settings = {
  ...envValues()
}

/**/
export const options: Options = {
  vus: 1,
  insecureSkipTLSVerify: true
}

export function setup(): Environment {
  const adminClient = clientFor({ userLogin: settings.admin.login, userPassword: settings.admin.password })

  const actorData = times(options.vus || 1, () => {
    const [actorLogin, actorPassword] = [randomString(), randomString()]
    const createUserResponse = adminClient.user.createUser({ userLogin: actorLogin, userPassword: actorPassword })
    const [actorId] = queryJson('$.id', createUserResponse.body)
    adminClient.user.enableUser({ userLogin: actorLogin })

    const actorClient = clientFor({ userLogin: actorLogin, userPassword: actorPassword })
    const getMyDrivesResponse = actorClient.me.getMyDrives({ params: { $filter: "driveType eq 'personal'" } })
    const [actorRoot = actorLogin] = queryJson("$.value[?(@.driveType === 'personal')].id", getMyDrivesResponse?.body)

    return {
      actorLogin,
      actorPassword,
      actorId,
      actorRoot
    }
  })

  return {
    actorData
  }
}

export default async function actor({ actorData }: Environment): Promise<void> {
  const guards = { ...platformGuard(envValues().platform.type) }
  const { actorLogin, actorPassword, actorId, actorRoot } = actorData[exec.vu.idInTest - 1]
  const actorStore = store(actorLogin)

  const actorClient = await actorStore.setOrGet('client', async () => {
    return clientFor({ userLogin: actorLogin, userPassword: actorPassword })
  })

  /**
   * ✓ client.me.getMyProfile
   * ✓ client.me.getMyDrives
   */
  group('client.me.*', () => {
    const getMyProfileResponse = actorClient.me.getMyProfile()
    check({ skip: guards.isOwnCloudServer || guards.isNextcloud, val: getMyProfileResponse }, {
      'test -> me.getMyProfile - displayName - match': (response) => {
        const [displayName] = queryJson('displayName', response?.body)
        return displayName === actorLogin
      }
    })

    const getMyDrivesResponse = actorClient.me.getMyDrives({ params: { $filter: "driveType eq 'personal'" } })
    check({ skip: guards.isOwnCloudServer || guards.isNextcloud, val: getMyDrivesResponse }, {
      'test -> me.getMyDrives - personal - match': (response) => {
        const [personalDrive] = queryJson("$.value[?(@.driveType === 'personal')].id", response?.body)
        return personalDrive === actorRoot
      }
    })
  })

  const adminStore = store(settings.admin.login)
  const adminClient = await adminStore.setOrGet('client', async () => {
    return clientFor({ userLogin: settings.admin.login, userPassword: settings.admin.password })
  })

  /**
   * ✓ client.group.createGroup
   * ✓ client.group.deleteGroup
   */
  const clientGroup = group('client.group.*', (grouping) => {
    const groupName = randomString()
    const createGroupResponse = adminClient.group.createGroup({ groupName })
    check({ skip: guards.isOwnCloudServer || guards.isNextcloud, val: createGroupResponse }, {
      'test -> group.createGroup - displayName - match': ({ body }) => {
        const [displayName] = queryJson('displayName', body)
        return displayName === groupName
      }
    })

    const [groupId] = queryJson('id', createGroupResponse.body)
    const groupIdOrName = groupId || groupName

    const defer = deferer()
    defer.add(() => {
      group(grouping, () => {
        adminClient.group.deleteGroup({ groupIdOrName })
      })
    })

    return {
      defer
    }
  })

  /**
   * ✓ client.application.listApplications
   */
  const clientApplication = group('client.application.*', () => {
    const listApplicationsResponse = adminClient.application.listApplications()
    const [applicationId] = queryJson("$.value[?(@.displayName === 'ownCloud Infinite Scale')].id", listApplicationsResponse?.body)

    return {
      applicationId
    }
  })

  /**
   * ✓ client.role.getRoles
   * ✓ client.role.addRoleToUser
   */
  group('client.role.*', () => {
    const getRolesResponse = adminClient.role.getRoles()
    const [appRoleId] = queryJson("$.bundles[?(@.name === 'spaceadmin')].id", getRolesResponse?.body)

    const addRoleToUserParameters = {
      principalId: actorId,
      appRoleId,
      resourceId: clientApplication.applicationId
    }
    const addRoleToUserResponse = adminClient.role.addRoleToUser(addRoleToUserParameters)
    check({ skip: guards.isOwnCloudServer || guards.isNextcloud, val: addRoleToUserResponse }, {
      'test -> role.addRoleToUser - match': (r) => {
        const result = Object.keys(addRoleToUserParameters).map((k) => {
          const [v] = queryJson(k, r?.body)
          return v === addRoleToUserParameters[k]
        })

        return !!result.length && result.every(Boolean)
      }
    })
  })

  /**
   * ✓ client.drive.createDrive
   * ✓ client.drive.deactivateDrive
   * ✓ client.drive.deleteDrive
   */
  const clientDrive = group('client.drive.*', (grouping) => {
    const driveName = randomString()
    const createDriveResponse = actorClient.drive.createDrive({ driveName })
    check({ skip: guards.isOwnCloudServer || guards.isNextcloud, val: createDriveResponse }, {
      'test -> resource.createDrive - name - match': (r) => {
        const [name] = queryJson('name', r?.body)
        return name === driveName
      }
    })
    const [driveId] = queryJson('id', createDriveResponse?.body)
    const defer = deferer()
    defer.add(() => {
      group(grouping, () => {
        actorClient.drive.deactivateDrive({ driveId })
        actorClient.drive.deleteDrive({ driveId })
      })
    })

    return {
      defer,
      driveId
    }
  })

  /**
   * ✓ client.resource.createResource
   * ✓ client.resource.deleteResource
   * ✓ client.resource.moveResource
   * ✓ client.resource.uploadResource
   * ✓ client.resource.downloadResource
   * ✓ client.resource.getResourceProperties
   */
  const clientResource = group('client.resource.*', (grouping) => {
    const folderCreationName = randomString()
    actorClient.resource.createResource({ root: actorRoot, resourcePath: folderCreationName })

    const folderMovedName = randomString()
    actorClient.resource.moveResource({
      root: actorRoot,
      fromResourcePath: folderCreationName,
      toResourcePath: folderMovedName
    })

    const defer = deferer()
    defer.add(() => {
      group(grouping, () => {
        actorClient.resource.deleteResource({ root: actorRoot, resourcePath: folderMovedName })
      })
    })

    const getResourcePropertiesRequest = actorClient.resource.getResourceProperties({
      root: actorRoot,
      resourcePath: folderMovedName
    })
    check({ val: getResourcePropertiesRequest }, {
      'test -> resource.getResourceProperties - path - match': ({ body }) => {
        const [href = ''] = queryXml("$..['d:href']", body)
        return href.endsWith(`${folderMovedName}/`)
      }
    })

    const resourcePath = [folderMovedName, `${randomString()}.txt`].join('/')
    const resourceBytes = randomBytes(100)
    actorClient.resource.uploadResource({ root: actorRoot, resourceBytes, resourcePath })

    const downloadResourceRequest = actorClient.resource.downloadResource({ root: actorRoot, resourcePath })
    check({ val: downloadResourceRequest }, {
      'test -> resource.uploadResource and resource.downloadResource - bytes - match': ({ body }) => {
        return b64encode(body.toString()) === b64encode(resourceBytes)
      }
    })

    const [folderId] = queryXml("$..['oc:fileid']", getResourcePropertiesRequest.body)
    return {
      defer,
      folderId,
      folderName: folderMovedName
    }
  })

  /**
   * ✓ client.tag.createTag
   * ✓ client.tag.deleteTag
   * ✓ client.tag.getTags
   * ✓ client.tag.addTagToResource
   * ✓ client.tag.removeTagFromResource
   * ✓ client.tag.getTagsForResource
   */
  const clientTag = group('client.tag.*', (grouping) => {
    const tagName = randomString()

    const getTagsResponse = actorClient.tag.getTags()
    const [{ 'oc:id': existingTagId } = { 'oc:id': '' }] = queryXml(`$..[?(@['oc:display-name'] === '${tagName}')]`, getTagsResponse?.body)
    check({ skip: !existingTagId, val: undefined }, {
      'test -> tag.getTagsResponse - exists': () => {
        return !!existingTagId
      }
    })


    let createdTagId = ''
    if (!existingTagId) {
      const createTagResponse = actorClient.tag.createTag({ tagName })
      const contentLocationHeader = createTagResponse?.headers['Content-Location'] || ''
      createdTagId = contentLocationHeader.split('/').pop() || ''
    }

    check({ skip: !createdTagId, val: undefined }, {
      'test -> tag.createTag - created': () => {
        return !!createdTagId
      }
    })

    // fallBack to tagName for oCis
    const tagNameOrId = existingTagId || createdTagId || tagName

    actorClient.tag.addTagToResource({ tag: tagNameOrId, resourceId: clientResource.folderId })
    const getTagsForResourceResponseAfterAdd = actorClient.tag.getTagsForResource(
      { root: actorRoot, resourceId: clientResource.folderId, resourcePath: clientResource.folderName })

    const extractTag = (body: string) => {
      const [foundTagOcis] = queryXml("$..['oc:tags']", body)
      const [foundTagOccOrNc] = queryXml(`$..[?(@['oc:id'] === '${tagNameOrId}')]['oc:display-name']`, body)
      return foundTagOcis || foundTagOccOrNc
    }

    check({ val: extractTag(getTagsForResourceResponseAfterAdd.body) }, {
      'test -> tag.getTagsForResource - match': (foundTag) => {
        return foundTag === tagName
      }
    })

    const defer = deferer()
    defer.add(() => {
      group(grouping, () => {
        actorClient.tag.removeTagFromResource({ resourceId: clientResource.folderId, tag: tagNameOrId })
        const getTagsForResourceResponseAfterRemove = actorClient.tag.getTagsForResource(
          { root: actorRoot, resourceId: clientResource.folderId, resourcePath: clientResource.folderName })


        check({ val: extractTag(getTagsForResourceResponseAfterRemove.body) }, {
          'test -> tag.removeTagFromResource - removed': (foundTag) => {
            return !foundTag
          }
        })

        adminClient.tag.deleteTag({ tag: tagNameOrId })
      })
    })

    return {
      defer,
      tagNameOrId
    }
  })

  /**
   * ✓ client.user.createUser
   * ✓ client.user.enableUser
   * ✓ client.user.deleteUser
   */
  const clientUser = group('client.user.*', (grouping) => {
    const [userLogin, userPassword] = [randomString(), randomString()]
    adminClient.user.createUser({ userLogin, userPassword })

    const defer = deferer()
    defer.add(() => {
      group(grouping, () => {
        adminClient.user.deleteUser({ userLogin })
      })
    })

    adminClient.user.enableUser({ userLogin })

    const userClient = clientFor({ userLogin, userPassword })

    return {
      userLogin,
      userClient,
      defer
    }
  })

  /**
   * ✓ client.search.searchForRecipient
   * ✓ client.search.searchForResources
   * ✓ client.search.searchForResourcesByTag
   */
  const clientSearch = group('client.search.*', () => {
    const searchForRecipientResponse = actorClient.user.findUser({
      user: clientUser.userLogin
    })
    const [recipientId] = queryJson('$.value[*].id', searchForRecipientResponse?.body)
    const [recipientName] = queryJson('$.value[*].onPremisesSamAccountName', searchForRecipientResponse?.body)
    check({ val: undefined }, {
      'test -> search.searchForRecipient - name - match': () => {
        return recipientName === clientUser.userLogin
      }
    })

    const searchForResourcesPoll = (client: Client, query: string): ReturnType<typeof actorClient.search.searchForResources> => {
      const searchForResourcesResponse = client.search.searchForResources({ root: actorRoot, searchQuery: query })
      const [searchFileID] = queryXml("$..['oc:fileid']", searchForResourcesResponse?.body)
      const found = !!searchFileID

      if (!found) {
        sleep(1)
        return searchForResourcesPoll(client, query)
      }

      return searchForResourcesResponse
    }

    const searchForResourcesResponse = searchForResourcesPoll(actorClient, clientResource.folderName)
    check({ val: searchForResourcesResponse }, {
      'test -> search.searchForResources - id - match': ({ body }) => {
        const [fileId] = queryXml("$..['oc:fileid']", body)
        return fileId === clientResource.folderId
      }
    })

    const searchForResourcesByTag = actorClient.search.searchForResourcesByTag({
      tag: clientTag.tagNameOrId,
      root: actorRoot
    })
    check({ val: searchForResourcesByTag }, {
      'test -> search.searchForResourcesByTag - id - match': ({ body }) => {
        const [fileId] = queryXml("$..['oc:fileid']", body)
        return fileId === clientResource.folderId
      }
    })

    return {
      recipientId
    }
  })

  /**
   * ✓ client.share.create
   * ✓ client.share.delete
   */
  const clientShare = group('client.share.*', (grouping) => {
      const createShareResponse = actorClient.share.createShareInvitation({
        driveId: clientDrive.driveId,
        itemId: clientResource.folderId,
        recipientId: clientSearch.recipientId,
        roleId: Roles.editor,
        shareType: ShareType.user
      })
      
      const [shareId] = queryJson('$.value[*].id', createShareResponse?.body)
      sleep(settings.sleep.after_request)

      const defer = deferer()
      defer.add(() => {
        group(grouping, () => {
          actorClient.share.deleteShareInvitation({
             driveId: clientDrive.driveId,
             itemId: clientResource.folderId,
             shareId 
            })
        })
      })

      return {
        defer
      }
    })

  ;[
    clientShare,
    clientUser,
    clientTag,
    clientResource,
    clientDrive,
    clientGroup
  ].forEach(({ defer }) => {
    defer.exec()
  })
}

export function teardown({ actorData }: Environment): void {
  const adminClient = clientFor({ userLogin: settings.admin.login, userPassword: settings.admin.password })

  actorData.forEach(({ actorLogin }) => {
    adminClient.user.deleteUser({ userLogin: actorLogin })
  })
}
