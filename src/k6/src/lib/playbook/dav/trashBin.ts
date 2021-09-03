import { check } from 'k6';
import { RefinedResponse, ResponseType } from 'k6/http';

import * as api from '../../api';
import * as types from '../../types';
import { Play } from '../playbook';

export class Delete extends Play {
    constructor({ name, metricID = 'default' }: { name?: string; metricID?: string } = {}) {
        super({ name: name || `cloud_${metricID}_play_dav_trashBin_delete` });
    }

    public exec({
        credential,
        userName,
        path,
        tags,
    }: {
        credential: types.Credential;
        path?: string;
        userName: string;
        tags?: types.Tags;
    }): { response: RefinedResponse<ResponseType>; tags: types.Tags } {
        tags = { ...this.tags, ...tags };

        const response = api.dav.trashBin.Delete.exec({ credential: credential, userName, tags, path });

        check(
            response,
            {
                'dav trashBin delete status is 204': () => response.status === 204,
            },
            tags,
        ) || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return { response, tags };
    }
}
