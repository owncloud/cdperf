import { Platform } from '@ownclouders/k6-tdk/lib/values'
import { expect, test } from 'vitest'

import { TestRootType } from '@/values'

import { getTestRoot } from './root'

test.each([
  {
    v: {
      platform: Platform.ownCloudInfiniteScale,
      resourceType: TestRootType.space,
      userLogin: 'any-user',
      resourceName: 'any-resource',
      isOwner: false
    },
    expected: { root: 'project-id', path: '' }
  },
  {
    v: {
      platform: Platform.ownCloudInfiniteScale,
      resourceType: TestRootType.directory,
      userLogin: 'any-user',
      resourceName: 'any-resource',
      isOwner: false
    },
    expected: { root: 'mountpoint-id', path: '' }
  },
  {
    v: {
      platform: Platform.ownCloudInfiniteScale,
      resourceType: TestRootType.directory,
      userLogin: 'any-user',
      resourceName: 'any-resource',
      isOwner: true
    },
    expected: { root: 'personal-id', path: 'any-resource' }
  },
  {
    v: {
      platform: Platform.ownCloudServer,
      resourceType: TestRootType.directory,
      userLogin: 'any-user',
      resourceName: 'any-resource',
      isOwner: true
    },
    expected: { root: 'any-user', path: 'any-resource' }
  },
  {
    v: {
      platform: Platform.ownCloudServer,
      resourceType: TestRootType.space,
      userLogin: 'any-user',
      resourceName: 'any-resource',
      isOwner: true
    },
    expected: { root: 'any-user', path: 'any-resource' }
  },
  {
    v: {
      platform: Platform.ownCloudServer,
      resourceType: TestRootType.space,
      userLogin: 'any-user',
      resourceName: 'any-resource',
      isOwner: false
    },
    expected: { root: 'any-user', path: 'any-resource' }
  },
  {
    v: {
      platform: Platform.ownCloudServer,
      resourceType: TestRootType.directory,
      userLogin: 'any-user',
      resourceName: 'any-resource',
      isOwner: false
    },
    expected: { root: 'any-user', path: 'any-resource' }
  }
])('getTestRoot($v)', async ({ v: { platform, resourceType, isOwner, resourceName, userLogin }, expected }) => {
  const client = {
    me: {
      getMyDrives: () => {
        return {
          body: {
            value: [
              {
                driveAlias: `project/${resourceName}`,
                id: 'project-id'
              },
              {
                driveAlias: `mountpoint/${resourceName}`,
                id: 'mountpoint-id'
              },
              {
                driveAlias: `personal/${userLogin}`,
                id: 'personal-id'
              }
            ]
          }
        }
      }
    }
  } as any

  const rp = await getTestRoot({
    client,
    platform,
    resourceType,
    isOwner,
    userLogin,
    resourceName
  })

  expect(rp).toMatchObject(expected)
})
