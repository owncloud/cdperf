import { Platform } from '@ownclouders/k6-tdk'
import { Adapter } from '@ownclouders/k6-tdk/lib/auth'
import { Client } from '@ownclouders/k6-tdk/lib/client'
import { check, queryJson, queryXml, randomString } from '@ownclouders/k6-tdk/lib/utils'
import { sleep } from 'k6'
import exec from 'k6/execution'
import { Options } from 'k6/options'
import { times } from 'lodash'

interface Environment {
  adminData: {
    adminLogin: string;
    adminPassword: string;
  };
  actorData: {
    actorLogin: string;
    actorPassword: string;
    actorRoot: string;
  }[];
}

/**/
const settings = {
  baseUrl: __ENV.BASE_URL || 'https://localhost:9200',
  authAdapter: __ENV.AUTH_ADAPTER === Adapter.basicAuth ? Adapter.basicAuth : Adapter.kopano,
  platform: Platform[__ENV.PLATFORM] || Platform.ownCloudInfiniteScale,
  admin: {
    login: __ENV.ADMIN_LOGIN || 'admin',
    password: __ENV.ADMIN_PASSWORD || 'admin'
  },
  assets: {
    folderCount: parseInt(__ENV.ASSETS_FOLDER_COUNT, 10) || 2,
    textDocumentCount: parseInt(__ENV.ASSETS_TEXT_DOCUMENT_COUNT, 10) || 2
  },
  k6: {
    vus: 1,
    insecureSkipTLSVerify: true
  }
}

/**/
export const options: Options = settings.k6

export function setup(): Environment {
  const adminClient = new Client({ ...settings, userLogin: settings.admin.login, userPassword: settings.admin.password })

  const actorData = times(options.vus || 1, () => {
    const [actorLogin, actorPassword] = [randomString(), randomString()]
    adminClient.user.createUser({ userLogin: actorLogin, userPassword: actorPassword })
    adminClient.user.enableUser({ userLogin: actorLogin })

    const actorClient = new Client({ ...settings, userLogin: actorLogin, userPassword: actorPassword })
    const getMyDrivesResponse = actorClient.me.getMyDrives()
    const [actorRoot = actorLogin] = queryJson("$.value[?(@.driveType === 'personal')].id", getMyDrivesResponse?.body)

    return {
      actorLogin,
      actorPassword,
      actorRoot
    }
  })

  return {
    adminData: {
      adminLogin: settings.admin.login,
      adminPassword: settings.admin.password
    },
    actorData
  }
}

export default function actor({ actorData }: Environment): void {
  const { actorLogin, actorPassword, actorRoot } = actorData[exec.vu.idInTest - 1]
  const actorClient = new Client({ ...settings, userLogin: actorLogin, userPassword: actorPassword })


  const defer: (() => void)[] = []
  const folderNames = times(settings.assets.folderCount, () => {
    return randomString()
  })
  const textDocuments = times(settings.assets.textDocumentCount, () => {
    return [`${randomString()}.txt`, randomString()]
  })

  const doSearch = (query: string, expectedId: string, description: string) => {
    const searchForResourcesResponse = actorClient.search.searchForResources({ root: actorRoot, searchQuery: query })
    const [searchFileID] = queryXml("$..['oc:fileid']", searchForResourcesResponse?.body)
    const found = !!searchFileID

    if (!found) {
      sleep(1)
      doSearch(query, expectedId, description)
      return
    }

    check({ val: undefined }, {
      [`test -> search.${description} - found`]: () => {
        return expectedId === searchFileID
      }
    })
  }

  folderNames.forEach((folderName) => {
    actorClient.resource.createResource({ root: actorRoot, resourcePath: folderName })
    const getResourcePropertiesRequest = actorClient.resource.getResourceProperties({
      root: actorRoot,
      resourcePath: folderName
    })
    const [expectedId] = queryXml("$..['oc:fileid']", getResourcePropertiesRequest?.body)

    doSearch(folderName, expectedId, 'folder-name')

    defer.push(() => {
      actorClient.resource.deleteResource({ root: actorRoot, resourcePath: folderName })
    })
  })

  textDocuments.forEach(([documentName, documentContent]) => {
    actorClient.resource.uploadResource({ root: actorRoot, resourcePath: documentName, resourceBytes: documentContent })
    const getResourcePropertiesRequest = actorClient.resource.getResourceProperties({
      root: actorRoot,
      resourcePath: documentName
    })
    const [expectedId] = queryXml("$..['oc:fileid']", getResourcePropertiesRequest?.body)

    doSearch(documentName, expectedId, 'file-name')
    // idea for later:
    // content search only works if ocis has content extraction enabled (SEARCH_EXTRACTOR_TYPE=tika),
    // needs further testing, therefore deactivated for the moment.
    // doSearch(documentContent, expectedId, 'file-content')

    defer.push(() => {
      actorClient.resource.deleteResource({ root: actorRoot, resourcePath: documentName })
    })
  })

  defer.forEach((d) => {
    d()
  })
}

export function teardown({ adminData, actorData }: Environment): void {
  const adminClient = new Client({ ...settings, userLogin: adminData.adminLogin, userPassword: adminData.adminPassword })

  actorData.forEach(({ actorLogin }) => {
    adminClient.user.deleteUser({ userLogin: actorLogin })
  })
}
