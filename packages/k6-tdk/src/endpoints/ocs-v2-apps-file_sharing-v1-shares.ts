import { Endpoint, Permission, ShareType } from './endpoints';

export const POST__create_share: Endpoint<{
  shareResourcePath: string,
  shareType: ShareType,
  shareReceiverId: string,
  shareReceiverPermission: Permission
}, 'text'> = (r, { shareReceiverPermission, shareType, shareResourcePath, shareReceiverId }) => {
  return r('POST', '/ocs/v2.php/apps/files_sharing/api/v1/shares', {
    path: shareResourcePath,
    shareType: shareType.toString(),
    shareWith: shareReceiverId,
    permissions: shareReceiverPermission.toString()
  }, {
    headers: {
      'OCS-APIRequest': 'true'
    }
  })
}

export const POST__accept_share: Endpoint<{ shareId: string }, 'text'> = (r, { shareId }) => {
  return r('POST', `/ocs/v2.php/apps/files_sharing/api/v1/shares/pending/${shareId}`, undefined, {
    headers: {
      'OCS-APIRequest': 'true'
    }
  })
}

export const DELETE__delete_share: Endpoint<{ shareId: string }, 'text'> = (r, { shareId }) => {
  return r('DELETE', `/ocs/v2.php/apps/files_sharing/api/v1/shares/${shareId}`, undefined, {
    headers: {
      'OCS-APIRequest': 'true'
    }
  })
}
