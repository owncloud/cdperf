import { Embedded } from '@/values'

export const getPool = <P>(source: string, defaultPool?: P): P => {
  return source === Embedded ? defaultPool : JSON.parse(open(source))
}
