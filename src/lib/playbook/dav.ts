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
    }): { response: RefinedResponse<ResponseType>; tags: types.Tags; ok: boolean } {
        tags = { ...this.tags, ...tags };

        const response = api.dav.Upload.exec({ credential: credential, asset, userName, tags, path });

        const ok = check(
            response,
            {
                'dav upload status is 201': () => response.status === 201,
            },
            tags,
        );
        ok || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return { response, tags, ok };
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
    }): { response: RefinedResponse<ResponseType>; tags: types.Tags; ok: boolean } {
        tags = { ...this.tags, ...tags };

        const response = api.dav.Delete.exec({ credential: credential, userName, tags, path });

        const ok = check(
            response,
            {
                'dav delete status is 204': () => response.status === 204,
            },
            tags,
        );
        ok || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return { response, tags, ok };
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
    }): { response: RefinedResponse<ResponseType>; tags: types.Tags; ok: boolean } {
        tags = { ...this.tags, ...tags };

        const response = api.dav.Download.exec({ credential: credential, userName, tags, path });

        const ok = check(
            response,
            {
                'dav download status is 200': () => response.status === 200,
            },
            tags,
        );
        ok || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return { response, tags, ok };
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
    }): { response: RefinedResponse<ResponseType>; tags: types.Tags; ok: boolean } {
        tags = { ...this.tags, ...tags };

        const response = api.dav.Create.exec({ credential: credential, userName, tags, path });

        const ok = check(
            response,
            {
                'dav create status is 201': () => response.status === 201,
                'dav create status is 204': () => response.status === 204,
            },
            tags,
        );
        ok || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return { response, tags, ok };
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
        body,
    }: {
        credential: types.Credential;
        path?: string;
        userName: string;
        tags?: types.Tags;
        body?: string;
    }): { response: RefinedResponse<ResponseType>; tags: types.Tags; ok: boolean } {
        tags = { ...this.tags, ...tags };

        const response = api.dav.Propfind.exec({ credential: credential, userName, tags, path, body });

        const ok = check(
            response,
            {
                'dav propfind status is 207': () => response.status === 207,
            },
            tags,
        );
        ok || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return { response, tags, ok };
    }
}

export class Move extends Play {
    constructor({ name, metricID = 'default' }: { name?: string; metricID?: string } = {}) {
        super({ name: name || `cloud_${metricID}_play_dav_move` });
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
    }): { response: RefinedResponse<ResponseType>; tags: types.Tags; ok: boolean } {
        tags = { ...this.tags, ...tags };

        const response = api.dav.Move.exec({ credential, userName, tags, path, destination });

        const ok = check(
            response,
            {
                'dav move status is 201': () => response.status === 201,
            },
            tags,
        );
        ok || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return { response, tags, ok };
    }
}

export class Trash extends Play {
    constructor({ name, metricID = 'default' }: { name?: string; metricID?: string } = {}) {
        super({ name: name || `cloud_${metricID}_play_dav_trash_delete` });
    }

    public exec({
        credential,
        userName,
        fileid,
        tags,
    }: {
        credential: types.Credential;
        fileid?: string;
        userName: string;
        tags?: types.Tags;
    }): { response: RefinedResponse<ResponseType>; tags: types.Tags; ok: boolean } {
        tags = { ...this.tags, ...tags };

        const response = api.dav.Trash.exec({ credential: credential, userName, tags, fileid });

        const ok = check(
            response,
            {
                'dav trash delete status is 204': () => response.status === 204,
            },
            tags,
        );
        ok || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return { response, tags, ok };
    }
}

export class Restore extends Play {
    constructor({ name, metricID = 'default' }: { name?: string; metricID?: string } = {}) {
        super({ name: name || `cloud_${metricID}_play_dav_trash_restore` });
    }

    public exec({
        credential,
        userName,
        fileid,
        path,
        tags,
    }: {
        credential: types.Credential;
        fileid?: string;
        path?: string;
        userName: string;
        tags?: types.Tags;
    }): { response: RefinedResponse<ResponseType>; tags: types.Tags; ok: boolean } {
        tags = { ...this.tags, ...tags };

        const response = api.dav.Restore.exec({ credential: credential, userName, tags, fileid, path });

        const ok = check(
            response,
            {
                'dav trash restore status is 201': () => response.status === 201,
            },
            tags,
        );
        ok || this.metricErrorRate.add(1, tags);

        this.metricTrend.add(response.timings.duration, tags);

        return { response, tags, ok };
    }
}
