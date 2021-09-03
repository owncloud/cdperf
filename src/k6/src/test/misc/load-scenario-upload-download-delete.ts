import { SharedArray } from 'k6/data';
import { times } from 'lodash';

import { auth, playbook, types, utils } from '../../lib';
import { buildAsset } from '../../lib/utils';

const plays = {
    davFilesCreate: new playbook.dav.files.Create(),
    davFilesMove: new playbook.dav.files.Move(),
    davFilesUpload: new playbook.dav.files.Upload(),
    davFilesDownload: new playbook.dav.files.Download(),
    davFilesDelete: new playbook.dav.files.Delete(),
    davTrashBinDelete: new playbook.dav.trashBin.Delete(),
};

const SCENARIO = __ENV.SCENARIO || 'small';

const scenarioData = new SharedArray('assets', (): [] => {
    const types: { [key: string]: { count: number; size: number; unit: types.AssetUnit }[] } = {
        small: [
            { count: 36, size: 5, unit: 'MB' },
            { count: 4, size: 30, unit: 'MB' },
        ],
        medium: [
            { count: 240, size: 5, unit: 'MB' },
            { count: 25, size: 32, unit: 'MB' },
        ],
        large: [
            { count: 1, size: 3, unit: 'GB' },
            { count: 1, size: 7, unit: 'GB' },
        ],
    };

    const scenarioData = types[SCENARIO].map((scenario) => {
        return { count: scenario.count, asset: buildAsset({ size: scenario.size, unit: scenario.unit }) };
    });

    return (scenarioData as unknown) as [];
});

export default (): void => {
    const login = __ENV.USER_LOGIN
        ? `${__ENV.USER_LOGIN.split('@')[0]}-${__VU}@${__ENV.USER_LOGIN.split('@')[1]}`
        : 'admin';
    const password = __ENV.USER_PASSWORD ? `${__ENV.USER_PASSWORD}-${__VU}` : 'admin';
    const userAuthFactory = new auth({ login, password });
    const { account, credential } = userAuthFactory;
    const { login: userName } = account;

    scenarioData.forEach(({ asset, count }) => {
        times(count, (i) => {
            const folderName = `${userName}-${i}-${utils.randomString()}`;

            plays.davFilesCreate.exec({
                credential,
                userName,
                path: folderName,
            });

            plays.davFilesUpload.exec({
                credential,
                userName,
                asset,
                path: folderName,
            });

            plays.davFilesDelete.exec({
                credential,
                userName,
                path: folderName,
            });
        });
    });

    plays.davTrashBinDelete.exec({
        credential,
        userName,
    });
};
