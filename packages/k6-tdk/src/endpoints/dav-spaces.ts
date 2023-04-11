import { RequestBody } from 'k6/http';

import { Endpoint } from './endpoints';

export const PUT__upload_resource: Endpoint<{
  spaceId: string,
  resourcePath: string,
  resourceBytes: RequestBody
}, 'none'> = (r, { resourcePath, spaceId, resourceBytes }) => {
  return r('PUT', `/remote.php/dav/spaces/${spaceId}/${resourcePath}`, resourceBytes);
}

export const GET__download_resource: Endpoint<{
  spaceId: string,
  resourcePath: string
}, 'binary'> = (r, { resourcePath, spaceId }) => {
  return r('GET', `/remote.php/dav/spaces/${spaceId}/${resourcePath}`);
}

export const MKCOL__create_resource: Endpoint<{
  spaceId: string,
  resourcePath: string
}, 'none'> = (r, { resourcePath, spaceId }) => {
  return r('MKCOL', `/remote.php/dav/spaces/${spaceId}/${resourcePath}`);
}

export const DELETE__delete_resource: Endpoint<{
  spaceId: string,
  resourcePath: string
}, 'none'> = (r, { resourcePath, spaceId }) => {
  return r('DELETE', `/remote.php/dav/spaces/${spaceId}/${resourcePath}`);
}
export const MOVE__move_resource: Endpoint<{
  spaceId: string,
  fromResourcePath: string,
  toResourcePath: string
}, 'none'> = (r, { toResourcePath, spaceId, fromResourcePath }) => {
  return r('MOVE', `/remote.php/dav/spaces/${spaceId}/${fromResourcePath}`, undefined, {
    headers: {
      destination: `/remote.php/dav/spaces/${spaceId}/${toResourcePath}`
    }
  });
}

export const PROPFIND__properties_for_resource: Endpoint<{
  spaceId: string,
  resourcePath: string,
  propfindXml?: RequestBody
}, 'text'> = (r, { propfindXml, resourcePath, spaceId }) => {
  return r('PROPFIND', `/remote.php/dav/spaces/${spaceId}/${resourcePath}`, propfindXml);
}
