import { Client } from '@ownclouders/k6-tdk/lib/client'
import { Permission, ShareType } from '@ownclouders/k6-tdk/lib/endpoints'
import { clientForAdmin } from '@ownclouders/k6-tdk/lib/snippets'
import { check, ENV, queryJson, queryXml, randomString } from '@ownclouders/k6-tdk/lib/utils'
import exec from 'k6/execution'
import { Options } from 'k6/options'
import { times } from 'lodash'

interface Environment {
  actorData: {
    actorLogin: string;
    actorPassword: string;
    shareFolder: string;
  }[];
  shareReceivers: {
    users: { userLogin: string; userPassword: string }[],
  };
}

/**/
const settings = {
  shareReceivers: {
    userCount: parseInt(ENV('SHARE_RECEIVERS_USER_COUNT', '35'), 10)
  }
}

/**/
export const options: Options = {
  vus: 1,
  insecureSkipTLSVerify: true
}
export function setup(): Environment {
  const adminClient = clientForAdmin()

  const shareReceiverUsers = times(settings.shareReceivers.userCount, () => {
    const [userLogin, userPassword] = [randomString(), randomString()]
    adminClient.user.createUser({ userLogin, userPassword })
    adminClient.user.enableUser({ userLogin })

    return { userLogin, userPassword }
  })

  const actorData = times(options.vus || 1, () => {
    const [actorLogin, actorPassword] = [randomString(), randomString()]
    adminClient.user.createUser({ userLogin: actorLogin, userPassword: actorPassword })
    adminClient.user.enableUser({ userLogin: actorLogin })

    const actorClient = new Client({ userLogin: actorLogin, userPassword: actorPassword })
    const getMyDrivesResponse = actorClient.me.getMyDrives()
    const [actorRoot = actorLogin] = queryJson("$.value[?(@.driveType === 'personal')].id", getMyDrivesResponse?.body)


    const shareFolder = randomString()
    actorClient.resource.createResource({ root: actorRoot, resourcePath: shareFolder })

    return {
      actorLogin,
      actorPassword,
      shareFolder
    }
  })

  return {
    actorData,
    shareReceivers:{
      users: shareReceiverUsers
    }
  }
}

const iterationBucket: {
  actorClient?: Client
} = {}

export default function actor({ actorData, shareReceivers }: Environment): void {
  const { actorLogin, actorPassword, shareFolder } = actorData[exec.vu.idInTest - 1]

  if (!iterationBucket.actorClient) {
    iterationBucket.actorClient = new Client({ userLogin: actorLogin, userPassword: actorPassword })
  }

  const { actorClient } = iterationBucket
  const defer: (() => void)[] = []
  shareReceivers.users.forEach(({ userLogin }) => {
    const createShareResponse = actorClient.share.createShare({
      shareResourcePath: shareFolder,
      shareReceiver: userLogin,
      shareType: ShareType.user,
      shareReceiverPermission: Permission.all
    })
    const [foundShareRecipient] = queryXml('ocs.data.share_with', createShareResponse.body)

    check({ val: undefined }, {
      'test -> share received - match': () => {
        return foundShareRecipient === userLogin
      }
    })

    defer.push(() => {
      const [shareId] = queryXml('ocs.data.id', createShareResponse.body)
      actorClient.share.deleteShare({ shareId })
    })
  })

  defer.forEach((d) => {
    d()
  })
}

export function teardown({ actorData, shareReceivers }: Environment): void {
  const adminClient = clientForAdmin()

  shareReceivers.users.forEach((user) => {
    return adminClient.user.deleteUser(user)
  })

  actorData.forEach(({ actorLogin }) => {
    adminClient.user.deleteUser({ userLogin: actorLogin })
  })
}

