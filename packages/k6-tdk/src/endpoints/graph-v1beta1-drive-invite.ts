import { Endpoint } from './endpoints'

export const POST__create_share_invitation: Endpoint<{ 
  driveId: string, 
  itemId: string, 
  recipientId: string, 
  roleId: string, 
  shareType: string 
}, 'text'> = (httpClient, { driveId, itemId, recipientId, roleId, shareType }) => {
  return httpClient('POST', `/graph/v1beta1/drives/${driveId}/items/${itemId}/invite`, JSON.stringify({
    recipients: [
      {
        '@libre.graph.recipient.type': shareType,
        objectId: recipientId
      }
    ],
    roles: [roleId]
  }))
}

export const DELETE__delete_share_invitation: Endpoint<{ 
  driveId: string, 
  itemId: string, 
  shareId: string 
}, 'text'> = (httpClient, { driveId, itemId, shareId }) => {
  return httpClient('DELETE', `/graph/v1beta1/drives/${driveId}/items/${itemId}/permissions/${shareId}`, undefined)
}

export const POST__create_space_invitation: Endpoint<{ 
  driveId: string, 
  recipientId: string, 
  roleId: string, 
  shareType: string 
}, 'text'> = (httpClient, { driveId, recipientId, roleId, shareType }) => {
  return httpClient('POST', `/graph/v1beta1/drives/${driveId}/root/invite`, JSON.stringify({
    recipients: [
      {
        '@libre.graph.recipient.type': shareType,
        objectId: recipientId
      }
    ],
    roles: [roleId]
  }))
}
