import { bytes } from 'k6';
import { randomBytes as k6_randomBytes } from 'k6/crypto';
import { RefinedResponseBody, ResponseType } from 'k6/http';
import { DOMParser } from 'xmldom';

import * as defaults from './defaults';
import * as types from './types';

export const randomNumber = ({ min, max }: { min: number; max: number }): number => {
    return Math.random() * (max - min) + min;
};

export const randomString = ({ length = 10 }: { length?: number } = {}): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;
};

export const buildAccount = ({
    login = defaults.ACCOUNTS.EINSTEIN,
    ignore_defaults = false,
}: {
    login: string;
    ignore_defaults?: boolean;
}): types.Account => {
    if (!ignore_defaults && defaults.ENV.CLOUD_LOGIN && defaults.ENV.CLOUD_PASSWORD) {
        return {
            login: defaults.ENV.CLOUD_LOGIN,
            password: defaults.ENV.CLOUD_PASSWORD,
        };
    }

    return defaults.ACCOUNTS.ALL[login];
};

export const buildAsset = ({
    name = 'dummy.zip',
    size = 50,
    unit = 'KB',
}: {
    name?: string;
    size?: number;
    unit?: types.AssetUnit;
}): types.Asset => {
    const gen = {
        KB: (s: number): bytes => {
            return k6_randomBytes(s * 1024);
        },
        MB: (s: number): bytes => {
            return gen.KB(s * 1024);
        },
        GB: (s: number): bytes => {
            return gen.MB(s * 1024);
        },
    };

    const fileBaseName = name.split('/').reverse()[0];
    const fileName = fileBaseName.split('.')[0];
    const fileExtension = fileBaseName.split('.').reverse()[0] || 'zip';

    return {
        name: `${fileName}-${unit}-${size}-${randomString()}.${fileExtension}`,
        bytes: gen[unit](size),
    };
};

export const objectToQueryString = (o: { [key: string]: string | number }): string => {
    return Object.keys(o)
        .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(o[key]))
        .join('&');
};

export const queryStringToObject = (qs: string): { [key: string]: string } => {
    try {
        const url = new URL(qs);
        qs = url.search;
    } catch (e) {}

    return Object.fromEntries(new URLSearchParams(qs));
};

export const parseXML = (body: RefinedResponseBody<ResponseType>): Document => {
    return new DOMParser().parseFromString(body as string, 'text/xml');
};
