import { Endpoint } from './endpoints';

export const GET__list_current_user_drives:Endpoint<undefined, 'text'> = (r) => {
  return r('GET', '/graph/v1.0/me/drives');
};

export const GET__current_user:Endpoint<undefined, 'text'> = (r) => {
  return r('GET', '/graph/v1.0/me?$expand=memberOf');
};
