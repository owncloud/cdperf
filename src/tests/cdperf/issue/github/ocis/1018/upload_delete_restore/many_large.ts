import { Options } from 'k6/options';

import { auth, defaults, k6, playbook, types, utils } from '../../../../../../../lib';
import { default as uploadDeleteTrashRestore, options as uploadDeleteTrashRestoreOptions } from './shared.lib';

// upload, delete and restore of many files with several sizes and summary size of 500 MB in one directory
const files: {
    size: number;
    unit: types.AssetUnit;
}[] = [
    { size: 50, unit: 'KB' },
    { size: 500, unit: 'KB' },
    { size: 5, unit: 'MB' },
    { size: 50, unit: 'MB' },
    { size: 500, unit: 'MB' },
    { size: 1, unit: 'GB' },
];
const authFactory = new auth(utils.buildAccount({ login: defaults.ACCOUNTS.EINSTEIN }));
const plays = {
    davUpload: new playbook.dav.Upload(),
    davPropfind: new playbook.dav.Propfind(),
    davDelete: new playbook.dav.Delete(),
    davRestore: new playbook.dav.Restore(),
};

export const options: Options = k6.options({
    tags: {
        test_id: 'upload-delete-restore-many-large',
        issue_url: 'github.com/owncloud/ocis/issues/1018',
    },
    ...uploadDeleteTrashRestoreOptions({ plays, files }),
});

export default (): void =>
    uploadDeleteTrashRestore({ files, plays, credential: authFactory.credential, account: authFactory.account });
