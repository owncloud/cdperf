import { take } from 'lodash'

export const getPoolItems = <PI>(p: { pool: PI[], n: number }): PI[] => {
  const available = p.pool.length

  if (p.n > available) {
    throw new Error(`you requested '${p.n}' items, but only '${available}' are available`)
  }

  return take<PI>(p.pool, p.n)
}

export const getPoolItem = <PI>(p: { pool: PI[], n: number }): PI => {
  return getPoolItems<PI>(p)[p.n - 1]
}
