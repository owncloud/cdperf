import { RefinedResponse, ResponseType } from 'k6/http';

import * as types from '../../types';
import * as api from '../api';

export class Delete {
    public static exec({
        credential,
        userName,
        path = '',
        tags,
    }: {
        credential: types.Credential;
        userName: string;
        path?: string;
        tags?: types.Tags;
    }): RefinedResponse<ResponseType> {
        return api.request({
            method: 'DELETE',
            credential,
            path: `/remote.php/dav/trash-bin/${userName}/${path}`,
            params: { tags },
        });
    }
}
