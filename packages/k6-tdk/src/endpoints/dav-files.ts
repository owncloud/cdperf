import { RequestBody } from 'k6/http'

import { Endpoint } from './endpoints'

export const PUT__upload_resource: Endpoint<{
  root: string, resourcePath: string, resourceBytes: RequestBody
}, 'none'> = (httpClient, { resourceBytes, root, resourcePath }) => {
  return httpClient('PUT', `/remote.php/dav/files/${root}/${resourcePath}`, resourceBytes)
}

export const GET__download_resource: Endpoint<{ root: string, resourcePath: string }, 'binary'> = (httpClient, {
  root,
  resourcePath
}) => {
  return httpClient('GET', `/remote.php/dav/files/${root}/${resourcePath}`)
}

export const MKCOL__create_resource: Endpoint<{ root: string, resourcePath: string }, 'none'> = (httpClient, {
  resourcePath,
  root
}) => {
  return httpClient('MKCOL', `/remote.php/dav/files/${root}/${resourcePath}`)
}

export const DELETE__delete_resource: Endpoint<{ root: string, resourcePath: string }, 'none'> = (httpClient, {
  resourcePath,
  root
}) => {
  return httpClient('DELETE', `/remote.php/dav/files/${root}/${resourcePath}`)
}
export const MOVE__move_resource: Endpoint<{
  root: string,
  fromResourcePath: string,
  toResourcePath: string
}, 'none'> = (httpClient, { toResourcePath, root, fromResourcePath }) => {
  return httpClient('MOVE', `/remote.php/dav/files/${root}/${fromResourcePath}`, undefined, {
    headers: {
      destination: `/remote.php/dav/files/${root}/${toResourcePath}`
    }
  })
}

export const PROPFIND__get_properties_for_resource: Endpoint<{
  root: string,
  resourcePath: string,
  propfindXml?: RequestBody
}, 'text'> = (httpClient, { root, resourcePath, propfindXml }) => {
  return httpClient('PROPFIND', `/remote.php/dav/files/${root}/${resourcePath}`, propfindXml)
}

export const REPORT__get_report_for_resources: Endpoint<{
  root: string,
  reportXml?: RequestBody
}, 'text'> = (httpClient, { reportXml, root }) => {
  return httpClient('REPORT', `/remote.php/dav/files/${root}`, reportXml)
}
