import { Endpoint } from './endpoints';

export const GET__get_current_user_drives:Endpoint<{}, 'text'> = (r) => {
  return r('GET', '/graph/v1.0/me/drives');
};

export const GET__current_user:Endpoint<{}, 'text'> = (r) => {
  return r('GET', '/graph/v1.0/me?$expand=memberOf');
};
