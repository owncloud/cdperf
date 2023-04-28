import { expect, test, vi } from 'vitest'

import { ENV } from './env';

test.each([
  { key: "UPPERCASE-ENV", defaultValue: 'uppercase_env_default_value', envName: 'UPPERCASE_ENV', envValue: 'uppercase_env_value' },
  { key: "lowercase-env", defaultValue: 'lowercase_env_default_value', envName: 'LOWERCASE_ENV', envValue: 'lowercase_env_value' },
  { key: "kebabcase-env", defaultValue: 'kebabcase_env_default_value', envName: 'KEBABCASE_ENV', envValue: 'kebabcase_env_value' },
  { key: "snakecase_env", defaultValue: 'snakecase_env_default_value', envName: 'SNAKECASE_ENV', envValue: 'snakecase_env_value' },
])('env for $key', ({ key, defaultValue , envName, envValue}) => {
  expect(ENV(key, defaultValue)).toBe(defaultValue)

  try {
    ENV(key)
  } catch (e){
    expect(new RegExp(`"${envName}=value"`).test(e as string)).toBeTruthy()
  }

  vi.stubGlobal('__ENV', {[envName]: envValue})
  expect(ENV(key)).toMatch(envValue)
  vi.stubGlobal('__ENV', {})

  expect.assertions(3)
})
