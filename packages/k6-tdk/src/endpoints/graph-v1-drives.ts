import { Endpoint } from './endpoints'

export const POST__create_drive:Endpoint<{ driveName: string }, 'text'> = (httpClient, { driveName }) => {
  return httpClient('POST', '/graph/v1.0/drives', JSON.stringify({ name: driveName }))
}

export const DELETE__deactivate_drive:Endpoint<{ driveId: string }, 'none'> = (httpClient, { driveId }) => {
  return httpClient('DELETE', `/graph/v1.0/drives/${driveId}`, undefined )
}

export const DELETE__delete_drive:Endpoint<{ driveId: string }, 'none'> = (httpClient, { driveId }) => {
  return httpClient('DELETE', `/graph/v1.0/drives/${driveId}`, undefined, {
    headers: {
      Purge: 'T'
    }
  })
}
