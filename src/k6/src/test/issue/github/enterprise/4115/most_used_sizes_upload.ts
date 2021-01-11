import {Options} from 'k6/options';
import {times} from 'lodash';

import {auth, defaults, playbook, utils, k6} from '../../../../../lib';
import {
    default as upDownDelete,
    options as upDownDeleteOptions,
} from '../../ocis/1018/upload_download_delete/shared.lib';

// upload, download and delete of 1000 files with following distribution:
// 83,68% under 1mb
// - 828 files total
// -- 92 100kb
// -- 92 200kb
// -- 92 300kb
// -- 92 400kb
// -- 92 500kb
// -- 92 600kb
// -- 92 700kb
// -- 92 800kb
// -- 92 900kb
// 12,57% between 1mb and 10mb
// - 130 files total
// -- 13 1mb
// -- 13 2mb
// -- 13 3mb
// -- 13 4mb
// -- 13 5mb
// -- 13 6mb
// -- 13 7mb
// -- 13 8mb
// -- 13 9mb
// -- 13 10mb
// 2,96% between 1mb and 100mb
// - 30 files total
// -- 3 10mb
// -- 3 20mb
// -- 3 30mb
// -- 3 40mb
// -- 3 50mb
// -- 3 60mb
// -- 3 70mb
// -- 3 80mb
// -- 3 90mb
// -- 3 100mb
// 0,78% larger then 100mb
// - 10 files total
// -- 1 120mb
// -- 1 140mb
// -- 1 160mb
// -- 1 180mb
// -- 1 200mb
// -- 1 220mb
// -- 1 240mb
// -- 1 260mb
// -- 1 280mb
// -- 1 300mb

const files: {
    size: number;
    unit: any;
}[] = [
    // 83,68% under 1mb
    ...times(10, () => ({size: 100, unit: 'KB'})),

];

const authFactory = new auth(utils.buildAccount({login: defaults.ACCOUNTS.EINSTEIN}));
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
    ...upDownDeleteOptions({plays, files}),
});

export default (): void =>
    upDownDelete({files, plays, credential: authFactory.credential, account: authFactory.account});
