import { Options } from 'k6/options';
import { times } from 'lodash';

import { auth, defaults, k6, playbook, types, utils } from '../../../../../../lib';
import { default as upDownDelete, options as upDownDeleteOptions } from './shared.lib';

// create 10 users. Do the Simple Uploads & downloads with each user in parallel.

const files: {
    size: number;
    unit: types.AssetUnit;
}[] = times(10, () => ({ size: 1, unit: 'KB' as types.AssetUnit }));
const authFactory = new auth(utils.buildAccount({ login: defaults.ACCOUNTS.ADMIN }));
const plays = {
    davUpload: new playbook.dav.files.Upload(),
    davDownload: new playbook.dav.files.Download(),
    davDelete: new playbook.dav.files.Delete(),
    usersCreate: new playbook.users.Create(),
    usersDelete: new playbook.users.Delete(),
};

export const options: Options = k6.options({
    tags: {
        test_id: 'upload-download-delete-with-new-user',
        issue_url: 'github.com/owncloud/ocis/issues/1018',
    },
    ...upDownDeleteOptions({ plays, files }),
});

export default (): void => {
    const userName: string = utils.randomString();
    const password: string = utils.randomString();

    plays.usersCreate.exec({
        userName,
        password,
        email: `${userName}@owncloud.com`,
        credential: authFactory.credential,
    });

    const userAuthFactory = new auth({ login: userName, password });

    upDownDelete({ files, plays, credential: userAuthFactory.credential, account: userAuthFactory.account });

    plays.usersDelete.exec({ userName: userName, credential: authFactory.credential });
};
