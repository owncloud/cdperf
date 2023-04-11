import { Endpoint } from './endpoints';

export const GET__list_applications:Endpoint<undefined, 'text'> = (r ) => {
  return r('GET', '/graph/v1.0/applications');
}
