import { Options, Threshold } from 'k6/options';
import { times } from 'lodash';

import { playbook, types, utils } from '../../../../../../lib';

interface File {
    size: number;
    unit: types.AssetUnit;
}

const plays = {
    davUpload: new playbook.dav.Upload(),
    davCreate: new playbook.dav.Create(),
    davPropfind: new playbook.dav.Propfind(),
    davDelete: new playbook.dav.Delete(),
};

export const options = ({ files }: { files: File[] }): Options => {
    return {
        thresholds: files.reduce((acc: { [name: string]: Threshold[] }, c) => {
            acc[`${plays.davUpload.metricTrendName}{asset:${c.unit + c.size.toString()}}`] = [];
            acc[`${plays.davCreate.metricTrendName}{asset:${c.unit + c.size.toString()}}`] = [];
            acc[`${plays.davDelete.metricTrendName}{asset:${c.unit + c.size.toString()}}`] = [];
            return acc;
        }, {}),
    };
};

export default ({
    files,
    account,
    credential,
    depth = 5,
}: {
    files: File[];
    account: types.Account;
    credential: types.Credential;
    depth?: number;
}): void => {
    const filesUploaded: { id: string; name: string; folder: string }[] = [];
    const root = `${__VU}-${__ITER}`;

    depth -= 1;

    plays.davCreate.exec({
        credential,
        path: root,
        userName: account.login,
    });

    files.forEach((f) => {
        const id = f.unit + f.size.toString();

        const asset = utils.buildAsset({
            name: `${account.login}-dummy.zip`,
            unit: f.unit,
            size: f.size,
        });

        const folder = times(depth, () => utils.randomString())
            .reduce(
                (acc: string[], c) => {
                    acc.push(c);

                    plays.davCreate.exec({
                        credential,
                        path: acc.join('/'),
                        userName: account.login,
                        tags: { asset: id },
                    });

                    return acc;
                },
                [root],
            )
            .join('/');

        plays.davUpload.exec({
            credential,
            asset,
            path: folder,
            userName: account.login,
            tags: { asset: id },
        });

        filesUploaded.push({ id, name: asset.name, folder });
    });

    plays.davPropfind.exec({
        credential,
        path: root,
        userName: account.login,
    });

    filesUploaded.forEach((f) => {
        plays.davDelete.exec({
            credential,
            userName: account.login,
            path: [...f.folder.split('/'), f.name].join('/'),
            tags: { asset: f.id },
        });
    });

    plays.davDelete.exec({
        credential,
        userName: account.login,
        path: root,
    });
};
