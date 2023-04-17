// @ts-ignore
import { URLSearchParams as K6URLSearchParams } from 'https://jslib.k6.io/url/1.0.0/index.js'

export const cleanURL = (...parts: string[]): string => {
  return parts.join('/').replace(/(?<!:)\/+/gm, '/')
}

export const objectToQueryString = (params: { [key: string]: string | number | undefined }): string => {
  const searchParams = new K6URLSearchParams(Object.keys(params).map((k) => {
    return [k, String(params[k])]
  }))

  return searchParams.toString()
}

export const queryStringToObject = (requestedUrl: string): { [key: string]: string } => {
  const url = new URL(requestedUrl).search
  const urlSearchParams = new K6URLSearchParams(url)
  return Object.fromEntries(urlSearchParams)
}
