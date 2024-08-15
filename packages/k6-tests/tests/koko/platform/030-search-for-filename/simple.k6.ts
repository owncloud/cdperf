import { store } from '@ownclouders/k6-tdk/lib/utils'
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

export const search_for_filename_030 = async (): Promise<void> => {
  const user = getPoolItem({ pool: userPool, n: exec.vu.idInTest })
  const userStore = store(user.userLogin)

  const resources = await userStore.setOrGet('resources', async () => {
    return createCalendar({
      root: settings.seed.calendar.root,
      fromYear: settings.seed.calendar.from_year,
      toYear: settings.seed.calendar.to_year
    }).d.map((v) => {
      return createCalendarResource({ v })
    })
  })
  const client = await userStore.setOrGet('client', async () => {
    return clientFor(user)
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

    return testRoot.root
  })

  client.search.searchForResources({ root, searchQuery: sample(resources)!.resourceName })
  sleep(settings.sleep.after_iteration)
}

export default search_for_filename_030
