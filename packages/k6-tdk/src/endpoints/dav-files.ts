import { RequestBody } from 'k6/http'

import { Endpoint } from './endpoints'

export const PUT__upload_resource: Endpoint<{
  root: string, resourcePath: string, resourceBytes: RequestBody
}, 'none'> = (r, { resourceBytes, root, resourcePath }) => {
  return r('PUT', `/remote.php/dav/files/${root}/${resourcePath}`, resourceBytes)
}

export const GET__download_resource: Endpoint<{ root: string, resourcePath: string }, 'binary'> = (r, {
  root,
  resourcePath
}) => {
  return r('GET', `/remote.php/dav/files/${root}/${resourcePath}`)
}

export const MKCOL__create_resource: Endpoint<{ root: string, resourcePath: string }, 'none'> = (r, {
  resourcePath,
  root
}) => {
  return r('MKCOL', `/remote.php/dav/files/${root}/${resourcePath}`)
}

export const DELETE__delete_resource: Endpoint<{ root: string, resourcePath: string }, 'none'> = (r, {
  resourcePath,
  root
}) => {
  return r('DELETE', `/remote.php/dav/files/${root}/${resourcePath}`)
}
export const MOVE__move_resource: Endpoint<{
  root: string,
  fromResourcePath: string,
  toResourcePath: string
}, 'none'> = (r, { toResourcePath, root, fromResourcePath }) => {
  return r('MOVE', `/remote.php/dav/files/${root}/${fromResourcePath}`, undefined, {
    headers: {
      destination: `/remote.php/dav/files/${root}/${toResourcePath}`
    }
  })
}

export const PROPFIND__get_properties_for_resource: Endpoint<{
  root: string,
  resourcePath: string,
  propfindXml?: RequestBody
}, 'text'> = (r, { root, resourcePath, propfindXml }) => {
  return r('PROPFIND', `/remote.php/dav/files/${root}/${resourcePath}`, propfindXml)
}

export const REPORT__get_report_for_resources: Endpoint<{
  root: string,
  reportXml?: RequestBody
}, 'text'> = (r, { reportXml, root }) => {
  return r('REPORT', `/remote.php/dav/files/${root}`, reportXml)
}
