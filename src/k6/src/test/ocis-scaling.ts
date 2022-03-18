import { Options } from 'k6/options';

import { times } from 'lodash';

import { auth, defaults, k6, playbook, types, utils } from  '../lib';
import http from 'k6/http';

import { sleep } from 'k6';

import exec from 'k6/execution';

const file: {
  size: number;
  unit: types.AssetUnit;
} = {
  size: 10,
  unit: 'KB',
};

const adminAuthFactory = new auth(utils.buildAccount({ login: defaults.ACCOUNTS.ADMIN }));
const plays = {
    davCreate: new playbook.dav.Create(),
    davUpload: new playbook.dav.Upload(),
    davMove: new playbook.dav.Move(),
    davDelete: new playbook.dav.Delete(),
    davPropfind: new playbook.dav.Propfind(),
};

export const options = {
    tags: {
      test_id: 'kube-cluster-loadtesting',
    },
    discardResponseBodies: true,
    thresholds: {
      http_req_failed: ['rate<0.01'], // http errors should be less than 1%
      http_req_duration: ['p(95)<200'], // 95% of requests should be below 200ms
    },
    scenarios: {
        warmup: {
          executor: 'ramping-vus',
          startVUs: 0,
          stages: [
            { duration: '60s', target: 100 },
          ],
          gracefulRampDown: '0s',
          tags: { metric_tag: 'warmup'},
        },
        run: {
          executor: 'constant-vus',
          vus: 100,
          startTime: '60s',
          duration: '60s',
          tags: { metric_tag: 'run'},
        },
        rampup: {
          executor: 'ramping-vus',
          startVUs: 0,
          startTime: '120s',
          stages: [
            { duration: '60s', target: 1000 },
          ],
          gracefulRampDown: '0s',
          tags: { metric_tag: 'rampup'},
        },
        stress: {
          executor: 'constant-vus',
          vus: 1000,
          startTime: '180s',
          duration: '60s',
          tags: { metric_tag: 'stress'},
        },
        recover: {
          executor: 'ramping-vus',
          startTime: '240s',
          startVUs: 1000,
          stages: [
            { duration: '60s', target: 100 },
          ],
          gracefulRampDown: '30s',
          tags: { metric_tag: 'recover'},
        },
        normalize: {
          executor: 'constant-vus',
          vus: 100,
          startTime: '300s',
          duration: '60s',
          tags: { metric_tag: 'normalize'},
        },
      },
};

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
    //console.log(exec.vu.idInTest);
    //http.get('https://ocis.ocis-kube.owncloud.works')
    //sleep(1)
}
