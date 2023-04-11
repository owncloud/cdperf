import { Endpoint } from './endpoints';

export const POST__create_drive:Endpoint<{driveName: string}, 'text'> = (r, { driveName }) => {
  return r('POST', '/graph/v1.0/drives', JSON.stringify({ name: driveName }));
}

export const DELETE__delete_drive:Endpoint<{driveId: string}, 'none'> = (r, { driveId } ) => {
  return r('DELETE', `/graph/v1.0/drives/${driveId}`);
}
