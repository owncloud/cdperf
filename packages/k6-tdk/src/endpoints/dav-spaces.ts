import { RequestBody } from 'k6/http'

import { Endpoint } from './endpoints'

export const PUT__upload_resource: Endpoint<{
  driveId: string,
  resourcePath: string,
  resourceBytes: RequestBody
}, 'none'> = (httpClient, { resourcePath, driveId, resourceBytes }) => {
  return httpClient('PUT', `/remote.php/dav/spaces/${driveId}/${resourcePath}`, resourceBytes)
}

export const GET__download_resource: Endpoint<{
  driveId: string,
  resourcePath: string
}, 'binary'> = (httpClient, { resourcePath, driveId }) => {
  return httpClient('GET', `/remote.php/dav/spaces/${driveId}/${resourcePath}`)
}

export const MKCOL__create_resource: Endpoint<{
  driveId: string,
  resourcePath: string
}, 'none'> = (httpClient, { resourcePath, driveId }) => {
  return httpClient('MKCOL', `/remote.php/dav/spaces/${driveId}/${resourcePath}`)
}

export const DELETE__delete_resource: Endpoint<{
  driveId: string,
  resourcePath: string
}, 'none'> = (httpClient, { resourcePath, driveId }) => {
  return httpClient('DELETE', `/remote.php/dav/spaces/${driveId}/${resourcePath}`)
}
export const MOVE__move_resource: Endpoint<{
  driveId: string,
  fromResourcePath: string,
  toResourcePath: string
}, 'none'> = (httpClient, { toResourcePath, driveId, fromResourcePath }) => {
  return httpClient('MOVE', `/remote.php/dav/spaces/${driveId}/${fromResourcePath}`, undefined, {
    headers: {
      destination: `/remote.php/dav/spaces/${driveId}/${toResourcePath}`
    }
  })
}

export const PROPFIND__get_properties_for_resource: Endpoint<{
  driveId: string,
  resourcePath: string,
  propfindXml?: RequestBody
}, 'text'> = (httpClient, { propfindXml, resourcePath, driveId }) => {
  return httpClient('PROPFIND', `/remote.php/dav/spaces/${driveId}/${resourcePath}`, propfindXml)
}
