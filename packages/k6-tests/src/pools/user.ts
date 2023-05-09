import { SharedArray } from 'k6/data'

import { envValues } from '@/values'

import { getPool } from './pools'
import defaultUserPool from './user.pool.json'

export type PoolUser = {
  userLogin: string;
  userPassword: string;
}

export const userPool: PoolUser[] = new SharedArray('user pool', (() => {
  return getPool(envValues().pool.users, defaultUserPool)
}))
