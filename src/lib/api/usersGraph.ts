import { RefinedResponse, ResponseType } from 'k6/http';

import * as types from '../types';
import * as api from './api';

export class Create {
  public static exec({
    userName,
    password,
    email,
    credential,
    tags,
  }: {
    credential: types.Credential;
    userName: string;
    password: string;
    email: string;
    tags?: types.Tags;
  }): RefinedResponse<ResponseType> {

    const body = JSON.stringify({
      displayName: userName,
      mail: email,
      onPremisesSamAccountName: userName,
      passwordProfile: { password: password }
    })

    return api.request({
      method: 'POST',
      credential,
      path: `/graph/v1.0/users`,
      params: { tags },
      body: body
    });
  }
}

export class Delete {
  public static exec({
    userName,
    credential,
    tags,
  }: {
    credential: types.Credential;
    userName: string;
    tags?: types.Tags;
  }): RefinedResponse<ResponseType> {
    return api.request({
      method: 'DELETE',
      credential,
      path: `/graph/v1.0/users/${userName}`,
      params: { tags },
    });
  }
}
