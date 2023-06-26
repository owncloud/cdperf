import { flow, snakeCase, toUpper } from 'lodash/fp'

export const ENV = (key: string, defaultValue?: string): string => {
  const lookup = flow(snakeCase, toUpper)(key)
  const value = __ENV[lookup] || defaultValue

  if(!value) {
    throw new Error(`no environment variable value found for "${lookup}", please provide one: "${lookup}=value"`)
  }

  return value
}
