import { Options, Threshold } from 'k6/options';

import { playbook, types, utils } from '../../../../../../../lib';

interface File {
    size: number;
    unit: types.AssetUnit;
}

interface Plays {
    davUpload: playbook.dav.Upload;
    davPropfind: playbook.dav.Propfind;
    davDelete: playbook.dav.Delete;
    davTrash: playbook.dav.Trash;
}

export const options = ({ files, plays }: { files: File[]; plays: Plays }): Options => {
    return {
        thresholds: files.reduce((acc: { [name: string]: Threshold[] }, c) => {
            acc[`${plays.davUpload.metricTrendName}{asset:${c.unit + c.size.toString()}}`] = [];
            acc[`${plays.davPropfind.metricTrendName}{asset:${c.unit + c.size.toString()}}`] = [];
            acc[`${plays.davDelete.metricTrendName}{asset:${c.unit + c.size.toString()}}`] = [];
            acc[`${plays.davTrash.metricTrendName}{asset:${c.unit + c.size.toString()}}`] = [];
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
    const filesUploaded: { id: string; name: string; fileid: string }[] = [];

    files.forEach((f) => {
        const id = f.unit + f.size.toString();

        const asset = utils.buildAsset({
            name: `${account.login}-dummy.zip`,
            unit: f.unit,
            size: f.size,
        });

        plays.davUpload.exec({
            credential,
            asset,
            userName: account.login,
            tags: { asset: id },
        });

        const propfindOutput = plays.davPropfind.exec({
            credential,
            userName: account.login,
            tags: { asset: id },
            path: asset.name,
            body:
                '<?xml version="1.0"?><d:propfind  xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns"><d:prop><oc:fileid /></d:prop></d:propfind>',
        });

        const fileid = utils
            .parseXML(propfindOutput.response.body)
            .getElementsByTagName('oc:fileid')[0]
            .childNodes[0].textContent?.split('!')
            .pop();

        if (!fileid) {
            throw new Error('no fileid');
        }

        filesUploaded.push({ id, name: asset.name, fileid: fileid });
    });

    filesUploaded.forEach((f) => {
        plays.davDelete.exec({
            credential,
            userName: account.login,
            path: f.name,
            tags: { asset: f.id },
        });
    });

    filesUploaded.forEach((f) => {
        plays.davTrash.exec({
            credential,
            userName: account.login,
            fileid: f.fileid,
            tags: { asset: f.id },
        });
    });
};
