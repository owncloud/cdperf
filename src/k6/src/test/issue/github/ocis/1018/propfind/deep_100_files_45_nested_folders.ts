import { Options } from 'k6/options';
import { times } from 'lodash';

import { auth, defaults, k6, types, utils } from '../../../../../../lib';
import { default as propfind, options as propfindOptions } from './shared.lib';

// put 1000 files into nested dirs and run a 'PROPFIND' through API
const files: {
    size: number;
    unit: types.AssetUnit;
}[] = times(100, () => ({ size: 1, unit: 'KB' }));
const authFactory = new auth(utils.buildAccount({ login: defaults.ACCOUNTS.EINSTEIN }));
export const options: Options = k6.options({
    tags: {
        test_id: 'propfind-deep',
        issue_url: 'github.com/owncloud/ocis/issues/1018',
    },
    ...propfindOptions({ files }),
});

export default (): void =>
    propfind({ files, depth: 45, credential: authFactory.credential, account: authFactory.account });
