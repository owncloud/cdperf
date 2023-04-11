import { RequestBody } from 'k6/http';

import { Endpoint } from './endpoints';

export const PUT__upload_resource: Endpoint<{
  userId: string,
  resourcePath: string,
  resourceBytes: RequestBody
}, 'none'> = (r, { resourceBytes, userId, resourcePath }) => {
  return r('PUT', `/remote.php/dav/files/${userId}/${resourcePath}`, resourceBytes);
}

export const GET__download_resource: Endpoint<{ userId: string, resourcePath: string }, 'binary'> = (r, {
  userId,
  resourcePath
}) => {
  return r('GET', `/remote.php/dav/files/${userId}/${resourcePath}`);
}

export const MKCOL__create_resource: Endpoint<{ userId: string, resourcePath: string }, 'none'> = (r, {
  resourcePath,
  userId
}) => {
  return r('MKCOL', `/remote.php/dav/files/${userId}/${resourcePath}`);
}

export const DELETE__delete_resource: Endpoint<{ userId: string, resourcePath: string }, 'none'> = (r, {
  resourcePath,
  userId
}) => {
  return r('DELETE', `/remote.php/dav/files/${userId}/${resourcePath}`);
}
export const MOVE__move_resource: Endpoint<{
  userId: string,
  fromResourcePath: string,
  toResourcePath: string
}, 'none'> = (r, { toResourcePath, userId, fromResourcePath }) => {
  return r('MOVE', `/remote.php/dav/files/${userId}/${fromResourcePath}`, undefined, {
    headers: {
      destination: `/remote.php/dav/files/${userId}/${toResourcePath}`
    }
  });
}

export const PROPFIND__properties_for_resource: Endpoint<{
  userId: string,
  resourcePath: string,
  propfindXml?: RequestBody
}, 'text'> = (r, { userId, resourcePath, propfindXml }) => {
  return r('PROPFIND', `/remote.php/dav/files/${userId}/${resourcePath}`, propfindXml);
}

export const REPORT__report_for_resources: Endpoint<{
  userId: string,
  reportXml?: RequestBody
}, 'text'> = (r, { reportXml, userId }) => {
  return r('REPORT', `/remote.php/dav/files/${userId}`, reportXml);
}
