import { Options } from 'k6/options';

import { auth, defaults, k6, playbook, types, utils } from  '../lib';
import http from 'k6/http';

import { sleep } from 'k6';

import exec from 'k6/execution';

export const options = {
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

export default function(): void {
    //console.log(exec.vu.idInTest);
    http.get('https://ocis.ocis-kube.owncloud.works')
    sleep(1)
}
