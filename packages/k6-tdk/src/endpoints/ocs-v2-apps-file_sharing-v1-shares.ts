import { RequestBody } from 'k6/http';

import { Platform } from '@/const';

import { Endpoint, Permission, ShareType } from './endpoints';

export const POST__create_share: Endpoint<{
  shareResourcePath: string,
  shareType: ShareType,
  shareReceiver: string,
  shareReceiverPermission: Permission
}, 'text', { platform: Platform }> = (r, {
  shareReceiverPermission, shareType, shareResourcePath, shareReceiver
}, o) => {
  const headers = {
    'OCS-APIRequest': 'true'
  }

  let body: RequestBody = {
    path: shareResourcePath,
    shareType: shareType.toString(),
    shareWith: shareReceiver,
    permissions: shareReceiverPermission.toString()
  }

  if(o?.platform !== Platform.ownCloudInfiniteScale){
    body = JSON.stringify(body)
    headers['Content-Type'] = 'application/json'
  }

  return r('POST', '/ocs/v2.php/apps/files_sharing/api/v1/shares', body, { headers });
};

export const POST__accept_share: Endpoint<{ shareId: string }, 'text'> = (r, { shareId }) => {
  return r('POST', `/ocs/v2.php/apps/files_sharing/api/v1/shares/pending/${shareId}`, undefined, {
    headers: {
      'OCS-APIRequest': 'true'
    }
  });
};

export const DELETE__delete_share: Endpoint<{ shareId: string }, 'text'> = (r, { shareId }) => {
  return r('DELETE', `/ocs/v2.php/apps/files_sharing/api/v1/shares/${shareId}`, undefined, {
    headers: {
      'OCS-APIRequest': 'true'
    }
  });
};
