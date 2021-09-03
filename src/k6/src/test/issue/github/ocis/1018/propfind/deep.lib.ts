import { Options, Threshold } from 'k6/options';
import { times } from 'lodash';

import { playbook, types, utils } from '../../../../../../lib';

interface File {
    size: number;
    unit: types.AssetUnit;
}

interface Plays {
    davUpload: playbook.dav.files.Upload;
    davPropfind: playbook.dav.files.Propfind;
    davCreate: playbook.dav.files.Create;
    davDelete: playbook.dav.files.Delete;
}

export const options = ({ files, plays }: { files: File[]; plays: Plays }): Options => {
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
    plays,
}: {
    plays: Plays;
    files: File[];
    account: types.Account;
    credential: types.Credential;
}): void => {
    const filesUploaded: { id: string; name: string; folder: string }[] = [];
    const root = `${__VU}-${__ITER}`;

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

        const folder = times(5, () => utils.randomString())
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
