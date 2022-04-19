import { Options } from 'k6/options';
import { times } from 'lodash';

import { auth, defaults, k6, playbook, types, utils } from '../../../../../../lib';
import { default as uploadDeleteTrashRestore, options as uploadDeleteTrashRestoreOptions } from './shared.lib';

// upload, delete and trash of many files with several sizes and summary size of 500 MB in one directory
const files: {
    size: number;
    unit: types.AssetUnit;
}[] = [
    ...times(1, () => ({ size: 500, unit: 'KB' as types.AssetUnit })),
    ...times(50, () => ({ size: 5, unit: 'MB' as types.AssetUnit })),
    ...times(10, () => ({ size: 25, unit: 'MB' as types.AssetUnit })),
];
const authFactory = new auth(utils.buildAccount({ login: defaults.ACCOUNTS.EINSTEIN }));
const plays = {
    davUpload: new playbook.dav.Upload(),
    davPropfind: new playbook.dav.Propfind(),
    davDelete: new playbook.dav.Delete(),
    davTrash: new playbook.dav.Trash(),
};

export const options: Options = k6.options({
    tags: {
        test_id: 'upload-delete-trash-many-small',
        issue_url: 'github.com/owncloud/ocis/issues/1018',
    },
    ...uploadDeleteTrashRestoreOptions({ plays, files }),
});

export default (): void =>
    uploadDeleteTrashRestore({ files, plays, credential: authFactory.credential, account: authFactory.account });
