import { fail } from 'k6';
import { Options } from 'k6/options';

import * as cdperfDefaults from '../defaults';

export default (options: Options): Options => {
    return {
        insecureSkipTLSVerify: true,
        iterations: 3,
        vus: 3,
        ...options,
        tags: tags(options.tags || {}),
    };
};

const tags = (tags: { [name: string]: string }): { [name: string]: string } => {
    ['test_id'].forEach((k) => !tags[k] && fail(`${k} tag can't be blank`));

    return {
        ...tags,
        cloud_id: tags['cloud_id'] || cdperfDefaults.ENV.CLOUD_ID,
        cloud_vendor: tags['cloud_vendor'] || cdperfDefaults.ENV.CLOUD_VENDOR,
        cloud_host: tags['cloud_host'] || cdperfDefaults.ENV.CLOUD_HOST,
        test_id: tags['test_id'].replace(/_/g, '-'),
    };
};
