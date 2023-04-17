import { check as k6Check, Checkers, group as k6Group } from 'k6';

export const group = <RT>(name: string, fn: (name) => RT): RT => {
  return k6Group<RT>(name, (): RT => {
    return fn(name)
  })
}

export const check = <VT>(
  options: {
    val: VT,
    tags?: object,
    skip?: boolean
  },
  sets: Checkers<VT>
): boolean => {
  const checkers = { ...sets }

  if (options.skip) {
    Object.keys(checkers).forEach((k) => {
      checkers[`${k} -- (SKIPPED)`] = () => {
        return true
      }

      delete checkers[k]
    })
  }

  return k6Check<VT>(options.val, checkers, options.tags)
}
