import encoding from 'k6/encoding';
import { Params } from 'k6/http';
import { merge } from 'lodash';

import { Account, Credential, Token } from '../auth';

export const buildParams = (params: Params, { credential }: { credential?: Credential }): Params => {
  const isOIDCGuard = (credential as Token).tokenType !== undefined;
  const authOIDC = credential as Token;
  const authBasic = credential as Account;

  const np: Params = {};

  if (isOIDCGuard) {
    merge(np, {
      headers: {
        Authorization: `${authOIDC.tokenType} ${authOIDC.accessToken}`,
      },
    });
  }

  if (!isOIDCGuard && authBasic.login && authBasic.password) {
    merge<Params, Params>(np, {
      headers: {
        Authorization: `Basic ${encoding.b64encode(`${authBasic.login}:${authBasic.password}`)}`,
      },
    });
  }

  return merge(np, params);
};
