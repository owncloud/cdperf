import { check } from 'k6';
import { RefinedResponse, ResponseType } from 'k6/http';

import * as api from '../../api';
import * as types from '../../types';
import { Play } from '../playbook';

export class Upload extends Play {
    constructor({ name, metricID = 'default' }: { name?: string; metricID?: string } = {}) {
        super({ name: name || `cloud_${metricID}_play_dav_files_upload` });
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

        const response = api.dav.files.Upload.exec({ credential: credential, asset, userName, tags, path });

        check(
            response,
            {
                'dav files upload status is 201': () => response.status === 201,
            },
            tags,
        ) || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return { response, tags };
    }
}

export class Delete extends Play {
    constructor({ name, metricID = 'default' }: { name?: string; metricID?: string } = {}) {
        super({ name: name || `cloud_${metricID}_play_dav_files_delete` });
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

        const response = api.dav.files.Delete.exec({ credential: credential, userName, tags, path });

        check(
            response,
            {
                'dav files delete status is 204': () => response.status === 204,
            },
            tags,
        ) || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return { response, tags };
    }
}

export class Download extends Play {
    constructor({ name, metricID = 'default' }: { name?: string; metricID?: string } = {}) {
        super({ name: name || `cloud_${metricID}_play_dav_files_download` });
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

        const response = api.dav.files.Download.exec({ credential: credential, userName, tags, path });

        check(
            response,
            {
                'dav files download status is 200': () => response.status === 200,
            },
            tags,
        ) || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return { response, tags };
    }
}

export class Create extends Play {
    constructor({ name, metricID = 'default' }: { name?: string; metricID?: string } = {}) {
        super({ name: name || `cloud_${metricID}_play_dav_files_create` });
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

        const response = api.dav.files.Create.exec({ credential: credential, userName, tags, path });

        check(
            response,
            {
                'dav files create status is 201': () => response.status === 201,
            },
            tags,
        ) || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return { response, tags };
    }
}

export class Propfind extends Play {
    constructor({ name, metricID = 'default' }: { name?: string; metricID?: string } = {}) {
        super({ name: name || `cloud_${metricID}_play_dav_files_propfind` });
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

        const response = api.dav.files.Propfind.exec({ credential: credential, userName, tags, path });

        check(
            response,
            {
                'dav files propfind status is 207': () => response.status === 207,
            },
            tags,
        ) || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return { response, tags };
    }
}

export class Move extends Play {
    constructor({ name, metricID = 'default' }: { name?: string; metricID?: string } = {}) {
        super({ name: name || `cloud_${metricID}_play_dav_files_move` });
    }

    public exec({
        credential,
        userName,
        path,
        destination,
        tags,
    }: {
        credential: types.Credential;
        path: string;
        destination: string;
        userName: string;
        tags?: types.Tags;
    }): { response: RefinedResponse<ResponseType>; tags: types.Tags } {
        tags = { ...this.tags, ...tags };

        const response = api.dav.files.Move.exec({ credential, userName, tags, path, destination });

        check(
            response,
            {
                'dav files move status is 201': () => response.status === 201,
            },
            tags,
        ) || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return { response, tags };
    }
}
