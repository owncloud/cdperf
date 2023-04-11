import { Endpoint } from './endpoints';

export const POST__list_roles:Endpoint<undefined, 'text'> = (r) => {
  return r('POST', '/api/v0/settings/roles-list', JSON.stringify({}));
};
