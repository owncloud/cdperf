import { check } from 'k6';
import { RefinedResponse, ResponseType } from 'k6/http';

import * as api from '../api';
import * as types from '../types';
import { Play } from './playbook';

export class Upload extends Play {
    constructor({ name, metricID = 'default' }: { name?: string; metricID?: string } = {}) {
        super({ name: name || `cloud_${metricID}_play_dav_upload` });
    }

    public exec({
        credential,
        userName,
        path,
        asset,
        tags,
    }: {
        credential: types.Credential;
        path?: string;
        userName: string;
        asset: types.Asset;
        tags?: types.Tags;
    }): { response: RefinedResponse<ResponseType>; tags: types.Tags } {
        tags = { ...this.tags, ...tags };

        const response = api.dav.Upload.exec({ credential: credential, asset, userName, tags, path });

        check(
            response,
            {
                'dav upload status is 201': () => response.status === 201,
            },
            tags,
        ) || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return { response, tags };
    }
}

export class Delete extends Play {
    constructor({ name, metricID = 'default' }: { name?: string; metricID?: string } = {}) {
        super({ name: name || `cloud_${metricID}_play_dav_delete` });
    }

    public exec({
        credential,
        userName,
        path,
        tags,
    }: {
        credential: types.Credential;
        path: string;
        userName: string;
        tags?: types.Tags;
    }): { response: RefinedResponse<ResponseType>; tags: types.Tags } {
        tags = { ...this.tags, ...tags };

        const response = api.dav.Delete.exec({ credential: credential, userName, tags, path });

        check(
            response,
            {
                'dav delete status is 204': () => response.status === 204,
            },
            tags,
        ) || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return { response, tags };
    }
}

export class Download extends Play {
    constructor({ name, metricID = 'default' }: { name?: string; metricID?: string } = {}) {
        super({ name: name || `cloud_${metricID}_play_dav_download` });
    }

    public exec({
        credential,
        userName,
        path,
        tags,
    }: {
        credential: types.Credential;
        path: string;
        userName: string;
        tags?: types.Tags;
    }): { response: RefinedResponse<ResponseType>; tags: types.Tags } {
        tags = { ...this.tags, ...tags };

        const response = api.dav.Download.exec({ credential: credential, userName, tags, path });

        check(
            response,
            {
                'dav download status is 200': () => response.status === 200,
            },
            tags,
        ) || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return { response, tags };
    }
}

export class Create extends Play {
    constructor({ name, metricID = 'default' }: { name?: string; metricID?: string } = {}) {
        super({ name: name || `cloud_${metricID}_play_dav_create` });
    }

    public exec({
        credential,
        userName,
        path,
        tags,
    }: {
        credential: types.Credential;
        path: string;
        userName: string;
        tags?: types.Tags;
    }): { response: RefinedResponse<ResponseType>; tags: types.Tags } {
        tags = { ...this.tags, ...tags };

        const response = api.dav.Create.exec({ credential: credential, userName, tags, path });

        check(
            response,
            {
                'dav create status is 201': () => response.status === 201,
            },
            tags,
        ) || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return { response, tags };
    }
}

export class Propfind extends Play {
    constructor({ name, metricID = 'default' }: { name?: string; metricID?: string } = {}) {
        super({ name: name || `cloud_${metricID}_play_dav_propfind` });
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

        const response = api.dav.Propfind.exec({ credential: credential, userName, tags, path });

        check(
            response,
            {
                'dav propfind status is 207': () => response.status === 207,
            },
            tags,
        ) || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return { response, tags };
    }
}
