import { check } from 'k6';
import { RefinedResponse, ResponseType } from 'k6/http';

import * as api from '../api';
import * as cdperfDefaults from '../defaults';
import * as types from '../types';
import { Play } from './playbook';

export class Create extends Play {
    constructor({ name, metricID = 'default' }: { name?: string; metricID?: string } = {}) {
        super({ name: name || `cloud_${metricID}_play_users_create` });
    }

    public exec({
        credential,
        userName,
        password,
        email,
        tags,
    }: {
        credential: types.Credential;
        userName: string;
        password: string;
        email: string;
        tags?: types.Tags;
    }): { response: RefinedResponse<ResponseType>; tags: types.Tags } {
        tags = { ...this.tags, ...tags };
        const response =
            cdperfDefaults.ENV.CLOUD_VENDOR === 'ocis'
                ? api.usersGraph.Create.exec({ credential: credential, userName, password, tags, email })
                : api.users.Create.exec({ credential: credential, userName, password, tags, email });
        check(
            response,
            {
                'users create status is 200': () => response.status === 200,
            },
            tags,
        ) || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return { response, tags };
    }
}

export class Delete extends Play {
    constructor({ name, metricID = 'default' }: { name?: string; metricID?: string } = {}) {
        super({ name: name || `cloud_${metricID}_play_users_delete` });
    }

    public exec({
        credential,
        userName,
        tags,
    }: {
        credential: types.Credential;
        userName: string;
        tags?: types.Tags;
    }): { response: RefinedResponse<ResponseType>; tags: types.Tags } {
        tags = { ...this.tags, ...tags };

        const response =
            cdperfDefaults.ENV.CLOUD_VENDOR === 'ocis'
                ? api.usersGraph.Delete.exec({ credential: credential, userName, tags })
                : api.users.Delete.exec({ credential: credential, userName, tags });
        const statusCode = cdperfDefaults.ENV.CLOUD_VENDOR === 'ocis' ? 204 : 200;
        check(
            response,
            {
                'users delete status is 204 or 200': () => response.status === statusCode,
            },
            tags,
        ) || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return { response, tags };
    }
}
