//import { Options } from 'k6/options';

import { times } from 'lodash';

import { auth, defaults, playbook, types, utils } from  '../lib';
//import http from 'k6/http';

import { sleep } from 'k6';

//import exec from 'k6/execution';

import { Create, Delete } from '../lib/api/users';

const file: {
  size: number;
  unit: types.AssetUnit;
} = {
  size: 1024,
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

const DefaultPassword = "foobar";
const TargetBaseVUS = 10
const TargetMaxVUS = 100  // NOTE: this also defines the number of user accounts created
const AccountPrefix = "user"
const TearDownCoolDownTime = 60

export function setup (): void {
  console.log("Generating ".concat(TargetMaxVUS.toString()).concat(" users"))
  for(var i=0;i<TargetMaxVUS; i++){
    var res = Create.exec({
      userName: AccountPrefix.concat(i.toString()),
      password: DefaultPassword,
      email: AccountPrefix.concat(i.toString()).concat("@example.com"),
      credential: adminAuthFactory.credential
    })
    if(res.status != 200) {
      console.log(res.status.toString().concat(" ").concat(res.error))
    }
    if(i%50==0) {
      sleep(1);
    }
  }
  console.log("done")
}

export function teardown (): void {
  sleep(TearDownCoolDownTime)
  console.log("Deleting ".concat(TargetMaxVUS.toString()).concat(" users"))
  for(var i=0;i<TargetMaxVUS; i++){
    var res = Delete.exec({
      userName: AccountPrefix.concat(i.toString()),
      credential: adminAuthFactory.credential
    })
    if(res.status != 200) {
      console.log(
        res.status.toString().concat(" ").concat(res.error).concat(" for ").concat(AccountPrefix).concat(i.toString()))
    }
    if(i%50==0) {
      sleep(1);
    }
  }
  console.log("done")
} 

export const options = {
    setupTimeout: (TargetMaxVUS*2).toString().concat('s'),
    teardownTimeout: (TargetMaxVUS*2+TearDownCoolDownTime).toString().concat('s'),
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
            { duration: '60s', target: TargetBaseVUS },
          ],
          gracefulRampDown: '0s',
          tags: { metric_tag: 'warmup'},
        },
        run: {
          executor: 'constant-vus',
          vus: TargetBaseVUS,
          startTime: '60s',
          duration: '60s',
          tags: { metric_tag: 'run'},
        },
        rampup: {
          executor: 'ramping-vus',
          startVUs: 0,
          startTime: '120s',
          stages: [
            { duration: '60s', target: TargetMaxVUS },
          ],
          gracefulRampDown: '0s',
          tags: { metric_tag: 'rampup'},
        },
        stress: {
          executor: 'constant-vus',
          vus: TargetMaxVUS,
          startTime: '180s',
          duration: '60s',
          tags: { metric_tag: 'stress'},
        },
        recover: {
          executor: 'ramping-vus',
          startTime: '240s',
          startVUs: TargetMaxVUS,
          stages: [
            { duration: '60s', target: TargetBaseVUS },
          ],
          gracefulRampDown: '30s',
          tags: { metric_tag: 'recover'},
        },
        normalize: {
          executor: 'constant-vus',
          vus: TargetBaseVUS,
          startTime: '300s',
          duration: '60s',
          tags: { metric_tag: 'normalize'},
        },
      },
};

export default (): void => {
    //const loggedInUser = {
    //    name: adminAuthFactory.account.login,
    //    password: adminAuthFactory.account.password,
    //    credential: adminAuthFactory.credential,
    //};

    // using modulo here, k6 counts up the VU numbers for each process run in each scenario,
    // resulting in ids > TargetMaxVUS
    const userName = AccountPrefix.concat((__VU%TargetMaxVUS).toString())
    const loggedInUser = {
      name:  userName,
      password: DefaultPassword,
      credential: new auth({
                    login: userName,
                    password: DefaultPassword
                  }).credential
    };
    
    const folders = times(50, (i) => `VU-${__VU}-ITER-${__ITER}-I-${i}`).reduce((acc: string[][], tlf, i) => {
      acc.push([tlf, ...times(5, (i) => `D-${i + 1}`)]);
      acc[i].forEach((_, ci) => {
          plays.davCreate.exec({
              credential: loggedInUser.credential,
              path: acc[i].slice(0, ci + 1).join('/'),
              userName: loggedInUser.name,
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
                credential: loggedInUser.credential,
                userName: loggedInUser.name,
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
                credential: loggedInUser.credential,
                userName: loggedInUser.name,
                path,
                destination,
            });

            plays.davPropfind.exec({
                credential: loggedInUser.credential,
                userName: loggedInUser.name,
                path: destination,
            });

            g[g.length - 1 - i] = newName;
        });
    });

    folders.forEach((g) => {
        plays.davDelete.exec({
            credential: loggedInUser.credential,
            userName: loggedInUser.name,
            path: g[0],
        });
    });
}
