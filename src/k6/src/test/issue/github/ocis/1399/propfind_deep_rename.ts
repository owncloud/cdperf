import { Options } from 'k6/options';
import { times } from 'lodash';

import { auth, defaults, k6, playbook, types, utils } from '../../../../../lib';

const file: {
    size: number;
    unit: types.AssetUnit;
} = {
    size: 10,
    unit: 'KB',
};
const adminAuthFactory = new auth(utils.buildAccount({ login: defaults.ACCOUNTS.ADMIN }));
const plays = {
    davCreate: new playbook.dav.files.Create(),
    davUpload: new playbook.dav.files.Upload(),
    davMove: new playbook.dav.files.Move(),
    davDelete: new playbook.dav.files.Delete(),
    davPropfind: new playbook.dav.files.Propfind(),
};
export const options: Options = k6.options({
    tags: {
        test_id: 'propfind-deep-rename',
        issue_url: 'github.com/owncloud/ocis/issues/1399',
    },
});

export default (): void => {
    const admin = {
        name: adminAuthFactory.account.login,
        password: adminAuthFactory.account.password,
        credential: adminAuthFactory.credential,
    };

    const folders = times(50, (i) => `VU-${__VU}-ITER-${__ITER}-I-${i}`).reduce((acc: string[][], tlf, i) => {
        acc.push([tlf, ...times(5, (i) => `D-${i + 1}`)]);
        acc[i].forEach((_, ci) => {
            plays.davCreate.exec({
                credential: admin.credential,
                path: acc[i].slice(0, ci + 1).join('/'),
                userName: admin.name,
            });
        });
        return acc;
    }, []);

    const asset = utils.buildAsset({
        ...file,
        name: 'dummy.zip',
    });

    folders.forEach((g) => {
        g.forEach((_, i) => {
            plays.davUpload.exec({
                asset: asset,
                credential: admin.credential,
                userName: admin.name,
                path: g.slice(0, i + 1).join('/'),
            });
        });
    });

    folders.forEach((g) => {
        g.forEach((_, i) => {
            const newName = `renamed-${g.slice(g.length - i - 1, g.length - i)}`;
            const path = g.slice(0, g.length - i).join('/');
            const destination = [...g.slice(0, g.length - i - 1), newName].join('/');

            plays.davMove.exec({
                credential: admin.credential,
                userName: admin.name,
                path,
                destination,
            });

            plays.davPropfind.exec({
                credential: admin.credential,
                userName: admin.name,
                path: destination,
            });

            g[g.length - 1 - i] = newName;
        });
    });

    folders.forEach((g) => {
        plays.davDelete.exec({
            credential: admin.credential,
            userName: admin.name,
            path: g[0],
        });
    });
};
