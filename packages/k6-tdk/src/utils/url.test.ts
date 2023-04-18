import { expect, test } from 'vitest';

import { cleanURL, objectToQueryString, queryStringToObject } from './url';

test.each([
  { url: 'foo', expected: 'foo' },
  { url: '/foo', expected: '/foo' },
  { url: '/foo/', expected: '/foo/' },
  { url: '/foo///bar?baz=true', expected: '/foo/bar?baz=true' },
  { url: 'http://www.foo.org////foo///bar?baz=true', expected: 'http://www.foo.org/foo/bar?baz=true' },
  { url: '/foo///bar//', expected: '/foo/bar/' },
  { url: 'foo///bar////baz', expected: 'foo/bar/baz' }
])('cleanURL($url) -> $expected', ({ url, expected }) => {
  expect(cleanURL(url)).toBe(expected)
})

test.each([
  { url: 'http://foo.org/bar?baz=1', expected: { baz: '1' } },
  { url: 'http://foo.org/bar?baz=1&what=that', expected: { baz: '1', what: 'that' } }
])('queryStringToObject($url) -> $expected', ({ url, expected }) => {
  expect(queryStringToObject(url)).toMatchObject(expected)
})

test.each([
  { obj: { foo: 1 }, expected: 'foo=1' },
  { obj: { bar: '2', baz: 3 }, expected: 'bar=2&baz=3' },
  { obj: { strange: undefined }, expected: 'strange=undefined' },
  { obj: { strange: undefined, second: 2 }, expected: 'strange=undefined&second=2' }
])('objectToQueryString($url) -> $expected', ({ obj, expected }) => {
  expect(objectToQueryString(obj)).toMatchObject(expected)
})
