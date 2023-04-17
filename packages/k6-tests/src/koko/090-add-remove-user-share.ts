import { Platform } from '@ownclouders/k6-tdk';
import { Adapter } from '@ownclouders/k6-tdk/lib/auth';
import { Client } from '@ownclouders/k6-tdk/lib/client';
import { Permission, ShareType } from '@ownclouders/k6-tdk/lib/endpoints';
import { check, queryJson, queryXml, randomString } from '@ownclouders/k6-tdk/lib/utils';
import exec from 'k6/execution';
import { Options } from 'k6/options';
import { times } from 'lodash';

interface Environment {
  adminData: {
    adminLogin: string;
    adminPassword: string;
  };
  actorData: {
    actorLogin: string;
    actorPassword: string;
    shareFolder: string;
    shareReceivers: {
      users: { userLogin: string; userPassword: string }[],
    };
  }[];
}

/**/
const settings = {
  baseUrl: __ENV.BASE_URL || 'https://localhost:9200',
  authAdapter: __ENV.AUTH_ADAPTER === Adapter.basicAuth ? Adapter.basicAuth : Adapter.openIDConnect,
  platform: Platform[__ENV.PLATFORM] || Platform.ownCloudInfiniteScale,
  admin: {
    login: __ENV.ADMIN_LOGIN || 'admin',
    password: __ENV.ADMIN_PASSWORD || 'admin'
  },
  shareReceivers: {
    userCount: parseInt(__ENV.SHARE_RECEIVERS_USER_COUNT, 10) || 35
  },
  k6: {
    vus: 1,
    insecureSkipTLSVerify: true
  }
};

/**/
export const options: Options = settings.k6;

export function setup(): Environment {
  const adminClient = new Client({ ...settings, userLogin: settings.admin.login, userPassword: settings.admin.password });

  const shareReceiverUsers = times(settings.shareReceivers.userCount, () => {
    const [userLogin, userPassword] = [randomString(), randomString()]
    adminClient.user.createUser({ userLogin, userPassword });
    adminClient.user.enableUser({ userLogin })

    return { userLogin, userPassword };
  });

  const actorData = times(options.vus || 1, () => {
    const [actorLogin, actorPassword] = [randomString(), randomString()]
    adminClient.user.createUser({ userLogin: actorLogin, userPassword: actorPassword });
    adminClient.user.enableUser({ userLogin: actorLogin })

    const actorClient = new Client({ ...settings, userLogin: actorLogin, userPassword: actorPassword });
    const getMyDrivesResponse = actorClient.me.getMyDrives();
    const [actorRoot = actorLogin] = queryJson("$.value[?(@.driveType === 'personal')].id", getMyDrivesResponse?.body);


    const shareFolder = randomString();
    actorClient.resource.createResource({ root: actorRoot, resourcePath: shareFolder });

    return {
      actorLogin,
      actorPassword,
      shareFolder,
      shareReceivers:{
        users: shareReceiverUsers
      }
    }
  });

  return {
    adminData: {
      adminLogin: settings.admin.login,
      adminPassword: settings.admin.password
    },
    actorData
  }
}

export default function actor({ actorData }: Environment): void {
  const { actorLogin, actorPassword, shareReceivers, shareFolder } = actorData[exec.vu.idInTest - 1];
  const actorClient = new Client({ ...settings, userLogin: actorLogin, userPassword: actorPassword });
  const defer: (() => void)[] = [];
  shareReceivers.users.forEach(({ userLogin }) => {
    const createShareResponse = actorClient.share.createShare({
      shareResourcePath: shareFolder,
      shareReceiver: userLogin,
      shareType: ShareType.user,
      shareReceiverPermission: Permission.all
    });
    const [foundShareRecipient] = queryXml('ocs.data.share_with', createShareResponse.body);

    check({ val: undefined }, {
      'test -> share received - match': () => {
        return foundShareRecipient === userLogin;
      }
    });

    defer.push(() => {
      const [shareId] = queryXml('ocs.data.id', createShareResponse.body);
      actorClient.share.deleteShare({ shareId });
    });
  });

  defer.forEach((d) => {
    d();
  });
}

export function teardown({ adminData, actorData }: Environment): void {
  const adminClient = new Client({ ...settings, userLogin: adminData.adminLogin, userPassword: adminData.adminPassword });

  actorData.forEach(({ actorLogin, shareReceivers: { users } }) => {
    adminClient.user.deleteUser({ userLogin: actorLogin });

    users.forEach((user) => {
      return adminClient.user.deleteUser(user);
    });
  });
}

