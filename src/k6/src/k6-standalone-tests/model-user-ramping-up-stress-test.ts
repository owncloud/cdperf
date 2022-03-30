import { auth, defaults, playbook, types, utils } from '../lib';
import { sleep } from 'k6';

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


const TargetBaseVUS = parseInt(__ENV.TARGET_BASE_VUS) || 100;
// NOTE: this also defines the number of user accounts created
const TargetMaxVUS = parseInt(__ENV.TARGET_MAX_VUS) || 1000;

const DefaultPassword = __ENV.DEFAULT_K6_USER_PASSWORD || Math.random().toString(16).substring(2, 8);
const AccountPrefix = "k6-user";
const TearDownCoolDownTime = 60;
const MinIterationDurationMillies = 5000;

const WarmupDuration = 60; // seconds
const RunDuration = 60; // seconds
const RampupDuration = 120; // seconds
const StressDuration = 180; // seconds
const RecoverDuration = 60; // seconds
const NormalizeDuration = 60; // seconds

export function setup(): void {
  console.log("Generating ".concat(TargetMaxVUS.toString()).concat(" users"))
  for (var i = 0; i < TargetMaxVUS; i++) {
    var res = Create.exec({
      userName: AccountPrefix.concat(i.toString()),
      password: DefaultPassword,
      email: AccountPrefix.concat(i.toString()).concat("@example.com"),
      credential: adminAuthFactory.credential
    })
    if (res.status != 200) {
      console.log(res.status.toString().concat(" ").concat(res.error))
    }
    if (i % 50 == 0) {
      sleep(1);
    }
  }
  console.log("done")
}

export function teardown(): void {
  sleep(TearDownCoolDownTime)
  console.log("Deleting ".concat(TargetMaxVUS.toString()).concat(" users"))
  for (var i = 0; i < TargetMaxVUS; i++) {
    var res = Delete.exec({
      userName: AccountPrefix.concat(i.toString()),
      credential: adminAuthFactory.credential
    })
    if (res.status != 200) {
      console.log(
        res.status.toString().concat(" ").concat(res.error).concat(" for ").concat(AccountPrefix).concat(i.toString()))
    }
    if (i % 50 == 0) {
      sleep(1);
    }
  }
  console.log("done")
}

export const options = {
  tags: {
    test_id: 'model-user-ramping-up-stress-test',
  },
  setupTimeout: (TargetMaxVUS * 2).toString().concat('s'),
  teardownTimeout: (TargetMaxVUS * 2 + TearDownCoolDownTime).toString().concat('s'),
  scenarios: {
    warmup: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: WarmupDuration.toString().concat("s"), target: TargetBaseVUS },
      ],
      gracefulRampDown: '0s',
      tags: { metric_tag: 'warmup' },
    },
    run: {
      executor: 'constant-vus',
      vus: TargetBaseVUS,
      startTime: WarmupDuration.toString().concat("s"),
      duration: RunDuration.toString().concat("s"),
      tags: { metric_tag: 'run' },
    },
    rampup: {
      executor: 'ramping-vus',
      startVUs: 0,
      startTime: (WarmupDuration + RunDuration).toString().concat("s"),
      stages: [
        { duration: RampupDuration.toString().concat("s"), target: TargetMaxVUS },
      ],
      gracefulRampDown: '0s',
      tags: { metric_tag: 'rampup' },
    },
    stress: {
      executor: 'constant-vus',
      vus: TargetMaxVUS,
      startTime: (WarmupDuration + RunDuration + RampupDuration).toString().concat("s"),
      duration: StressDuration.toString().concat("s"),
      tags: { metric_tag: 'stress' },
    },
    recover: {
      executor: 'ramping-vus',
      startTime: (WarmupDuration + RunDuration + RampupDuration + StressDuration).toString().concat("s"),
      startVUs: TargetMaxVUS,
      stages: [
        { duration: RecoverDuration.toString().concat("s"), target: TargetBaseVUS },
      ],
      gracefulRampDown: '30s',
      tags: { metric_tag: 'recover' },
    },
    normalize: {
      executor: 'constant-vus',
      vus: TargetBaseVUS,
      startTime: (WarmupDuration + RunDuration + RampupDuration + StressDuration + RecoverDuration).toString().concat("s"),
      duration: NormalizeDuration.toString().concat("s"),
      tags: { metric_tag: 'normalize' },
    },
  },
};

export default (): void => {

  // using modulo here, k6 counts up the VU numbers for each process run in each scenario,
  // resulting in ids > TargetMaxVUS
  const userName = AccountPrefix.concat((__VU % TargetMaxVUS).toString())
  const loggedInUser = {
    name: userName,
    credential: new auth({
      login: userName,
      password: DefaultPassword
    }).credential
  };

  const startTime = Date.now();

  plays.davCreate.exec({
    credential: loggedInUser.credential,
    path: "foobar",
    userName: loggedInUser.name
  });

  const asset = utils.buildAsset({
    ...file,
    name: 'dummy.zip',
  });

  plays.davUpload.exec({
    asset: asset,
    credential: loggedInUser.credential,
    userName: loggedInUser.name,
    path: "foobar/dummy.zip",
  });

  plays.davMove.exec({
    credential: loggedInUser.credential,
    userName: loggedInUser.name,
    path: "foobar/dummy.zip",
    destination: "foobar/dummy-new.zip",
  });

  plays.davDelete.exec({
    credential: loggedInUser.credential,
    userName: loggedInUser.name,
    path: "foobar",
  });

  plays.davPropfind.exec({
    credential: loggedInUser.credential,
    userName: loggedInUser.name,
    path: "", // home folder
  });

  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - startTime < MinIterationDurationMillies);
}
