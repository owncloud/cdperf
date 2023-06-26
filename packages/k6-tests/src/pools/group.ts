import { SharedArray } from 'k6/data'

import { envValues } from '@/values'

import defaultGroupPool from './group.pool.json'
import { getPool } from './pools'

export type PoolGroup = {
  groupName: string;
}

export const groupPool: PoolGroup[] = new SharedArray('group pool', (() => {
  return getPool(envValues().pool.groups, defaultGroupPool)
}))
