import { Adapter } from '@ownclouders/k6-tdk/lib/auth';
import { Client, Platform } from '@ownclouders/k6-tdk/lib/client';
import { check, platformGuard, queryJson, queryXml, randomString } from '@ownclouders/k6-tdk/lib/utils';
import { Checkers } from 'k6';
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
    actorRoot: string;
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
  assets: {
    folderCount: parseInt(__ENV.ASSETS_FOLDER_COUNT, 10) || 2,
    textDocumentCount: parseInt(__ENV.ASSETS_TEXT_DOCUMENT_COUNT, 10) || 2
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

  const actorData = times(options.vus || 1, () => {
    const [actorLogin, actorPassword] = [randomString(), randomString()]
    adminClient.user.createUser({ userLogin: actorLogin, userPassword: actorPassword });
    adminClient.user.enableUser({ userLogin: actorLogin })

    const actorClient = new Client({ ...settings, userLogin: actorLogin, userPassword: actorPassword });
    const getMyDrivesResponse = actorClient.me.getMyDrives();
    const [actorRoot = actorLogin] = queryJson("$.value[?(@.driveType === 'personal')].id", getMyDrivesResponse?.body);

    return {
      actorLogin,
      actorPassword,
      actorRoot
    }
  })

  return {
    adminData: {
      adminLogin: settings.admin.login,
      adminPassword: settings.admin.password
    },
    actorData
  }
}

export default function actor({ adminData, actorData }: Environment): void {
  const { actorLogin, actorPassword, actorRoot } = actorData[exec.vu.idInTest - 1];
  const actorClient = new Client({ ...settings, userLogin: actorLogin, userPassword: actorPassword });
  const adminClient = new Client({ ...settings, userLogin: adminData.adminLogin, userPassword: adminData.adminPassword });
  const defer: (() => void)[] = [];
  const checks: Checkers<unknown> = {};
  const guards = { ...platformGuard(settings.platform) }
  const tagFolders = times(settings.assets.folderCount, () => {
    return randomString();
  });
  const tagTextDocuments = times(settings.assets.textDocumentCount, () => {
    return [randomString(), '.txt'].join('');
  });
  const getOrCreateTag = (name) => {
    if (guards.isOwnCloudInfiniteScale) {
      return name;
    }

    const getTagsResponse = actorClient.tag.getTags();
    const [{ 'oc:id': id } = { 'oc:id': '' }] = queryXml(`$..[?(@['oc:display-name'] === '${name}')]`, getTagsResponse?.body);

    if (id) {
      return id;
    }

    const { headers: { 'Content-Location': contentLocation } } =
    actorClient.tag.createTag({ tagName: name }) || { headers: { 'Content-Location': '' } };

    return contentLocation.split('/').pop();
  };

  [...tagFolders, ...tagTextDocuments].forEach((resourceName) => {
    const isFile = resourceName.match(/\.[0-9a-z]+$/i);
    const resourceTag = getOrCreateTag(randomString());

    if (isFile) {
      actorClient.resource.uploadResource({ root: actorRoot, resourcePath: resourceName, resourceBytes: randomString() });
    } else {
      actorClient.resource.createResource({ root: actorRoot, resourcePath: resourceName });
    }

    defer.push(() => {
      adminClient.tag.deleteTag({ tag: resourceTag })
      actorClient.resource.deleteResource({ root: actorRoot, resourcePath: resourceName });
    });

    const propfindResponseInitial = actorClient.resource.getResourceProperties({ root: actorRoot, resourcePath: resourceName });
    const [resourceId] = queryXml("$..['oc:fileid']", propfindResponseInitial.body);
    actorClient.tag.addTagToResource({ resourceId, tag: resourceTag });

    const getTag = () => {
      let tags = [];
      const response = actorClient.tag.getTagsForResource({ resourceId, root: actorRoot, resourcePath: resourceName })

      if (guards.isOwnCloudServer || guards.isNextcloud) {
        tags = queryXml(`$..[?(@['oc:id'] === '${resourceTag}')]['oc:id']`, response.body);
      } else {
        tags = queryXml("$..['oc:tags']", response.body);
      }

      return tags[0];
    };

    const resourceTagAfterAssign = getTag();
    checks['test -> tag - assign'] = () => {
      return resourceTagAfterAssign === resourceTag;
    };

    actorClient.tag.removeTagFromResource({ resourceId, tag: resourceTag });
    const resourceTagAfterUnassign = getTag();
    checks['test -> tag - unassign'] = () => {
      return resourceTagAfterUnassign === undefined;
    };
  });

  defer.forEach((d) => {
    d();
  });

  check({ val: undefined }, checks);
}

export function teardown({ adminData, actorData }: Environment): void {
  const adminClient = new Client({ ...settings, userLogin: adminData.adminLogin, userPassword: adminData.adminPassword });

  actorData.forEach(({ actorLogin }) => {
    adminClient.user.deleteUser({ userLogin: actorLogin });
  });
}

