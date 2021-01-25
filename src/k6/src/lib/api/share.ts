import {RefinedResponse, ResponseType} from 'k6/http';

import * as types from '../types';
import * as api from './api';

export class Create {
    public static exec(
        {
            credential,
            shareType,
            shareWith,
            path,
            permissions,
            tags,
        }: {
            credential: types.Credential;
            shareType: string;
            shareWith: string;
            path: string;
            permissions: string;
            tags?: types.Tags;
        }): RefinedResponse<ResponseType> {
        return api.request({
            method: 'POST',
            credential,
            path: `/ocs/v1.php/apps/files_sharing/api/v1/shares`,
            params: {tags},
            body: {shareType, shareWith, path, permissions},
        });
    }
}

export class Accept {
    public static exec(
        {
            credential,
            id,
            tags,
        }: {
            credential: types.Credential;
            id: string;
            tags?: types.Tags;
        }): RefinedResponse<ResponseType> {
        return api.request({
            method: 'POST',
            credential,
            path: `/ocs/v1.php/apps/files_sharing/api/v1/shares/pending/${id}`,
            params: {tags},
        });
    }
}