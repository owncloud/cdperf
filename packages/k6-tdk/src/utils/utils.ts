// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const noop = (..._: unknown[]): void => {}

export const deferer = () => {
  const tasks: (() => void)[] = []

  return {
    add: (fn: (() => void)) => {
      tasks.push(fn)
    },
    exec: () => {
      tasks.forEach((d) => {
        return d()
      })
    }
  }
}
