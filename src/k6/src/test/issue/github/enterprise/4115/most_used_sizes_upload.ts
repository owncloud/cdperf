import { Options } from 'k6/options';
import { times } from 'lodash';

import { auth, defaults, k6, playbook, types, utils } from '../../../../../lib';
import {
    default as upDownDelete,
    options as upDownDeleteOptions,
} from '../../ocis/1018/upload_download_delete/shared.lib';

// upload, download and delete files with following distribution:
// -- 92 files - 100kb
// -- 92 files - 200kb
// -- 92 files - 300kb
// -- 92 files - 400kb
// -- 92 files - 500kb
// -- 92 files - 600kb
// -- 92 files - 700kb
// -- 92 files - 800kb
// -- 92 files - 900kb
// -- 13 files - 1mb
// -- 13 files - 2mb
// -- 13 files - 3mb
// -- 13 files - 4mb
// -- 13 files - 5mb
// -- 13 files - 6mb
// -- 13 files - 7mb
// -- 13 files - 8mb
// -- 13 files - 9mb
// -- 3 files - 10mb
// -- 3 files - 20mb
// -- 3 files - 30mb
// -- 3 files - 40mb
// -- 3 files - 50mb
// -- 3 files - 60mb
// -- 3 files - 70mb
// -- 3 files - 80mb
// -- 3 files - 90mb
// -- 3 files - 100mb
// -- 1 files - 120mb
// -- 1 files - 140mb
// -- 1 files - 160mb
// -- 1 files - 180mb
// -- 1 files - 200mb
// -- 1 files - 220mb
// -- 1 files - 240mb
// -- 1 files - 260mb
// -- 1 files - 280mb
// -- 1 files - 300mb

const createFiles = (count: number, size: number, unit: types.AssetUnit): { size: number; unit: types.AssetUnit }[] => {
    return times(count, () => ({ size, unit }));
};

const files: {
    size: number;
    unit: types.AssetUnit;
}[] = [
    // 83,68% under 1mb
    ...createFiles(92, 100, 'KB'),
    ...createFiles(92, 200, 'KB'),
    ...createFiles(92, 300, 'KB'),
    ...createFiles(92, 400, 'KB'),
    ...createFiles(92, 500, 'KB'),
    ...createFiles(92, 600, 'KB'),
    ...createFiles(92, 700, 'KB'),
    ...createFiles(92, 800, 'KB'),
    ...createFiles(92, 900, 'KB'),
    // 12,57% between 1mb and 10mb
    ...createFiles(13, 1, 'MB'),
    ...createFiles(13, 2, 'MB'),
    ...createFiles(13, 3, 'MB'),
    ...createFiles(13, 4, 'MB'),
    ...createFiles(13, 5, 'MB'),
    ...createFiles(13, 6, 'MB'),
    ...createFiles(13, 7, 'MB'),
    ...createFiles(13, 8, 'MB'),
    ...createFiles(13, 9, 'MB'),
    // 2,96% between 1mb and 100mb
    ...createFiles(3, 10, 'MB'),
    ...createFiles(3, 20, 'MB'),
    ...createFiles(3, 30, 'MB'),
    ...createFiles(3, 40, 'MB'),
    ...createFiles(3, 50, 'MB'),
    ...createFiles(3, 60, 'MB'),
    ...createFiles(3, 70, 'MB'),
    ...createFiles(3, 80, 'MB'),
    ...createFiles(3, 90, 'MB'),
    ...createFiles(3, 100, 'MB'),
    // 0,78% larger then 100mb
    { size: 120, unit: 'MB' },
    { size: 140, unit: 'MB' },
    { size: 160, unit: 'MB' },
    { size: 180, unit: 'MB' },
    { size: 200, unit: 'MB' },
    { size: 220, unit: 'MB' },
    { size: 240, unit: 'MB' },
    { size: 260, unit: 'MB' },
    { size: 280, unit: 'MB' },
    { size: 300, unit: 'MB' },
];

const authFactory = new auth(utils.buildAccount({ login: defaults.ACCOUNTS.EINSTEIN }));
const plays = {
    davUpload: new playbook.dav.Upload(),
    davDownload: new playbook.dav.Download(),
    davDelete: new playbook.dav.Delete(),
};

export const options: Options = k6.options({
    tags: {
        test_id: 'most-used-sizes-upload',
        issue_url: 'github.com/owncloud/enterprise/issues/4115',
    },
    ...upDownDeleteOptions({ plays, files }),
});

export default (): void =>
    upDownDelete({
        files,
        plays,
        credential: authFactory.credential,
        account: authFactory.account,
    });
