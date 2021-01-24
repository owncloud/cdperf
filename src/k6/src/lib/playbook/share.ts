import {check} from 'k6';
import {RefinedResponse, ResponseType} from 'k6/http';

import * as api from '../api';
import * as types from '../types';
import {Play} from './playbook';

export class Create extends Play {
    constructor({name, metricID = 'default'}: { name?: string; metricID?: string } = {}) {
        super({name: name || `cloud_${metricID}_play_share_create`});
    }

    public exec(
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
        }): { response: RefinedResponse<ResponseType>; tags: types.Tags } {
        tags = {...this.tags, ...tags};

        const response = api.share.Create.exec({credential, shareType, shareWith, path, permissions, tags});

        check(
            response,
            {
                'share create status is 200': () => response.status === 200,
            },
            tags,
        ) || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return {response, tags};
    }
}

export class Accept extends Play {
    constructor({name, metricID = 'default'}: { name?: string; metricID?: string } = {}) {
        super({name: name || `cloud_${metricID}_play_share_accept`});
    }

    public exec(
        {
            credential,
            id,
            tags,
        }: {
            credential: types.Credential;
            id: string;
            tags?: types.Tags;
        }): { response: RefinedResponse<ResponseType>; tags: types.Tags } {
        tags = {...this.tags, ...tags};

        const response = api.share.Accept.exec({credential, id, tags});

        check(
            response,
            {
                'share accept status is 200': () => response.status === 200,
            },
            tags,
        ) || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return {response, tags};
    }
}