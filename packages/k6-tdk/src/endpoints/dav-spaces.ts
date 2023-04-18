import { RequestBody } from 'k6/http'

import { Endpoint } from './endpoints'

export const PUT__upload_resource: Endpoint<{
  driveId: string,
  resourcePath: string,
  resourceBytes: RequestBody
}, 'none'> = (r, { resourcePath, driveId, resourceBytes }) => {
  return r('PUT', `/remote.php/dav/spaces/${driveId}/${resourcePath}`, resourceBytes)
}

export const GET__download_resource: Endpoint<{
  driveId: string,
  resourcePath: string
}, 'binary'> = (r, { resourcePath, driveId }) => {
  return r('GET', `/remote.php/dav/spaces/${driveId}/${resourcePath}`)
}

export const MKCOL__create_resource: Endpoint<{
  driveId: string,
  resourcePath: string
}, 'none'> = (r, { resourcePath, driveId }) => {
  return r('MKCOL', `/remote.php/dav/spaces/${driveId}/${resourcePath}`)
}

export const DELETE__delete_resource: Endpoint<{
  driveId: string,
  resourcePath: string
}, 'none'> = (r, { resourcePath, driveId }) => {
  return r('DELETE', `/remote.php/dav/spaces/${driveId}/${resourcePath}`)
}
export const MOVE__move_resource: Endpoint<{
  driveId: string,
  fromResourcePath: string,
  toResourcePath: string
}, 'none'> = (r, { toResourcePath, driveId, fromResourcePath }) => {
  return r('MOVE', `/remote.php/dav/spaces/${driveId}/${fromResourcePath}`, undefined, {
    headers: {
      destination: `/remote.php/dav/spaces/${driveId}/${toResourcePath}`
    }
  })
}

export const PROPFIND__get_properties_for_resource: Endpoint<{
  driveId: string,
  resourcePath: string,
  propfindXml?: RequestBody
}, 'text'> = (r, { propfindXml, resourcePath, driveId }) => {
  return r('PROPFIND', `/remote.php/dav/spaces/${driveId}/${resourcePath}`, propfindXml)
}
