import { Options } from 'k6/options';
import { times } from 'lodash';

import { auth, defaults, playbook, types, utils, k6 } from '../../../../../../lib';
import { default as propfind, options as propfindOptions } from './deep.lib';

// put 1000 files into nested dirs and run a 'PROPFIND' through API
const files: {
    size: number;
    unit: types.AssetUnit;
}[] = times(1000, () => ({ size: 1, unit: 'KB' }));
const authFactory = new auth(utils.buildAccount({ login: defaults.ACCOUNTS.EINSTEIN }));
const plays = {
    davUpload: new playbook.dav.Upload(),
    davCreate: new playbook.dav.Create(),
    davPropfind: new playbook.dav.Propfind(),
    davDelete: new playbook.dav.Delete(),
};
export const options: Options = k6.options({
    tags: {
        test_id: 'propfind-deep',
        issue_url: 'github.com/owncloud/ocis/issues/1018'
    },
    ...propfindOptions({ plays, files }),
})

export default (): void => propfind({ files, plays, credential: authFactory.credential, account: authFactory.account });
