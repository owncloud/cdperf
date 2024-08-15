import { check, queryJson, queryXml, randomString, store } from '@ownclouders/k6-tdk/lib/utils'
import { sleep } from 'k6'
import exec from 'k6/execution'
import { Options } from 'k6/options'
import { sample } from 'lodash'

import { createCalendar, createCalendarResource } from '@/mock'
import { userPool } from '@/pools'
import { clientFor } from '@/shortcuts'
import { getTestRoot } from '@/test'
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


export const add_remove_tag_100 = async (): Promise<void> => {
  const user = getPoolItem({ pool: userPool, n: exec.vu.idInTest })
  const userStore = store(user.userLogin)

  const client = await userStore.setOrGet('client', async () => {
    return clientFor(user)
  })

  const folders = await userStore.setOrGet('folders', async () => {
    return createCalendar({
      root: settings.seed.calendar.root,
      fromYear: settings.seed.calendar.from_year,
      toYear: settings.seed.calendar.to_year
    }).d
  })

  const files = await userStore.setOrGet('files', async () => {
    return folders.map((v) => {
      return createCalendarResource({ v }).resourcePath
    })
  })

  const root = await userStore.setOrGet('root', async () => {
    const testRoot = await getTestRoot({
      client,
      userLogin: user.userLogin,
      resourceName: settings.seed.container.name,
      resourceType: settings.seed.container.type,
      isOwner: false
    })
    sleep(settings.sleep.after_request)

    return [testRoot.root, testRoot.path].filter(Boolean).join('/')
  })

  let resourcePath = ''
  if (exec.scenario.iterationInTest % 2) { // 50%
    resourcePath = sample(folders)!
  } else { // 50%
    resourcePath = sample(files)!
  }

  const getResourcePropertiesRequest = await client.resource.getResourceProperties({
    root,
    resourcePath
  })
  const [resourceId] = queryXml("$..['oc:fileid']", getResourcePropertiesRequest.body)
  sleep(settings.sleep.after_request)

  const tagName = randomString()

  await client.tag.addTagToResource({ resourceId, tag:tagName })
  sleep(settings.sleep.after_request)

  const getTagsResponse = client.tag.getTagForResource()
    check({ val: getTagsResponse }, {
      'test -> resource.getTags - name - match': (r) => {
        const values = queryJson('$.value[*]', r?.body)
        return values.includes(tagName)
      }
    })

  await client.tag.removeTagFromResource({ resourceId, tag:tagName })
  sleep(settings.sleep.after_iteration)
}

export default add_remove_tag_100
