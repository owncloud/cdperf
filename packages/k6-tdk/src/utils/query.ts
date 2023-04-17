import * as jsonpath from 'jsonpath'
import { JSONValue } from 'k6'
import { isEmpty, isObject } from 'lodash-es'
import * as xmlbuilder from 'xmlbuilder2'

export const queryJson = <V = any>(pathExpression: string, val?: JSONValue): V[] => {
  if (!pathExpression || !val) {
    return []
  }

  let obj = val

  if (typeof obj === 'string') {
    try {
      obj = JSON.parse(obj)
    } catch (_) {
      return []
    }
  }

  return jsonpath.query(obj, pathExpression).map((v) => {
    return isObject(v) && isEmpty(v) ? undefined : v
  })
}

export const queryXml = <V = any>(pathExpression: string, obj?: any): V[] => {
  const jsonRepresentation = xmlbuilder.create(obj).end({ format: 'object' })
  return queryJson<V>(pathExpression, jsonRepresentation)
}
