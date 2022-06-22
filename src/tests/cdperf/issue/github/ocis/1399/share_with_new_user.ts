import { Options, Threshold } from 'k6/options';
import { times } from 'lodash';

import { auth, defaults, k6, playbook, types, utils } from '../../../../../../lib';

const files: {
    size: number;
    unit: types.AssetUnit;
}[] = times(500, () => ({ size: 10, unit: 'KB' }));
const adminAuthFactory = new auth(utils.buildAccount({ login: defaults.ACCOUNTS.ADMIN }));
const plays = {
    davCreate: new playbook.dav.Create(),
    davUpload: new playbook.dav.Upload(),
    davDelete: new playbook.dav.Delete(),
    davDownload: new playbook.dav.Download(),
    usersCreate: new playbook.users.Create(),
    usersDelete: new playbook.users.Delete(),
    shareCreate: new playbook.share.Create(),
    shareAccept: new playbook.share.Accept(),
    davPropfind: new playbook.dav.Propfind(),
};
export const options: Options = k6.options({
    tags: {
        test_id: 'share-with-new-user',
        issue_url: 'github.com/owncloud/ocis/issues/1399',
    },
    thresholds: files.reduce((acc: { [name: string]: Threshold[] }, c) => {
        acc[`${plays.davUpload.metricTrendName}{asset:${c.unit + c.size.toString()}}`] = [];
        acc[`${plays.davDownload.metricTrendName}{asset:${c.unit + c.size.toString()}}`] = [];
        acc[`${plays.davDelete.metricTrendName}{asset:${c.unit + c.size.toString()}}`] = [];
        return acc;
    }, {}),
});

export default (): void => {
    const userAuthFactory = new auth({ login: utils.randomString(), password: utils.randomString() });
    const user = {
        name: userAuthFactory.account.login,
        password: userAuthFactory.account.password,
        get credential() {
            return userAuthFactory.credential;
        },
    };
    const admin = {
        name: adminAuthFactory.account.login,
        password: adminAuthFactory.account.password,
        credential: adminAuthFactory.credential,
    };

    plays.usersCreate.exec({
        credential: admin.credential,
        userName: user.name,
        password: user.password,
        email: `${user.name}@owncloud.com`,
    });

    plays.davCreate.exec({
        credential: admin.credential,
        userName: admin.name,
        path: user.name,
    });

    const filesUploaded: { id: string; name: string }[] = [];

    files.forEach((f, i) => {
        const id = f.unit + f.size.toString();
        const asset = utils.buildAsset({
            name: `${i}-dummy.zip`,
            size: f.size,
            unit: f.unit,
        });

        plays.davUpload.exec({
            asset,
            credential: admin.credential,
            userName: admin.name,
            path: user.name,
            tags: { asset: id },
        });

        filesUploaded.push({ id, name: asset.name });
    });

    const share = plays.shareCreate.exec({
        credential: adminAuthFactory.credential,
        shareType: '0',
        shareWith: user.name,
        path: user.name,
        permissions: '1',
    });

    plays.shareAccept.exec({
        credential: userAuthFactory.credential,
        id: utils.parseXML(share.response.body).getElementsByTagName('id')[0].childNodes[0].textContent as string,
    });

    plays.davPropfind.exec({
        credential: user.credential,
        path: ['Shares', user.name].join('/'),
        userName: user.name,
    });

    filesUploaded.forEach((f) => {
        plays.davDownload.exec({
            credential: user.credential,
            userName: user.name,
            path: ['Shares', user.name, f.name].join('/'),
            tags: { asset: f.id },
        });
    });

    plays.usersDelete.exec({ credential: admin.credential, userName: user.name });

    plays.davDelete.exec({
        credential: admin.credential,
        path: user.name,
        userName: admin.name,
    });
};
